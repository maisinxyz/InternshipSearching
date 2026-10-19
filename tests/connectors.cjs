// Reuse the dependency-free TypeScript test loader and browsing regressions.
require('./browsing.cjs');
const assert = require('node:assert/strict');
const { parseGithub, collectionItems } = require('../src/server/connectors.ts');
const { sourceLocation } = require('../src/domain/source-location.ts');
const { safeFetch } = require('../src/server/safe-fetch.ts');
const { normalize, ingest } = require('../src/server/ingestion.ts');
const {
  sourcePresets,
  setupSourcePresets,
} = require('../src/server/source-presets.ts');

const listings = parseGithub(
  `| Company | Role | Location | Apply | Date |
| --- | --- | --- | --- | --- |
| [Example](https://example.com) | Software Intern | Toronto, Ontario | <a href="https://example.com/jobs/one?utm_source=test&amp;job=1"><img alt="Apply"></a> | Aug 21 |
| ↳ | Hardware Co-op | Vancouver, BC | [Apply](https://example.com/jobs/two) | Oct 13, 2026 |
| Elsewhere | Software Intern | Boston, MA | [Apply](https://example.com/jobs/three) | Sep 12 |
| Remote | Software Intern | Remote | [Apply](https://example.com/jobs/four) | Sep 12 |
| Experienced | Software Engineer | Toronto, Ontario | [Apply](https://example.com/jobs/five) | Sep 12 |`,
  'https://github.com/example/repo/blob/dev/README.md',
);
assert.equal(listings.length, 5);
assert.equal(listings[0].company, 'Example');
assert.equal(listings[1].company, 'Example');
assert.equal(listings[0].url, 'https://example.com/jobs/one?job=1');
assert.equal(listings[0].posted, null, 'A yearless date must remain unknown');
assert.equal(
  listings[1].posted,
  null,
  'Repository dates are not employer publication dates',
);
assert.equal(sourceLocation('Toronto, Ontario').country, 'Canada');
assert.equal(
  sourceLocation('Vancouver, British Columbia, Canada').province,
  'BC',
);
assert.equal(sourceLocation('Boston, MA').country, 'United States');
assert.equal(sourceLocation('Remote').country, null);
assert.equal(
  collectionItems(listings, { canadaOnly: true, studentOnly: true }).length,
  2,
);
assert.equal(
  collectionItems(listings, { canadaOnly: false, studentOnly: false }).length,
  5,
);
const mixedRemote = parseGithub(
  `| Company | Role | Location | Apply | Date |
| --- | --- | --- | --- | --- |
| Example | Software Intern | Toronto, Canada<br>Remote | [Apply](https://example.com/mixed) | Oct 18 |`,
  'https://github.com/example/list',
);
assert.equal(
  normalize(mixedRemote[0], 'test-owner', 'github-test', 'Example').opportunity
    .remoteBC.status,
  'not-stated',
);
assert.equal(
  collectionItems(
    [
      {
        ...listings[0],
        title: 'Finance Intern - Technical Accounting & Treasury',
      },
    ],
    { technicalOnly: true },
  ).length,
  0,
);
assert.equal(
  collectionItems([{ ...listings[0], title: 'Technical Support Intern' }], {
    technicalOnly: true,
  }).length,
  1,
);
console.log(
  'Passed: GitHub HTML/Markdown links, company continuation, date precision, country classification and explicit collection scope.',
);

(async () => {
  const listing = {
    identity: 'notice-test',
    title: 'Student assistant',
    company: 'Example',
    url: null,
    sourceUrl: null,
    text: 'Support the team.',
    locations: ['Toronto, Ontario'],
    posted: null,
    updated: null,
    attribution: 'Software reuse license',
  };
  const incoming = normalize(
    listing,
    'test-owner',
    'test-connector',
    'Example',
  );
  assert.deepEqual(
    incoming.disciplines,
    ['unknown'],
    'License wording must not classify a role',
  );
  assert.ok(incoming.snapshots[0].original_text.includes(listing.attribution));
  const dated = normalize(
    {
      ...listing,
      title: 'Embedded Software Engineering Intern (January 2027) (4 months)',
    },
    'test-owner',
    'test-connector',
    'Example',
  );
  assert.equal(dated.duration.months, 4);
  assert.equal(dated.term.label, 'January 2027');
  assert.equal(
    dated.term.start_date,
    null,
    'A named month does not establish a start day',
  );
  assert.ok(
    dated.evidence
      .filter((e) => ['term', 'duration'].includes(e.field))
      .every((e) => dated.snapshots[0].original_text.includes(e.quote)),
  );
  const firstSeen = '2026-01-01T00:00:00Z';
  let row = {
    id: incoming.id,
    revision: 1,
    data: { ...incoming, first_seen_at: firstSeen, disciplines: ['software'] },
  };
  const repo = {
    list: async () => [row],
    put: async (kind, id, data, revision) => {
      assert.equal(id, row.id);
      assert.equal(revision, row.revision);
      row = { id, revision: revision + 1, data };
      return row;
    },
  };
  await ingest(repo, incoming);
  await ingest(repo, incoming);
  assert.equal(row.data.first_seen_at, firstSeen);
  assert.equal(row.data.snapshots.length, 1);
  assert.deepEqual(row.data.disciplines, ['unknown']);
  const existingSource = {
    id: 'custom-tenstorrent',
    data: {
      ...sourcePresets[0].data,
      name: 'My employer board',
      state: 'paused',
    },
  };
  const rows = [existingSource];
  const sources = {
    list: async () => rows,
    put: async (kind, id, data) => {
      assert.ok(!rows.some((row) => row.id === id));
      return { id, data };
    },
  };
  const firstSetup = await setupSourcePresets(sources);
  const secondSetup = await setupSourcePresets(sources);
  assert.equal(firstSetup.created.length, sourcePresets.length - 1);
  assert.equal(secondSetup.created.length, 0);
  assert.equal(rows.length, sourcePresets.length);
  assert.equal(
    rows[0],
    existingSource,
    'Existing names and paused state must be retained',
  );
  console.log(
    'Passed: notice isolation and repeated ingestion preserve discovery date, identity and snapshot count.',
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

if (process.argv.includes('--live')) {
  (async () => {
    for (const url of [
      'https://boards-api.greenhouse.io/v1/boards/tenstorrentuniversity/jobs?content=true',
      'https://api.lever.co/v0/postings/kepler?mode=json',
      'https://boards-api.greenhouse.io/v1/boards/asteraearlycareer2027/jobs?content=true',
      'https://boards-api.greenhouse.io/v1/boards/momentenergy/jobs?content=true',
      'https://api.lever.co/v0/postings/waabi?mode=json',
      'https://api.ashbyhq.com/posting-api/job-board/1password?includeCompensation=true',
      'https://api.github.com/repos/vanshb03/Summer2027-Internships/contents/README.md',
    ]) {
      const response = await safeFetch(url);
      assert.equal(response.status, 200);
      const data = JSON.parse(response.text);
      assert.ok(
        Array.isArray(data) ||
          Array.isArray(data.jobs) ||
          data.encoding === 'base64',
      );
      if (url.includes('ashbyhq')) {
        const { parseAshby } = require('../src/server/connectors.ts');
        assert.ok(parseAshby(data, '1Password').length);
      }
      console.log(
        'Verified pinned public fetch:',
        new URL(url).hostname,
        new URL(url).pathname,
      );
    }
  })().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

assert.equal(
  collectionItems([{ ...listings[0], title: 'Business Development Intern' }], {
    technicalOnly: true,
  }).length,
  0,
);
