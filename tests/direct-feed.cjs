require('./browsing.cjs');
const assert = require('node:assert/strict');
const {
  schemas,
  connectorSchema,
  filtersSchema,
} = require('../src/domain/workspace.ts');
const {
  parseAshby,
  syncConnector,
  collectionItems,
} = require('../src/server/connectors.ts');
const fetcher = require('../src/server/safe-fetch.ts');
const { normalize, extractSalary } = require('../src/server/ingestion.ts');
const {
  extractOpportunity,
  opportunityView,
  relocationBudget,
} = require('../src/domain/opportunity.ts');
const { sourceHealth } = require('../src/domain/collection.ts');
const {
  schedulerAuthorized,
  runDueSources,
} = require('../src/server/scheduler.ts');
const { DeskError } = require('../src/server/auth.ts');
const { matches } = require('../src/domain/search.ts');
function memory() {
  const rows = new Map();
  return {
    auth: { owner: 'test-owner' },
    rows,
    async list(kind) {
      return [...rows.values()].filter((r) => r.kind === kind);
    },
    async get(kind, id) {
      return rows.get(`${kind}:${id}`) || null;
    },
    async acquire() {
      return true;
    },
    async put(kind, id, data, revision = 0) {
      const key = `${kind}:${id}`,
        old = rows.get(key);
      assert.equal(
        old?.revision || 0,
        revision,
        'optimistic revisions must match',
      );
      const row = {
        kind,
        id,
        data: schemas[kind].parse(data),
        revision: revision + 1,
        owner_id: 'test-owner',
        created_at: old?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      rows.set(key, row);
      return row;
    },
  };
}
const listing = {
  identity: '1',
  title: 'Engineering Intern',
  company: 'Example',
  url: 'https://example.com/jobs/1',
  sourceUrl: 'https://example.com/jobs/1',
  text: 'Firmware engineering.',
  locations: ['Vancouver, BC, Canada'],
  posted: null,
  updated: null,
};
(async () => {
  const remote = parseAshby(
    {
      jobs: [
        {
          id: 'a',
          title: 'Data associate',
          isListed: true,
          jobUrl: 'https://example.com/a',
          applyUrl: 'https://example.com/a',
          descriptionPlain: 'Remote within Canada.',
          location: 'Remote - Canada',
          workplaceType: 'Remote',
          employmentType: 'Intern',
          publishedAt: '2026-10-18T10:00:00Z',
        },
        {
          id: 'b',
          title: 'Hidden',
          isListed: false,
          jobUrl: 'https://example.com/b',
          applyUrl: 'https://example.com/b',
          descriptionPlain: 'Internal.',
        },
      ],
    },
    'Example',
  );
  assert.equal(remote.length, 1);
  assert.equal(remote[0].posted, null);
  assert.equal(remote[0].republished, '2026-10-18T10:00:00Z');
  assert.equal(
    collectionItems(remote, { studentOnly: true }).length,
    1,
    'ATS intern type works without intern in title',
  );
  const rjob = normalize(remote[0], 'test-owner', 'ashby', 'Example');
  assert.equal(opportunityView(rjob, 'remote'), true);
  assert.equal(rjob.source_posted_at, null);
  for (const text of [
    'Remote within Canada. You must reside in Ontario.',
    'Remote within Canada, excluding British Columbia.',
  ]) {
    assert.notEqual(
      extractOpportunity(text, [], 'remote').remoteBC.status,
      'supported',
    );
  }
  assert.notEqual(
    extractOpportunity('Remote within the United States only.', [], 'remote')
      .remoteBC.status,
    'supported',
  );
  assert.equal(
    extractOpportunity('Will you require visa sponsorship?', [], 'unknown')
      .sponsorship.status,
    'not-stated',
  );
  const support = extractOpportunity(
    'We cannot provide visa sponsorship. Relocation assistance provided if eligible.',
    [],
    'on-site',
  );
  assert.equal(support.sponsorship.status, 'unsupported');
  assert.equal(support.relocation.status, 'conditional');
  assert.equal(
    extractOpportunity(
      'We provide visa sponsorship. Visa sponsorship is not available.',
      [],
      'on-site',
    ).sponsorship.status,
    'conflicting',
  );
  assert.equal(
    extractOpportunity('Relocation is not offered.', [], 'on-site').relocation
      .status,
    'unsupported',
  );
  const mixed = extractOpportunity(
    'We cannot provide visa sponsorship, but relocation assistance is provided.',
    [],
    'on-site',
  );
  assert.equal(mixed.sponsorship.status, 'unsupported');
  assert.equal(mixed.relocation.status, 'supported');
  const local = normalize(listing, 'test-owner', 'c', 'Example');
  assert.equal(opportunityView(local, 'vancouver'), true);
  assert.equal(opportunityView(local, 'relocation'), false);
  assert.equal(extractSalary('CAD $45/hour - CAD $55/hour.').minimum, 45);
  assert.equal(extractSalary('$45 - $55/hour'), null, 'do not infer currency');
  assert.deepEqual(
    relocationBudget({
      currency: 'CAD',
      months: 4,
      monthlyTakeHome: 5000,
      monthlyRent: 2000,
      monthlyOther: 1000,
      movingCosts: 1000,
      confirmedSupport: 500,
      localTermSavings: 9000,
    }),
    { remaining: 7500, versusLocal: -1500 },
  );
  assert.equal(
    matches(
      { ...local, baseline: true },
      filtersSchema.parse({ freshness: 'discovered-day' }),
      undefined,
      null,
    ),
    false,
  );
  assert.equal(
    matches(
      { ...local, baseline: true },
      filtersSchema.parse({ newOnly: true }),
      undefined,
      '2020-01-01T00:00:00Z',
    ),
    false,
  );
  assert.equal(
    sourceHealth(
      {
        state: 'connected',
        lastSync: '2026-10-18T00:00:00Z',
        error: null,
        intervalMinutes: 5,
      },
      Date.parse('2026-10-18T00:11:00Z'),
    ),
    'Checks overdue',
  );
  assert.equal(schedulerAuthorized(null, 'a'.repeat(32)), false);
  assert.equal(schedulerAuthorized('Bearer nope', 'a'.repeat(32)), false);
  assert.equal(
    schedulerAuthorized('Bearer ' + 'a'.repeat(32), 'a'.repeat(32)),
    true,
  );
  assert.equal(schedulerAuthorized('Bearer short', 'short'), false);
  assert.equal(fetcher.retryAfterMs('120'), 120000);
  assert.equal(
    fetcher.retryAfterMs(
      'Sun, 18 Oct 2026 01:00:00 GMT',
      Date.parse('2026-10-18T00:00:00Z'),
    ),
    3600000,
  );
  const repo = memory();
  await repo.put(
    'connector',
    'board',
    connectorSchema.parse({
      type: 'greenhouse',
      name: 'Example',
      state: 'connected',
      config: { board: 'example', studentOnly: true },
    }),
  );
  let upstream = Array.from({ length: 35 }, (_, i) => ({
    id: i + 1,
    title: 'Firmware Intern ' + i,
    absolute_url: `https://example.com/jobs/${i + 1}`,
    content: 'Firmware. CAD $45/hour - CAD $55/hour.',
    location: { name: 'Vancouver, BC, Canada' },
    first_published: '2026-10-17T10:00:00Z',
    updated_at: '2026-10-18T10:00:00Z',
  }));
  let calls = 0;
  fetcher.safeFetch = async () => {
    calls++;
    return {
      text: JSON.stringify({ jobs: upstream }),
      etag: 'one',
      status: 200,
    };
  };
  let run = await syncConnector(repo, 'board');
  assert.equal(run.remaining, true);
  assert.equal((await repo.list('job')).length, 30);
  upstream = [
    { ...upstream[0], id: 999, absolute_url: 'https://example.com/jobs/999' },
    ...upstream.slice().reverse(),
  ];
  run = await syncConnector(repo, 'board');
  assert.equal(run.remaining, false);
  assert.equal(calls, 1, 'continuation uses the saved batch');
  assert.equal((await repo.list('job')).length, 35);
  assert.equal(
    (await repo.list('job')).every((j) => j.data.baseline),
    true,
  );
  const before = (await repo.list('job'))[0];
  await repo.put('state', before.id, {
    job_id: before.id,
    saved: true,
    hidden: false,
    viewed_at: null,
    applied_at: null,
  });
  await syncConnector(repo, 'board');
  await syncConnector(repo, 'board');
  assert.equal((await repo.list('job')).length, 36);
  assert.equal(
    (await repo.list('job')).find((j) => j.data.requisition_id === '999').data
      .baseline,
    false,
  );
  const after = await repo.get('job', before.id);
  assert.equal(after.data.first_seen_at, before.data.first_seen_at);
  assert.equal(after.data.snapshots.length, 1);
  assert.equal(after.data.source_posted_at.value, '2026-10-17T10:00:00Z');
  assert.equal((await repo.get('state', before.id)).data.saved, true);
  fetcher.safeFetch = async () => {
    throw new DeskError('Rate limit', 429, 600000);
  };
  await assert.rejects(syncConnector(repo, 'board'));
  const failed = await repo.get('connector', 'board');
  assert.ok(Date.parse(failed.data.nextRunAt) >= Date.now() + 590000);
  assert.equal(
    (await repo.list('job')).every((j) => j.data.status === 'open'),
    true,
    'failure must not close jobs',
  );
  assert.equal(
    (await runDueSources(repo)).length,
    0,
    'backoff respected by scheduler',
  );
  const route = require('../src/app/api/sync/route.ts');
  assert.equal(
    (
      await route.POST(
        new Request('http://localhost/api/sync', { method: 'POST' }),
      )
    ).status,
    401,
  );
  assert.equal(
    (await route.GET(new Request('http://localhost/api/sync'))).status,
    401,
  );
  // An interrupted saved batch retries the same item and preserves prior successful rows.
  const interrupted = memory();
  await interrupted.put(
    'connector',
    'board',
    connectorSchema.parse({
      type: 'greenhouse',
      name: 'Example',
      state: 'connected',
      config: { board: 'example' },
    }),
  );
  fetcher.safeFetch = async () => ({
    text: JSON.stringify({ jobs: upstream.slice(0, 4) }),
    etag: 'next',
    status: 200,
  });
  const put = interrupted.put.bind(interrupted);
  let writes = 0;
  interrupted.put = async (kind, ...args) => {
    if (kind === 'job' && ++writes === 2)
      throw new DeskError('Transient storage error', 503);
    return put(kind, ...args);
  };
  await assert.rejects(syncConnector(interrupted, 'board'));
  assert.equal((await interrupted.get('sync', 'active:board')).data.cursor, 1);
  const partial = await interrupted.get('connector', 'board');
  await interrupted.put(
    'connector',
    'board',
    { ...partial.data, nextRunAt: null },
    partial.revision,
  );
  fetcher.safeFetch = async () => {
    throw new Error('Recovery must not refetch changing upstream');
  };
  await syncConnector(interrupted, 'board');
  assert.equal((await interrupted.list('job')).length, 4);
  const paused = await interrupted.get('connector', 'board');
  await interrupted.put(
    'connector',
    'board',
    { ...paused.data, state: 'paused' },
    paused.revision,
  );
  assert.equal((await runDueSources(interrupted, false)).length, 0);
  await assert.rejects(syncConnector(interrupted, 'board'), /Enable/);
  console.log(
    'Passed: Ashby visibility, republication, remote BC restrictions, support evidence, currency, relocation arithmetic, baseline freshness, scheduler auth, stable batches, duplicate ingestion, user state and rate-limit recovery.',
  );
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
