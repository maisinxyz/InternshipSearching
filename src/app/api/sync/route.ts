import { failure, DeskError } from '@/server/auth';
import {
  schedulerAuthorized,
  workerRepository,
  runDueSources,
  schedulerStatus,
} from '@/server/scheduler';
export const runtime = 'nodejs';
export const maxDuration = 60;
export async function POST(request: Request) {
  if (!schedulerAuthorized(request.headers.get('authorization')))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const repo = workerRepository();
    if (!(await repo.acquire('scheduler', 65)))
      throw new DeskError('Scheduled run already active.', 409);
    const old = await repo.get('sync', 'scheduler');
    const run = await repo.put(
      'sync',
      'scheduler',
      {
        connectorId: 'scheduler',
        status: 'running',
        processed: 0,
        cursor: 0,
        error: null,
      },
      old?.revision || 0,
    );
    try {
      const results = await runDueSources(repo);
      await repo.put(
        'sync',
        'scheduler',
        {
          ...run.data,
          status: 'complete',
          processed: results.length,
          error: results.some((r) => 'error' in r)
            ? 'Some boards failed. Check feed coverage.'
            : null,
        },
        run.revision,
      );
      return Response.json(
        { checked: results.length },
        { headers: { 'Cache-Control': 'no-store' } },
      );
    } catch (error) {
      await repo.put(
        'sync',
        'scheduler',
        {
          ...run.data,
          status: 'failed',
          error: 'Scheduled collection failed.',
        },
        run.revision,
      );
      throw error;
    }
  } catch (error) {
    return failure(error);
  }
}

export async function GET(request: Request) {
  if (!schedulerAuthorized(request.headers.get('authorization')))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const status = await schedulerStatus(workerRepository());
    return Response.json(status, {
      status: status.healthy && !status.error ? 200 : 503,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    return failure(error);
  }
}
