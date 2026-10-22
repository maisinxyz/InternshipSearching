import { setTimeout } from 'node:timers/promises';

// Loopback only: the scheduler bearer secret must never go to a supplied host.
const port = Number(process.argv[2] || 3001);
if (!Number.isInteger(port) || port < 1024 || port > 65535)
  throw new Error('Provide a loopback port between 1024 and 65535.');
if (process.env.LOCAL_OPEN_ACCESS !== 'true' || process.env.VERCEL)
  throw new Error(
    'This worker requires the explicitly enabled local workspace.',
  );
const secret = process.env.CRON_SECRET;
if (!secret || secret.length < 32)
  throw new Error(
    'Set CRON_SECRET to at least 32 random characters in .env.local.',
  );

const controller = new AbortController();
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () => controller.abort());
console.log(
  `Local feed worker checking port ${port} every minute. Keep the server running.`,
);
while (!controller.signal.aborted) {
  const started = Date.now();
  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/sync`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${secret}` },
      redirect: 'error',
      signal: AbortSignal.any([controller.signal, AbortSignal.timeout(55000)]),
    });
    if (response.status === 401) {
      console.error(
        'Scheduler authentication failed. Restart the server and worker with the same .env.local.',
      );
      process.exitCode = 1;
      break;
    }
    if (response.status === 409)
      console.log(
        'Another collection run is active; waiting for the next check.',
      );
    else if (!response.ok)
      console.error(
        `Collection returned HTTP ${response.status}; retrying next minute.`,
      );
    else {
      const result = await response.json();
      console.log(
        `${new Date().toISOString()} · checked ${result.checked} sources`,
      );
    }
  } catch {
    if (!controller.signal.aborted)
      console.error(
        'Local server unavailable or check timed out; retrying next minute.',
      );
  }
  await setTimeout(Math.max(1000, 60000 - (Date.now() - started)), undefined, {
    signal: controller.signal,
  }).catch(() => {});
}
