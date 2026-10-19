require('./browsing.cjs');
const assert = require('node:assert/strict');
const { mkdtempSync, rmSync } = require('node:fs');
const { LocalStore } = require('../src/server/local-store.ts');
const { localOpenAccess } = require('../src/server/local-access.ts');
const { session, configured } = require('../src/server/auth.ts');
(async () => {
  const oldFlag = process.env.LOCAL_OPEN_ACCESS,
    oldVercel = process.env.VERCEL;
  try {
    delete process.env.LOCAL_OPEN_ACCESS;
    delete process.env.VERCEL;
    assert.equal(localOpenAccess(), false);
    process.env.LOCAL_OPEN_ACCESS = 'true';
    assert.equal(localOpenAccess(), true);
    assert.equal(configured(), true);
    assert.deepEqual(await session(), {
      token: '',
      owner: 'local-workspace',
      local: true,
    });
    process.env.VERCEL = '1';
    assert.equal(localOpenAccess(), false);
  } finally {
    if (oldFlag === undefined) delete process.env.LOCAL_OPEN_ACCESS;
    else process.env.LOCAL_OPEN_ACCESS = oldFlag;
    if (oldVercel === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = oldVercel;
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
