import 'server-only';
import { sourceLocation } from '@/domain/source-location';

// Only the selected posting's pasted text is parsed; no account requests or cookies.
export function parseMyExperience(text: string) {
  const field = (label: string) => {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return (
      text
        .match(
          new RegExp(
            `(?:^|\\n)[ \\t]*${escaped}:[ \\t]*(?:\\r?\\n[ \\t]*)?([^\\r\\n]+)`,
            'i',
          ),
        )?.[1]
        .trim() || ''
    );
  };
  const heading = text.match(/(?:^|\n)\s*(\d{4,10})\s+-\s+([^\n]+)/);
  const location = field('Job Location City');
  const province = field('Job Location Province/State');
  const country = field('Job Location Country');
  const locations = location
    ? [
        [
          location,
          province &&
          sourceLocation(location).province !==
            sourceLocation(province).province
            ? province
            : '',
          country && !location.toLowerCase().includes(country.toLowerCase())
            ? country
            : '',
        ]
          .filter(Boolean)
          .join(', '),
      ]
    : [];
  const arrangements: Record<string, 'on-site' | 'hybrid' | 'remote'> = {
    onsite: 'on-site',
    'on-site': 'on-site',
    hybrid: 'hybrid',
    remote: 'remote',
  };
  const arrangement = arrangements[field('Work Location Type').toLowerCase()];
  const duration = field('Duration');
  const months = duration.match(/^(\d{1,2})[ -]+months?$/i);
  return {
    postingId: heading?.[1] || '',
    title: field('Job Title') || heading?.[2].trim() || '',
    company: field('Organization'),
    locations,
    locationQuotes: [location, province, country].filter(Boolean),
    arrangement,
    term: field('Term Posted'),
    duration: months
      ? { months: Number(months[1]), original_text: duration }
      : null,
  };
}
