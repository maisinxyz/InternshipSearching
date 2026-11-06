// Board filters: one shape shared by the URL, saved searches and alert matching.

export type Filters = {
  q: string;
  location: string[]; // country names, city names, or "Remote"
  posted: '' | '1' | '3' | '7' | '30'; // days
  major: string[];
  company: string[]; // company slugs
  term: string[];
  size: string[];
  mode: string[]; // remote | hybrid | onsite
  type: string[]; // Internship | Co-op | Part-time
  pay: '' | 'paid';
};

export type JobRow = {
  id: string; company_slug: string; company_name: string; company_size: string | null; industry: string | null;
  title: string; city: string | null; country: string | null; remote: number; places: string; locations: string;
  work_mode: string | null; employment_type: string | null; term: string | null; pay: string | null; pay_text: string | null;
  deadline: string | null; posted_at: string | null; first_seen_at: string; closed_at: string | null;
  summary: string; skills: string; majors: string; url: string; logo: string | null; domain: string | null;
};

export const EMPTY: Filters = { q: '', location: [], posted: '', major: [], company: [], term: [], size: [], mode: [], type: [], pay: '' };
const LISTS = ['location', 'major', 'company', 'term', 'size', 'mode', 'type'] as const;

export function parseFilters(params: URLSearchParams | Record<string, string | string[] | undefined>): Filters {
  const get = (k: string): string[] => {
    if (params instanceof URLSearchParams) return params.getAll(k).flatMap((v) => v.split('|')).filter(Boolean);
    const v = params[k];
    return (Array.isArray(v) ? v : v ? [v] : []).flatMap((x) => x.split('|')).filter(Boolean);
  };
  const posted = get('posted')[0] ?? '';
  return {
    q: (get('q')[0] ?? '').slice(0, 200),
    location: get('location'), major: get('major'), company: get('company'), term: get('term'),
    size: get('size'), mode: get('mode'), type: get('type'),
    posted: (['1', '3', '7', '30'].includes(posted) ? posted : '') as Filters['posted'],
    pay: get('pay')[0] === 'paid' ? 'paid' : '',
  };
}

export function toQuery(f: Filters): string {
  const p = new URLSearchParams();
  if (f.q) p.set('q', f.q);
  for (const k of LISTS) if (f[k].length) p.set(k, f[k].join('|'));
  if (f.posted) p.set('posted', f.posted);
  if (f.pay) p.set('pay', f.pay);
  return p.toString();
}

export function activeCount(f: Filters): number {
  return LISTS.reduce((n, k) => n + f[k].length, 0) + (f.posted ? 1 : 0) + (f.pay ? 1 : 0) + (f.q ? 1 : 0);
}

/** When the posting was published, or when we first saw it if the employer gives no date. */
export const postedTime = (j: Pick<JobRow, 'posted_at' | 'first_seen_at'>) => j.posted_at ?? j.first_seen_at;

export function matches(job: JobRow, f: Filters, at = Date.now()): boolean {
  if (f.q) {
    const hay = `${job.title} ${job.company_name} ${job.locations} ${job.skills} ${job.industry ?? ''}`.toLowerCase();
    if (!f.q.toLowerCase().split(/\s+/).filter(Boolean).every((w) => hay.includes(w))) return false;
  }
  if (f.location.length) {
    const places: { city: string | null; country: string | null; remote: boolean }[] = JSON.parse(job.places);
    const ok = f.location.some((loc) =>
      loc === 'Remote' ? job.remote === 1 || job.work_mode === 'remote' : places.some((p) => p.city === loc || p.country === loc),
    );
    if (!ok) return false;
  }
  if (f.posted && at - Date.parse(postedTime(job)) > Number(f.posted) * 86_400_000) return false;
  if (f.major.length && !f.major.some((m) => (JSON.parse(job.majors) as string[]).includes(m))) return false;
  if (f.company.length && !f.company.includes(job.company_slug)) return false;
  if (f.term.length && !f.term.includes(job.term ?? 'Not specified')) return false;
  if (f.size.length && !f.size.includes(job.company_size ?? '')) return false;
  if (f.mode.length && !f.mode.includes(job.work_mode ?? '')) return false;
  if (f.type.length && !f.type.includes(job.employment_type ?? '')) return false;
  if (f.pay && job.pay !== 'paid') return false;
  return true;
}

export function describe(f: Filters): string {
  const parts = [f.q && `"${f.q}"`, ...f.location, ...f.term, ...f.major, ...f.mode, ...f.type].filter(Boolean);
  return parts.length ? parts.slice(0, 4).join(' · ') : 'All internships';
}
