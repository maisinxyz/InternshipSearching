require('./browsing.cjs');
const assert = require('node:assert/strict');
const { connectorSchema } = require('../src/domain/workspace.ts');
const { importBlockedReason } = require('../src/domain/account-sources.ts');
const {
  previewImport,
  checkImportSource,
  checkImportUrl,
} = require('../src/server/imports.ts');
const { ingest } = require('../src/server/ingestion.ts');

const source = {
  id: 'test-sfu',
  revision: 1,
  data: connectorSchema.parse({
    name: 'My SFU',
    type: 'myexperience',
    state: 'import-only',
    config: {},
  }),
};
assert.match(importBlockedReason(source), /Enable imports/);
assert.throws(() => checkImportSource(source), /Enable imports/);
source.data.config.importsEnabled = true;
assert.equal(importBlockedReason(source), null);
assert.match(
  importBlockedReason({ ...source, data: { ...source.data, state: 'paused' } }),
  /paused/,
);
assert.match(
  importBlockedReason({
    ...source,
    data: { ...source.data, expiresAt: '2020-01-01' },
  }),
  /expiry/,
);
assert.throws(() => checkImportSource(null), /disconnected/);
assert.throws(
  () =>
    checkImportUrl(
      'https://myexperience.sfu.ca/myAccount/co-op/postings.htm',
      '',
    ),
  /paste/,
);
assert.throws(
  () => checkImportUrl('https://cas.sfu.ca/cas/login', 'example'),
  /authentication/,
);
assert.throws(
  () => checkImportUrl('https://app.interninsider.me/jobs/123', ''),
  /employer posting URL/,
);
assert.throws(
  () => checkImportUrl('https://example.com/jobs?ticket=secret', 'example'),
  /session data/,
);
const insider = { ...source, data: { ...source.data, type: 'intern-insider' } };
assert.throws(
  () =>
    checkImportUrl(
      'https://example.com/jobs/one',
      'copied subscription text',
      insider,
    ),
  /without copied/,
);

(async () => {
  // Synthetic selected-posting fixture, never an authenticated source dump.
  const text = `123456 - Firmware Co-op
Job Title:
Firmware Co-op
Organization:
Example Company
Term Posted:
2027 Summer
Job Description:
Develop embedded software using C++ and Python. Always apply through the university portal.
Work Location Type:
Onsite
Job Location City:
Vancouver, BC, Canada
Job Location Province/State:
British Columbia
Job Location Country:
Canada
Duration:
4-month`;
  const input = {
    connectorId: source.id,
    url: 'https://myexperience.sfu.ca/myAccount/co-op/postings.htm',
    text,
  };
  const first = await previewImport(input, 'owner', source);
  assert.equal(first.title, 'Firmware Co-op');
  assert.equal(first.company.name, 'Example Company');
  assert.equal(first.requisition_id, '123456');
  assert.equal(first.term.label, '2027 Summer');
  assert.equal(first.term.start_date, null);
  assert.equal(first.duration.months, 4);
  assert.equal(first.work_arrangement, 'on-site');
  assert.equal(first.locations[0].province, 'BC');
  assert.equal(first.locations[0].original_text, 'Vancouver, BC, Canada');
  assert.equal(first.source_posted_at, null);
  assert.equal(first.salary, null);
  assert.equal(first.sources[0].connector_instance_id, source.id);
  assert.equal(first.sources[0].label, 'My SFU');
  assert.equal(
    first.sources[0].application_url,
    null,
    'A shared portal URL must not identify a job for deduplication',
  );
  assert.ok(
    first.snapshots[0].original_text.includes(
      'Always apply through the university portal.',
    ),
  );
  assert.ok(
    first.evidence.every((e) =>
      first.snapshots[0].original_text.includes(e.quote),
    ),
  );
  await assert.rejects(
    () => previewImport({ ...input, postingId: '999999' }, 'owner', source),
    /does not match/,
  );
  await assert.rejects(
    () => previewImport({ ...input, connectorId: 'other' }, 'owner', source),
    /does not match/,
  );
  const second = await previewImport(
    { ...input, text: text.replace('123456 -', '123457 -') },
    'owner',
    source,
  );
  const rows = new Map();
  const repo = {
    list: async () => [...rows.values()],
    put: async (_, id, data) => {
      const row = { id, data, revision: (rows.get(id)?.revision || 0) + 1 };
      rows.set(id, row);
      return row;
    },
  };
  await ingest(repo, first);
  await ingest(repo, second);
  await ingest(repo, first);
  assert.equal(
    rows.size,
    2,
    'Distinct SFU IDs remain distinct; repeating an import does not duplicate it',
  );
  console.log(
    'Passed: account-source opt-in, pause/expiry/disconnect, URL boundaries, SFU provenance, precise facts and per-posting identity.',
  );
  const liveIndex = process.argv.indexOf('--live');
  if (liveIndex !== -1) {
    const live = await previewImport(
      { connectorId: insider.id, url: process.argv[liveIndex + 1] },
      'test-owner',
      insider,
    );
    console.log(
      'Live employer preview:',
      JSON.stringify({
        title: live.title,
        company: live.company.name,
        locations: live.locations.map((location) => location.original_text),
        characters: live.snapshots[0].original_text.length,
      }),
    );
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
