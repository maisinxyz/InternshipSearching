const fs = require('fs'),
  ts = require(process.cwd() + '/node_modules/typescript'),
  Module = require('module'),
  path = require('path'),
  assert = require('node:assert/strict');
const resolve = Module._resolveFilename;
Module._resolveFilename = function (id, ...args) {
  if (id.startsWith('@/')) id = path.join(process.cwd(), 'src', id.slice(2));
  return resolve.call(this, id, ...args);
};
const load = Module._load;
Module._load = function (id, ...args) {
  if (id === 'server-only') return {};
  return load.call(this, id, ...args);
};
require.extensions['.ts'] = (module, file) =>
  module._compile(
    ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    }).outputText,
    file,
  );
const { normalize } = require(process.cwd() + '/src/server/ingestion.ts');
const { appliedDateFor } = require(
  process.cwd() + '/src/domain/application-state.ts',
);
const { matches } = require(process.cwd() + '/src/domain/search.ts');
const { filtersSchema, defaultRules } = require(
  process.cwd() + '/src/domain/workspace.ts',
);
const job = normalize(
  {
    identity: 'test',
    title: 'Student assistant',
    company: 'Synthetic',
    url: null,
    sourceUrl: null,
    text: 'Support the team.',
    locations: [],
    posted: null,
    updated: null,
  },
  'test-owner',
  null,
  'Test',
);
assert.deepEqual(job.disciplines, ['unknown']);
assert.equal(
  matches(
    job,
    filtersSchema.parse({ disciplines: ['software'] }),
    undefined,
    null,
  ),
  false,
);
const application = { data: { jobId: job.id, appliedAt: '2026-10-14' } };
const state = {
  saved: false,
  hidden: false,
  applied_at: appliedDateFor(job.id, [application]),
};
assert.equal(
  matches(job, filtersSchema.parse({ applied: 'yes' }), state, null),
  true,
);
assert.equal(
  matches(job, filtersSchema.parse({ applied: 'no' }), state, null),
  false,
);
assert.equal(
  appliedDateFor(job.id, [
    { data: { jobId: 'other', appliedAt: '2026-10-14' } },
  ]),
  null,
);
assert.equal(
  appliedDateFor(job.id, [{ data: { jobId: job.id, appliedAt: null } }]),
  null,
);
assert.equal(defaultRules.includes('10 pt'), false);
console.log(
  'Passed: unknown classification, software exclusion, applied/not-applied filters, unrelated/unsubmitted application isolation, master font preservation.',
);
