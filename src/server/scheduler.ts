import 'server-only';
import { timingSafeEqual } from 'node:crypto';
import { config, DeskError } from './auth';
import { Repository } from './repository';
import { syncConnector } from './connectors';
import { isAutomatic } from '@/domain/collection';
import { localOpenAccess, localOwner } from './local-access';

export function schedulerAuthorized(
  header: string | null,
  secret = process.env.CRON_SECRET,
) {
  if (!secret || secret.length < 32 || !header) return false;
  const actual = Buffer.from(header),
    expected = Buffer.from(`Bearer ${secret}`);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
export function workerRepository() {
  if (localOpenAccess())
    return new Repository({ owner: localOwner, token: '', local: true });
  const { owner } = config();
  const token = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!token)
    throw new DeskError(
      'Scheduled collection requires a server credential.',
      503,
    );
  return new Repository({ owner, token }, true);
}
export async function runDueSources(repo: Repository, dueOnly = true) {
  const started = Date.now(),
    results = [];
  const sources = (await repo.list('connector')).filter(
    (s) =>
      isAutomatic(s.data.type) &&
      s.data.state === 'connected' &&
      (!s.data.expiresAt ||
        s.data.expiresAt >= new Date().toISOString().slice(0, 10)) &&
      (!dueOnly ||
        !s.data.nextRunAt ||
        Date.parse(s.data.nextRunAt) <= started),
  );
  sources.sort((a, b) =>
    (a.data.nextRunAt || a.data.lastSync || '').localeCompare(
      b.data.nextRunAt || b.data.lastSync || '',
    ),
  );
  for (const source of sources) {
    if (Date.now() - started > 35000) break;
    try {
      results.push({
        id: source.id,
        ...(await syncConnector(repo, source.id, started + 40000)),
      });
    } catch (error) {
      results.push({
        id: source.id,
        error: error instanceof DeskError ? error.message : 'Check failed.',
      });
    }
  }
  return results;
}
export async function schedulerStatus(repo: Repository) {
  const heartbeat = await repo.get('sync', 'scheduler');
  const lastRun = heartbeat?.updated_at || null;
  return {
    configured: !!(
      process.env.CRON_SECRET &&
      process.env.CRON_SECRET.length >= 32 &&
      (localOpenAccess() || process.env.SUPABASE_SERVICE_ROLE_KEY)
    ),
    lastRun,
    healthy:
      !!lastRun &&
      heartbeat?.data.status === 'complete' &&
      !heartbeat.data.error &&
      Date.now() - Date.parse(lastRun) < 180000,
    error: heartbeat?.data.error || null,
  };
}
