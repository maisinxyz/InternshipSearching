import type { RecordRow } from './workspace';

export const accountSources = {
  myexperience: {
    name: 'SFU MyExperience',
    loginUrl: 'https://www.sfu.ca/coop/myexperience.html',
    guideUrl: 'https://www.sfu.ca/coop/myexperience/guide/co-op-students.html',
    description:
      'Sign in with your SFU computing ID on SFU’s site. Import a selected posting by pasting its description. Co-op access depends on your seeking status. An automatic feed is not verified.',
  },
  'intern-insider': {
    name: 'Intern Insider',
    loginUrl: 'https://app.interninsider.me/signin',
    guideUrl: 'https://interninsider.me/terms',
    description:
      'Use your subscription on Intern Insider’s site, then import the employer’s public posting link here. Its terms prohibit automated collection without permission. Subscription syncing is not available.',
  },
} as const;

export function accountSource(type: string) {
  return type === 'myexperience' || type === 'intern-insider'
    ? accountSources[type]
    : null;
}

export function importBlockedReason(
  source: RecordRow<'connector'>,
  now = new Date(),
): string | null {
  if (source.data.state === 'paused')
    return 'Imports from this source are paused.';
  if (
    source.data.expiresAt &&
    source.data.expiresAt < now.toISOString().slice(0, 10)
  )
    return 'The configured access expiry has passed. Update it before importing.';
  if (accountSource(source.data.type) && !source.data.config.importsEnabled)
    return 'Enable imports for this source first.';
  if (!['connected', 'import-only'].includes(source.data.state))
    return 'This source is unavailable for imports.';
  return null;
}
