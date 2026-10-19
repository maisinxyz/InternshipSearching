import type { Arrangement, Discipline, Job, SourceDate } from '@/domain/job';

export const disciplineLabels: Record<Discipline, string> = {
  'data-ai': 'Data & AI',
  'it-cloud': 'IT & cloud',
  'technical-product': 'Technical product',
  embedded: 'Embedded',
  electronics: 'Electronics',
  robotics: 'Robotics',
  controls: 'Controls',
  hardware: 'Hardware',
  mechatronics: 'Mechatronics',
  mechanical: 'Mechanical',
  'qa-test': 'QA / test',
  'manufacturing-automation': 'Manufacturing / automation',
  unknown: 'Discipline not classified',
  software: 'Software',
  firmware: 'Firmware',
  electrical: 'Electrical',
};
export const arrangementLabels: Record<Arrangement, string> = {
  'on-site': 'On-site',
  hybrid: 'Hybrid',
  remote: 'Remote',
  unknown: 'Arrangement not stated',
};

export function dateLabel(date: SourceDate | null): string {
  if (!date) return 'Not stated';
  return new Intl.DateTimeFormat('en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: date.precision === 'day' ? 'UTC' : 'America/Vancouver',
  }).format(
    new Date(date.precision === 'day' ? `${date.value}T12:00:00Z` : date.value),
  );
}

export function feedDate(job: Job): {
  date: SourceDate;
  basis: 'Posted' | 'Discovered';
} {
  return job.source_posted_at && job.posting_date_trustworthy
    ? { date: job.source_posted_at, basis: 'Posted' }
    : {
        date: { value: job.first_seen_at, precision: 'instant' },
        basis: 'Discovered',
      };
}

export function newestFirst(a: Job, b: Job): number {
  // Day-only records form a deterministic bucket within their calendar day.
  // No time is invented, and source_updated_at never affects feed order.
  const aDate = feedDate(a).date;
  const bDate = feedDate(b).date;
  const key = (date: SourceDate) =>
    date.precision === 'instant'
      ? new Date(date.value).toISOString()
      : date.value;
  return key(bDate).localeCompare(key(aDate)) || a.id.localeCompare(b.id);
}

export function salaryLabel(job: Job): string {
  if (!job.salary) return 'Not stated';
  const { minimum, maximum, currency, interval } = job.salary;
  const number = (value: number) =>
    new Intl.NumberFormat('en-CA', {
      minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(value);
  return `${currency} $${number(minimum)}${maximum !== null && maximum !== minimum ? `–$${number(maximum)}` : ''} / ${interval}`;
}

export function locationLabel(job: Job): string {
  return (
    job.locations.map((location) => location.original_text).join(' · ') ||
    'Not stated'
  );
}
