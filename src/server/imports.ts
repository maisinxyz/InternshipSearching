import 'server-only';
import { z } from 'zod';
import { safeFetch, readable, publicUrl } from './safe-fetch';
import { normalize, hash, canonicalUrl, type Listing } from './ingestion';
import { provider } from './ai';
import { DeskError } from './auth';
import type { RecordRow } from '@/domain/workspace';
import { importBlockedReason } from '@/domain/account-sources';
import { parseMyExperience } from './myexperience-import';
import { publicEmployerPosting } from './employer-import';
const quoted = z.object({ value: z.string(), quote: z.string().min(1) });
const extractedSchema = z.object({
  title: quoted.nullable(),
  company: quoted.nullable(),
  locations: z.array(quoted),
  involves: z.array(quoted),
  technologies: z.array(quoted),
  required: z.array(quoted),
  preferred: z.array(quoted),
  salary: z
    .object({
      minimum: z.number().nonnegative(),
      maximum: z.number().nonnegative().nullable(),
      currency: z.string().length(3),
      interval: z.enum(['hour', 'month', 'year']),
      quote: z.string().min(1),
    })
    .nullable(),
  term: quoted.nullable(),
  duration: z
    .object({ months: z.number().positive(), quote: z.string().min(1) })
    .nullable(),
});
export const importSchema = z.object({
  url: z.string().max(2000).default(''),
  text: z.string().max(150000).default(''),
  title: z.string().max(300).default(''),
  company: z.string().max(300).default(''),
  useAI: z.boolean().default(false),
  connectorId: z.string().min(1).max(200).optional(),
  postingId: z.string().max(100).default(''),
});
export function checkImportSource(source: RecordRow<'connector'> | null) {
  if (!source)
    throw new DeskError(
      'Source disconnected. Add it again before importing.',
      409,
    );
  const blocked = importBlockedReason(source);
  if (blocked) throw new DeskError(blocked, 409);
  return source;
}
export function checkImportUrl(
  url: string | null,
  text: string,
  source?: RecordRow<'connector'>,
) {
  const parsed = url ? new URL(url) : null;
  const insider =
    parsed &&
    (parsed.hostname === 'interninsider.me' ||
      parsed.hostname.endsWith('.interninsider.me'));
  if (insider)
    throw new DeskError(
      'Open this job on Intern Insider yourself, then use its public employer posting URL. Automated access to Intern Insider is not supported.',
      422,
    );
  if (source?.data.type === 'intern-insider' && (!url || text.trim()))
    throw new DeskError(
      'Use the public employer posting URL without copied Intern Insider content.',
      422,
    );
  if (parsed && /(^|\.)(cas|my)\.sfu\.ca$/.test(parsed.hostname))
    throw new DeskError(
      'Use the job posting link, not an SFU authentication page.',
      422,
    );
  if (parsed?.hostname === 'myexperience.sfu.ca' && !text.trim())
    throw new DeskError(
      'Sign in to SFU in your browser, then paste the selected job description here. Co-op Desk does not retrieve your SFU session.',
      422,
    );
  if (
    parsed &&
    [...parsed.searchParams.keys()].some((key) =>
      /^(ticket|token|access_token|refresh_token|password|session|sessionid|jsessionid)$/i.test(
        key,
      ),
    )
  )
    throw new DeskError(
      'This URL contains account or session data. Use a clean posting link.',
      422,
    );
}
export async function previewImport(
  raw: unknown,
  owner: string,
  source?: RecordRow<'connector'>,
) {
  const input = importSchema.parse(raw);
  if (input.connectorId) {
    checkImportSource(source || null);
    if (source?.id !== input.connectorId)
      throw new DeskError('Source does not match this import.');
  }
  let url = input.url ? publicUrl(input.url).href : null;
  checkImportUrl(url, input.text, source);
  let text = input.text;
  let title = input.title,
    company = input.company;
  let locations: string[] = [];
  let posted: string | null = null;
  let updated: string | null = null;
  const sfu =
    source?.data.type === 'myexperience' ? parseMyExperience(text) : null;
  const postingId = input.postingId || sfu?.postingId;
  if (sfu) {
    if (!text.trim())
      throw new DeskError(
        'Paste the selected SFU posting text. Your browser session stays on SFU.',
      );
    if (!postingId || !/^\d{4,10}$/.test(postingId))
      throw new DeskError(
        'Enter the numeric SFU job ID so separate postings remain distinct.',
      );
    if (sfu.postingId && sfu.postingId !== postingId)
      throw new DeskError('The SFU job ID does not match the pasted posting.');
    title ||= sfu.title;
    company ||= sfu.company;
    locations = sfu.locations;
  }
  if (!text && url) {
    const employer = await publicEmployerPosting(url);
    if (employer) {
      text = employer.text;
      title ||= employer.title;
      company ||= employer.company;
      locations = employer.locations;
      updated = employer.updated;
    }
  }
  if (!text && url) {
    const result = await safeFetch(url);
    url = result.url;
    checkImportUrl(url, '', source);
    const html = result.text;
    const blocks = [
      ...html.matchAll(
        /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
      ),
    ];
    let posting: Record<string, unknown> | null = null;
    const find = (v: unknown): void => {
      if (!v || typeof v !== 'object') return;
      if (Array.isArray(v)) {
        v.forEach(find);
        return;
      }
      const r = v as Record<string, unknown>;
      if (r['@type'] === 'JobPosting') posting = r;
      if (r['@graph']) find(r['@graph']);
    };
    for (const block of blocks) {
      try {
        find(JSON.parse(block[1]));
      } catch {
        /* Continue to readable fallback. */
      }
    }
    if (posting) {
      const p = posting as Record<string, unknown>;
      text = readable(String(p.description || ''));
      title = title || String(p.title || '');
      const org = p.hiringOrganization as { name?: string } | undefined;
      company = company || org?.name || '';
      if (
        typeof p.datePosted === 'string' &&
        z.iso.date().safeParse(p.datePosted).success
      )
        posted = p.datePosted;
      const ls = Array.isArray(p.jobLocation) ? p.jobLocation : [p.jobLocation];
      locations = ls.filter(Boolean).map((l) => {
        const a = (l as { address?: Record<string, string> }).address || {};
        return [
          a.streetAddress,
          a.addressLocality,
          a.addressRegion,
          a.addressCountry,
        ]
          .filter(Boolean)
          .join(',');
      });
    } else text = readable(html);
    if (
      text.length < 80 ||
      /enable javascript|verify you are human|sign in to (view|continue)|access denied/i.test(
        text.slice(0, 1000),
      )
    )
      throw new DeskError(
        'This page requires sign-in or browser rendering. Keep the URL and paste the job description.',
        422,
      );
  }
  if (!text.trim())
    throw new DeskError('Enter a public URL or paste the posting.');
  text = text.slice(0, 150000);
  let extracted: z.infer<typeof extractedSchema> | null = null;
  if (input.useAI) {
    extracted = await provider.generate(
      'Extract only facts explicitly present in the posting. Every quote must be an exact nonempty substring of source text; value must be supported by that quote. Null for absent salary, currency, interval, dates, duration and company. Never estimate pay or dates.',
      { text },
      extractedSchema,
    );
    const evidence = [
      extracted.title,
      extracted.company,
      ...extracted.locations,
      ...extracted.involves,
      ...extracted.technologies,
      ...extracted.required,
      ...extracted.preferred,
      extracted.salary,
      extracted.term,
      extracted.duration,
    ].filter(Boolean);
    if (evidence.some((v) => !text.includes(v!.quote)))
      throw new DeskError(
        'Extraction evidence did not match the posting. Review manually or retry.',
        422,
      );
    title = title || extracted.title?.value || '';
    company = company || extracted.company?.value || '';
    locations = extracted.locations.map((l) => l.value);
  }
  if (!title || !company)
    throw new DeskError(
      'Add the role title and company to finish the preview. The retrieved page did not identify them reliably.',
      422,
    );
  const listing: Listing = {
    identity: sfu
      ? `myexperience:${postingId}`
      : url
        ? canonicalUrl(url)
        : hash(`${company}\n${title}\n${text}`),
    title,
    company,
    // SFU's detail tab uses a shared session URL, not a per-job application URL.
    // Matching that URL would incorrectly merge different SFU job IDs.
    url:
      sfu && url && new URL(url).hostname === 'myexperience.sfu.ca'
        ? null
        : url,
    sourceUrl: url,
    text,
    locations,
    posted,
    updated,
    arrangement: sfu?.arrangement,
  };
  const job = normalize(
    listing,
    owner,
    source?.id || null,
    source?.data.name || 'Manual import',
    'import',
  );
  if (sfu) {
    job.requisition_id = postingId!;
    // A term is not a publication date or an exact start date.
    job.term = sfu.term
      ? { label: sfu.term, start_date: null, original_text: sfu.term }
      : job.term;
    job.duration = sfu.duration || job.duration;
    const evidence = [
      ...sfu.locationQuotes.map((quote) => ({
        field: 'location' as const,
        quote,
      })),
      ...(sfu.term ? [{ field: 'term' as const, quote: sfu.term }] : []),
      ...(sfu.duration
        ? [{ field: 'duration' as const, quote: sfu.duration.original_text }]
        : []),
    ];
    for (const item of evidence)
      job.evidence.push({
        id: crypto.randomUUID(),
        owner_id: owner,
        created_at: job.created_at,
        updated_at: job.updated_at,
        snapshot_id: job.snapshots[0].id,
        method: 'deterministic',
        ...item,
      });
  }
  if (extracted) {
    for (const field of [
      'involves',
      'technologies',
      'required',
      'preferred',
    ] as const) {
      job[field] = extracted[field].map((v) => v.value);
      for (const v of extracted[field])
        job.evidence.push({
          id: crypto.randomUUID(),
          owner_id: owner,
          created_at: job.created_at,
          updated_at: job.updated_at,
          field,
          snapshot_id: job.snapshots[0].id,
          quote: v.quote,
          method: 'gemini',
        });
    }
    job.salary = extracted.salary
      ? {
          minimum: extracted.salary.minimum,
          maximum: extracted.salary.maximum,
          currency: extracted.salary.currency,
          interval: extracted.salary.interval,
          original_text: extracted.salary.quote,
          qualification: null,
        }
      : null;
    job.term = extracted.term
      ? {
          label: extracted.term.value,
          start_date: null,
          original_text: extracted.term.quote,
        }
      : null;
    job.duration = extracted.duration
      ? {
          months: extracted.duration.months,
          original_text: extracted.duration.quote,
        }
      : null;
    for (const field of ['salary', 'term', 'duration'] as const) {
      const v = extracted[field];
      if (v)
        job.evidence.push({
          id: crypto.randomUUID(),
          owner_id: owner,
          created_at: job.created_at,
          updated_at: job.updated_at,
          field,
          snapshot_id: job.snapshots[0].id,
          quote: v.quote,
          method: 'gemini',
        });
    }
  }
  return job;
}
