import 'server-only';
import { cookies } from 'next/headers';
import { localOpenAccess, localOwner } from './local-access';
export class DeskError extends Error {
  constructor(
    message: string,
    public status = 400,
    public retryAfterMs?: number,
  ) {
    super(message);
  }
}
export function configured() {
  return (
    localOpenAccess() ||
    !!(
      process.env.SUPABASE_URL &&
      process.env.SUPABASE_ANON_KEY &&
      process.env.OWNER_ID
    )
  );
}
export function config() {
  if (!configured())
    throw new DeskError(
      'Private workspace is not configured. See the setup guide.',
      503,
    );
  return {
    url: process.env.SUPABASE_URL!,
    key: process.env.SUPABASE_ANON_KEY!,
    owner: process.env.OWNER_ID!,
  };
}
export type Session = { token: string; owner: string; local?: boolean };
export async function session(): Promise<Session> {
  if (localOpenAccess()) return { token: '', owner: localOwner, local: true };
  const { url, key, owner } = config();
  const token = (await cookies()).get('desk-session')?.value;
  if (!token) throw new DeskError('Sign in to your private workspace.', 401);
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: key, Authorization: `Bearer ${token}` },
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok)
    throw new DeskError('Your session has expired. Sign in again.', 401);
  const user = await response.json();
  if (user.id !== owner)
    throw new DeskError('This account is not the workspace owner.', 403);
  return { token, owner };
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const expected = new URL(request.url);
  // Next may normalize a loopback request to localhost internally.
  const host = request.headers.get('host');
  if (
    localOpenAccess() &&
    host &&
    ['localhost', '127.0.0.1'].includes(expected.hostname)
  ) {
    try {
      const incoming = new URL(`${expected.protocol}//${host}`);
      if (
        ['localhost', '127.0.0.1'].includes(incoming.hostname) &&
        incoming.port === expected.port &&
        incoming.host === host
      )
        expected.host = incoming.host;
    } catch {
      throw new DeskError('Request origin is not allowed.', 403);
    }
  }
  if (!origin || origin !== expected.origin)
    throw new DeskError('Request origin is not allowed.', 403);
}
export async function body(request: Request, limit = 1500000) {
  if (Number(request.headers.get('content-length') || 0) > limit)
    throw new DeskError('Request is too large.', 413);
  const reader = request.body?.getReader();
  if (!reader) throw new DeskError('A request body is required.');
  let count = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    count += value.byteLength;
    if (count > limit) {
      await reader.cancel();
      throw new DeskError('Request is too large.', 413);
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new DeskError('Invalid JSON.');
  }
}
export function failure(error: unknown) {
  return Response.json(
    {
      error:
        error instanceof DeskError
          ? error.message
          : 'The operation could not finish. Your saved data is unchanged; retry or check setup.',
    },
    { status: error instanceof DeskError ? error.status : 500 },
  );
}
