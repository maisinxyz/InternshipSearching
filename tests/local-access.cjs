require('./browsing.cjs');
const assert = require('node:assert/strict');
const { mkdtempSync, rmSync } = require('node:fs');
const { LocalStore } = require('../src/server/local-store.ts');
const { localOpenAccess } = require('../src/server/local-access.ts');
const { session, configured, sameOrigin } = require('../src/server/auth.ts');
const {
  workerRepository,
  schedulerStatus,
  schedulerAuthorized,
} = require('../src/server/scheduler.ts');
(async () => {
  const oldFlag = process.env.LOCAL_OPEN_ACCESS,
    oldVercel = process.env.VERCEL,
    oldSecret = process.env.CRON_SECRET,
    oldServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  try {
    delete process.env.LOCAL_OPEN_ACCESS;
    delete process.env.VERCEL;
    assert.equal(localOpenAccess(), false);
    process.env.LOCAL_OPEN_ACCESS = 'true';
    assert.equal(localOpenAccess(), true);
    const localRequest = (origin, host = '127.0.0.1:3001') =>
      new Request('http://localhost:3001/api/desk/sync', {
        headers: { origin, host },
      });
    assert.doesNotThrow(() =>
      sameOrigin(localRequest('http://127.0.0.1:3001')),
    );
    assert.throws(
      () => sameOrigin(localRequest('http://example.com:3001')),
      /origin/,
    );
    assert.throws(
      () => sameOrigin(localRequest('http://127.0.0.1:3002')),
      /origin/,
    );
    assert.throws(
      () =>
        sameOrigin(localRequest('http://127.0.0.1:3001', 'example.com:3001')),
      /origin/,
    );
    assert.throws(
      () => sameOrigin(new Request('http://localhost:3001/api/desk/sync')),
      /origin/,
    );
    assert.equal(configured(), true);
    assert.deepEqual(await session(), {
      token: '',
      owner: 'local-workspace',
      local: true,
    });
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    process.env.CRON_SECRET = 'local-test-secret-'.repeat(3);
    assert.deepEqual(workerRepository().auth, {
      token: '',
      owner: 'local-workspace',
      local: true,
    });
    const emptyHeartbeat = { get: async () => null };
    assert.equal((await schedulerStatus(emptyHeartbeat)).configured, true);
    assert.equal((await schedulerStatus(emptyHeartbeat)).healthy, false);
    assert.equal(
      (
        await schedulerStatus({
          get: async () => ({
            updated_at: new Date().toISOString(),
            data: { status: 'complete', error: 'Some boards failed.' },
          }),
        })
      ).healthy,
      false,
    );
    assert.equal(
      schedulerAuthorized(null),
      false,
      'local mode does not bypass scheduler authorization',
    );
    process.env.CRON_SECRET = 'short';
    assert.equal((await schedulerStatus(emptyHeartbeat)).configured, false);
    process.env.VERCEL = '1';
    assert.equal(localOpenAccess(), false);
    assert.throws(
      () => workerRepository(),
      /credential|configured/,
      'hosted mode cannot select the local worker',
    );
  } finally {
    if (oldFlag === undefined) delete process.env.LOCAL_OPEN_ACCESS;
    else process.env.LOCAL_OPEN_ACCESS = oldFlag;
    if (oldVercel === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = oldVercel;
    if (oldSecret === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = oldSecret;
    if (oldServiceKey === undefined)
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    else process.env.SUPABASE_SERVICE_ROLE_KEY = oldServiceKey;
  }
  const dir = mkdtempSync('/private/tmp/desk-local-test-');
  let store = new LocalStore(dir);
  try {
    const saved = store.put(
      'profile',
      'current',
      { name: 'Local test' },
      0,
      'local-workspace',
    );
    assert.equal(saved.revision, 1);
    const other = new LocalStore(dir);
    try {
      assert.equal(other.get('profile', 'current').data.name, 'Local test');
      assert.equal(store.acquire('test', 30), true);
      assert.equal(
        other.acquire('test', 30),
        false,
        'leases span both local servers',
      );
      other.put(
        'profile',
        'current',
        { name: 'Updated' },
        1,
        'local-workspace',
      );
      assert.throws(
        () =>
          store.put(
            'profile',
            'current',
            { name: 'Stale' },
            1,
            'local-workspace',
          ),
        /REVISION_CONFLICT/,
      );
      assert.equal(store.get('profile', 'current').data.name, 'Updated');
      assert.throws(() =>
        store.put(
          'profile',
          'invalid',
          { origin: { latitude: 100 } },
          0,
          'local-workspace',
        ),
      );
      assert.equal(
        store.get('profile', 'invalid'),
        null,
        'failed validation rolls back',
      );
    } finally {
      other.close();
    }
    store.close();
    store = new LocalStore(dir);
    assert.equal(store.list('profile').length, 1);
    assert.equal(
      store.get('profile', 'current').data.name,
      'Updated',
      'restart retains local data',
    );
    store.remove('profile', 'current');
    assert.equal(store.get('profile', 'current'), null);
  } finally {
    store.close();
    rmSync(dir, { recursive: true });
  }
  console.log(
    'Passed: opt-in access, hosted protection, no-cookie local session, persistence, shared leases, revision conflicts and rollback.',
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
if (process.argv.includes('--live')) {
  (async () => {
    for (const port of [3000, 3001]) {
      const root = `http://127.0.0.1:${port}`;
      const page = await fetch(root, { signal: AbortSignal.timeout(30000) });
      assert.equal(page.status, 200);
      const html = await page.text();
      assert.ok(html.includes('Local workspace'));
      assert.ok(!html.includes('Sign out'));
      const login = await fetch(root + '/login', { redirect: 'manual' });
      assert.equal(login.status, 307);
      assert.equal(login.headers.get('location'), '/');
      for (const path of [
        '/sources',
        '/api/desk/workspace',
        '/api/desk/jobs',
      ]) {
        const response = await fetch(root + path, {
          signal: AbortSignal.timeout(30000),
        });
        assert.equal(
          response.status,
          200,
          `${port}${path} opens without cookies`,
        );
        if (path === '/api/desk/workspace')
          assert.ok(Array.isArray((await response.json()).connector));
      }
      const blocked = await fetch(root + '/api/desk/delete/connector', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'not-a-real-source' }),
      });
      assert.equal(
        blocked.status,
        403,
        'mutations still require the page origin',
      );
      console.log(
        `Verified local ${port}: open pages and APIs, login redirect, sign-out hidden, cross-origin writes blocked.`,
      );
    }
  })().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
