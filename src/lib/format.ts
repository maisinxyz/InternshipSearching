export function timeAgo(iso: string, at = Date.now()): string {
  const s = Math.max(0, (at - Date.parse(iso)) / 1000);
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))}m ago`;
  if (s < 86_400) return `${Math.round(s / 3600)}h ago`;
  if (s < 86_400 * 30) return `${Math.round(s / 86_400)}d ago`;
  if (s < 86_400 * 365) return `${Math.round(s / (86_400 * 30))}mo ago`;
  return `${Math.round(s / (86_400 * 365))}y ago`;
}

/** "Posted 3d ago" when the employer published a date; "Found 3d ago" when we only know when we first saw it. */
export function postedLabel(j: { posted_at: string | null; first_seen_at: string }): string {
  return j.posted_at ? `Posted ${timeAgo(j.posted_at)}` : `Found ${timeAgo(j.first_seen_at)}`;
}

export function placeLabel(locationsJson: string, max = 2): string {
  const list: string[] = JSON.parse(locationsJson);
  if (!list.length) return 'Location not specified';
  return list.length > max ? `${list.slice(0, max).join(' · ')} +${list.length - max}` : list.join(' · ');
}

export const MODE_LABEL: Record<string, string> = { remote: 'Remote', hybrid: 'Hybrid', onsite: 'On-site' };

export function formatDate(isoDate: string): string {
  // Date-only values render without timezone shifts.
  const [y, m, d] = isoDate.slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}
