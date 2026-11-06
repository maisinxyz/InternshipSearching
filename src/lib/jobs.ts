import 'server-only';
import { db } from './db';
import { JOB_SELECT } from './collect';
import { MAJORS } from './taxonomy';
import { COMPANY_SIZES } from './sources';
import { matches, postedTime, type Filters, type JobRow } from './search';

export type JobDetail = JobRow & { description: string; qualifications: string; deadline: string | null };

export function openJobs(): JobRow[] {
  return db().prepare(`${JOB_SELECT} WHERE j.closed_at IS NULL`).all() as JobRow[];
}

export function searchJobs(f: Filters) {
  const all = openJobs();
  const results = all.filter((j) => matches(j, f)).sort((a, b) => postedTime(b).localeCompare(postedTime(a)));
  return { results, total: all.length };
}

export function getJob(jobId: string): JobDetail | null {
  return (db().prepare(`${JOB_SELECT} WHERE j.id = ?`).get(jobId) as JobDetail | undefined) ?? null;
}

export function facets(all = openJobs()) {
  const count = (values: (string | null)[]) => {
    const m = new Map<string, number>();
    for (const v of values) if (v) m.set(v, (m.get(v) ?? 0) + 1);
    return [...m].sort((a, b) => b[1] - a[1]);
  };
  const places = all.flatMap((j) => JSON.parse(j.places) as { city: string | null; country: string | null }[]);
  const companies = new Map(all.map((j) => [j.company_slug, j.company_name]));
  return {
    countries: count(places.map((p) => p.country)),
    cities: count(places.map((p) => p.city)).filter(([, n]) => n >= 2).slice(0, 30),
    companies: count(all.map((j) => j.company_slug)).map(([slug, n]) => ({ slug, name: companies.get(slug)!, n })),
    terms: count(all.map((j) => j.term ?? 'Not specified')),
    majors: Object.keys(MAJORS),
    sizes: COMPANY_SIZES,
    remote: all.filter((j) => j.remote || j.work_mode === 'remote').length,
  };
}

export function isNew(j: Pick<JobRow, 'posted_at' | 'first_seen_at'>) {
  return Date.now() - Date.parse(postedTime(j)) < 3 * 86_400_000;
}

export function savedIds(userId: string): Set<string> {
  return new Set((db().prepare('SELECT job_id FROM saved_jobs WHERE user_id = ?').all(userId) as { job_id: string }[]).map((r) => r.job_id));
}

export function stats() {
  const all = openJobs();
  const dayAgo = Date.now() - 86_400_000;
  return {
    open: all.length,
    today: all.filter((j) => Date.parse(postedTime(j)) > dayAgo).length,
    companies: new Set(all.map((j) => j.company_slug)).size,
    cities: facets(all).cities.slice(0, 16),
  };
}
