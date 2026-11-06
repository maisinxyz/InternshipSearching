// Collects internships from public employer boards into SQLite, closes postings that
// disappeared, and records alert notifications for saved searches with new matches.
// Imported by the Next app and by scripts/collect.ts (plain Node), so: relative imports only.
import { existsSync } from 'node:fs';
import { db, id, now } from './db.ts';
import { SOURCE_SEEDS, type SourceType } from './sources.ts';
import {
  deadlineOf, employmentTypeOf, isInternship, majorsOf, parsePlace, payOf, qualificationsOf, skillsOf, slugify,
  summaryOf, termOf, workModeOf, type Place,
} from './taxonomy.ts';
import { matches, parseFilters, type JobRow } from './search.ts';

export type Listing = {
  identity: string; title: string; url: string; text: string; locations: string[];
  posted: string | null; employmentType?: string | null; workplace?: string | null; compensation?: string | null;
};

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", apos: "'", nbsp: ' ', mdash: '—', ndash: '–', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', hellip: '…', bull: '•', middot: '·' };
export function htmlToText(html: string): string {
  let s = html;
  for (let i = 0; i < 2 && /&lt;|&gt;/.test(s); i++) s = s.replace(/&(amp|lt|gt|quot|#39|apos|nbsp);/g, (_, e) => ENTITIES[e]);
  return s
    .replace(/<\s*(script|style)[^>]*>[\s\S]*?<\/\s*\1>/gi, '')
    .replace(/<li[^>]*>/gi, '\n- ')
    .replace(/<\/(p|div|h\d|ul|ol|li|tr)>|<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&([a-z]+|#39);/g, (m, e) => ENTITIES[e] ?? m)
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n\n')
    .trim();
}

async function getJson(url: string): Promise<unknown> {
  const res = await fetch(url, { headers: { 'user-agent': 'InternExternal/0.1 (+job board aggregator)' }, signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

type Gh = { jobs: { id: number; title: string; absolute_url: string; content?: string; location?: { name: string }; first_published?: string; updated_at?: string }[] };
type Lv = { id: string; text: string; hostedUrl: string; descriptionPlain?: string; additionalPlain?: string; lists?: { text: string; content: string }[]; categories?: { location?: string; allLocations?: string[]; commitment?: string }; workplaceType?: string; createdAt?: number }[];
type Ab = { jobs: { id: string; title: string; jobUrl: string; descriptionPlain?: string; descriptionHtml?: string; location?: string; secondaryLocations?: { location: string }[]; publishedAt?: string; employmentType?: string; workplaceType?: string; isRemote?: boolean; isListed?: boolean; compensation?: { compensationTierSummary?: string } }[] };

export async function fetchBoard(type: SourceType, board: string): Promise<Listing[]> {
  if (type === 'greenhouse') {
    const data = (await getJson(`https://boards-api.greenhouse.io/v1/boards/${board}/jobs?content=true`)) as Gh;
    return data.jobs.map((j) => ({
      identity: String(j.id), title: j.title, url: j.absolute_url, text: htmlToText(j.content ?? ''),
      locations: j.location?.name ? [...new Set(j.location.name.split(/;\s*|\s+\|\s+/))] : [],
      posted: j.first_published ?? null,
    }));
  }
  if (type === 'lever') {
    const data = (await getJson(`https://api.lever.co/v0/postings/${board}?mode=json`)) as Lv;
    return data.map((j) => ({
      identity: j.id, title: j.text, url: j.hostedUrl,
      text: [j.descriptionPlain, ...(j.lists ?? []).map((l) => `${l.text}\n${htmlToText(l.content)}`), j.additionalPlain].filter(Boolean).join('\n\n'),
      locations: j.categories?.allLocations ?? (j.categories?.location ? [j.categories.location] : []),
      posted: j.createdAt ? new Date(j.createdAt).toISOString() : null,
      employmentType: j.categories?.commitment ?? null, workplace: j.workplaceType ?? null,
    }));
  }
  const data = (await getJson(`https://api.ashbyhq.com/posting-api/job-board/${board}?includeCompensation=true`)) as Ab;
  return data.jobs.filter((j) => j.isListed !== false).map((j) => ({
    identity: j.id, title: j.title, url: j.jobUrl,
    text: j.descriptionPlain ?? htmlToText(j.descriptionHtml ?? ''),
    locations: [j.location, ...(j.secondaryLocations ?? []).map((l) => l.location)].filter((x): x is string => Boolean(x)),
    posted: j.publishedAt ?? null, employmentType: j.employmentType ?? null,
    workplace: j.isRemote ? 'remote' : (j.workplaceType ?? null), compensation: j.compensation?.compensationTierSummary ?? null,
  }));
}

export function normalize(l: Listing) {
  const places: Place[] = (l.locations.length ? l.locations : ['Not specified']).map(parsePlace);
  const primary = places.find((p) => p.country) ?? places[0];
  const pay = l.compensation ? { pay: 'paid' as const, payText: l.compensation } : payOf(l.text);
  return {
    title: l.title.trim(), url: l.url, locations: l.locations, places,
    country: primary.country, city: primary.city, remote: places.some((p) => p.remote) ? 1 : 0,
    work_mode: workModeOf(l.text, places, l.workplace), employment_type: employmentTypeOf(l.title, l.text) ?? (/intern/i.test(l.employmentType ?? '') ? 'Internship' : null),
    term: termOf(l.title, l.text), pay: pay.pay, pay_text: pay.payText, deadline: deadlineOf(l.text),
    posted_at: l.posted, description: l.text, summary: summaryOf(l.text),
    skills: skillsOf(`${l.title}\n${l.text}`), majors: majorsOf(l.title, l.text), qualifications: qualificationsOf(l.text),
  };
}

export function seedSources() {
  const conn = db();
  const upCompany = conn.prepare(`INSERT INTO companies (slug, name, domain, industry, size, logo) VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET name = excluded.name, domain = excluded.domain, industry = excluded.industry, size = excluded.size, logo = excluded.logo`);
  const upSource = conn.prepare(`INSERT INTO sources (id, company_slug, type, board) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO NOTHING`);
  for (const s of SOURCE_SEEDS) {
    const slug = slugify(s.name);
    upCompany.run(slug, s.name, s.domain, s.industry, s.size, existsSync(`public/logos/${slug}.svg`) ? `/logos/${slug}.svg` : null);
    upSource.run(`${s.type}:${s.board}`, slug, s.type, s.board);
  }
}

type SourceRow = { id: string; company_slug: string; type: SourceType; board: string; interval_min: number; last_run_at: string | null };

export async function collectSource(src: SourceRow): Promise<{ found: number; added: number }> {
  const conn = db();
  const at = now();
  try {
    const listings = (await fetchBoard(src.type, src.board)).filter((l) => isInternship(l.title, l.employmentType));
    const existing = new Set((conn.prepare('SELECT id FROM jobs WHERE source_id = ?').all(src.id) as { id: string }[]).map((r) => r.id));
    const upsert = conn.prepare(`INSERT INTO jobs (id, source_id, company_slug, title, url, locations, places, country, city, remote, work_mode,
      employment_type, term, pay, pay_text, deadline, posted_at, first_seen_at, last_seen_at, description, summary, skills, majors, qualifications)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET title = excluded.title, url = excluded.url, locations = excluded.locations, places = excluded.places,
      country = excluded.country, city = excluded.city, remote = excluded.remote, work_mode = excluded.work_mode,
      employment_type = excluded.employment_type, term = excluded.term, pay = excluded.pay, pay_text = excluded.pay_text,
      deadline = excluded.deadline, posted_at = COALESCE(excluded.posted_at, jobs.posted_at), last_seen_at = excluded.last_seen_at,
      closed_at = NULL, description = excluded.description, summary = excluded.summary, skills = excluded.skills,
      majors = excluded.majors, qualifications = excluded.qualifications`);
    const seen = new Set<string>();
    let added = 0;
    conn.exec('BEGIN');
    for (const l of listings) {
      const jobId = `${src.id}:${l.identity}`;
      if (seen.has(jobId)) continue;
      seen.add(jobId);
      if (!existing.has(jobId)) added++;
      const n = normalize(l);
      upsert.run(jobId, src.id, src.company_slug, n.title, n.url, JSON.stringify(n.locations), JSON.stringify(n.places), n.country, n.city,
        n.remote, n.work_mode, n.employment_type, n.term, n.pay, n.pay_text, n.deadline, n.posted_at, at, at, n.description, n.summary,
        JSON.stringify(n.skills), JSON.stringify(n.majors), JSON.stringify(n.qualifications));
    }
    const close = conn.prepare('UPDATE jobs SET closed_at = ? WHERE id = ? AND closed_at IS NULL');
    for (const old of existing) if (!seen.has(old)) close.run(at, old);
    conn.prepare("UPDATE sources SET last_run_at = ?, last_status = 'ok', last_error = NULL, last_count = ? WHERE id = ?").run(at, seen.size, src.id);
    conn.exec('COMMIT');
    return { found: seen.size, added };
  } catch (e) {
    if (conn.isTransaction) conn.exec('ROLLBACK');
    conn.prepare("UPDATE sources SET last_run_at = ?, last_status = 'error', last_error = ? WHERE id = ?").run(at, String((e as Error).message).slice(0, 500), src.id);
    throw e;
  }
}

export const JOB_SELECT = `SELECT j.*, c.name AS company_name, c.size AS company_size, c.industry, c.logo, c.domain
  FROM jobs j JOIN companies c ON c.slug = j.company_slug`;

/** Create in-app notifications for saved searches with alerts on; returns how many were created. */
export function matchAlerts(): number {
  const conn = db();
  const searches = conn.prepare("SELECT * FROM saved_searches WHERE alerts != 'off'").all() as { id: string; user_id: string; query: string; last_checked_at: string }[];
  const insert = conn.prepare('INSERT OR IGNORE INTO notifications (id, user_id, saved_search_id, job_id, created_at) VALUES (?, ?, ?, ?, ?)');
  const fresh = conn.prepare(`${JOB_SELECT} WHERE j.closed_at IS NULL AND j.first_seen_at > ?`);
  let created = 0;
  const at = now();
  for (const s of searches) {
    const filters = parseFilters(new URLSearchParams(s.query));
    for (const job of fresh.all(s.last_checked_at) as JobRow[]) {
      if (matches(job, filters)) created += Number(insert.run(id(), s.user_id, s.id, job.id, at).changes);
    }
    conn.prepare('UPDATE saved_searches SET last_checked_at = ? WHERE id = ?').run(at, s.id);
  }
  return created;
}

/** Collect every source whose interval has elapsed (or all, with force). */
export async function collectDue(force = false, log: (m: string) => void = () => {}) {
  seedSources();
  const conn = db();
  const all = conn.prepare('SELECT * FROM sources WHERE enabled = 1').all() as SourceRow[];
  const due = all.filter((s) => force || !s.last_run_at || Date.now() - Date.parse(s.last_run_at) >= s.interval_min * 60_000);
  let added = 0, failed = 0;
  // Small concurrency so we stay polite to each ATS.
  const queue = [...due];
  await Promise.all(Array.from({ length: 6 }, async () => {
    for (let s = queue.shift(); s; s = queue.shift()) {
      try {
        const r = await collectSource(s);
        added += r.added;
        log(`${s.id}: ${r.found} internships (${r.added} new)`);
      } catch (e) {
        failed++;
        log(`${s.id}: failed: ${(e as Error).message}`);
      }
    }
  }));
  const alerts = matchAlerts();
  return { checked: due.length, added, failed, alerts };
}
