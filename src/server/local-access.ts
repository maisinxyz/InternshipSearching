import 'server-only';

// Opt-in for the loopback servers; never enabled on a Vercel deployment.
export function localOpenAccess() {
  return process.env.LOCAL_OPEN_ACCESS === 'true' && !process.env.VERCEL;
}
export const localOwner = 'local-workspace';
