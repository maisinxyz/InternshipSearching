import 'server-only';
import { z } from 'zod';
import { connectorSchema, type RecordRow } from '@/domain/workspace';
import { safeFetch, readable, publicUrl } from './safe-fetch';
import { normalize, ingest, canonicalUrl, type Listing } from './ingestion';
import { Repository } from './repository';
import { DeskError } from './auth';
import { sourceLocation } from '@/domain/source-location';
const adapterVersion = '2';
export const capabilities = {
  github: { scheduled: true, descriptions: false, closure: false },
  greenhouse: { scheduled: true, descriptions: true, closure: false },
  lever: { scheduled: true, descriptions: true, closure: false },
  myexperience: { scheduled: false, descriptions: false, closure: false },
  'intern-insider': { scheduled: false, descriptions: false, closure: false },
  workday: { scheduled: false, descriptions: false, closure: false },
  linkedin: { scheduled: false, descriptions: false, closure: false },
  manual: { scheduled: false, descriptions: false, closure: false },
};
export function validateConnector(input: unknown) {
  const c = connectorSchema.parse(input);
  if (['github', 'greenhouse', 'lever'].includes(c.type)) {
    if (c.type === 'github') {
      if (!/^[\w.-]+\/[\w.-]+$/.test(c.config.repository || ''))
        throw new DeskError('Use an owner/repository GitHub name.');
      if (!c.config.reuseConfirmed)
        throw new DeskError(
          'Review repository reuse terms before enabling collection.',
        );
      if (
        !/^[\w./-]+$/.test(c.config.path || 'README.md') ||
        (c.config.path || '').includes('..')
      )
        throw new DeskError('Invalid repository file path.');
    } else if (!/^[\w-]+$/.test(c.config.board || ''))
      throw new DeskError('Enter the employer board identifier.');
  } else c.state = c.state === 'paused' ? 'paused' : 'import-only';
  return c;
}
export function parseGithub(
  text: string,
  sourceUrl: string,
  licenseNotice = '',
): Listing[] {
  let company = '';
  const listings: Listing[] = [];
  for (const line of text.split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    const cells = line
      .trim()
      .split('|')
      .slice(1, -1)
      .map((x) => x.trim());
    if (
      cells.length < 5 ||
      /company/i.test(cells[0]) ||
      /^[-:]+$/.test(cells[0])
    )
      continue;
    const [name, title, location, apply, date] = cells;
    company = /↳|↪/.test(name)
      ? company
      : readable(name)
          .replace(/\*\*/g, '')
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    if (!company || !title) continue;
    const urls = [...apply.matchAll(/\]\((https?:\/\/[^\s)]+)\)/g)].map(
      (m) => m[1],
    );
    const raw =
      [...apply.matchAll(/<a\b[^>]*href=["'](https?:\/\/[^"']+)["']/gi)]
        .map((m) => m[1])
        .at(0) || urls.at(-1);
    let url: string | null = null;
    try {
      if (raw) url = canonicalUrl(publicUrl(readable(raw)).href);
    } catch {
      continue;
    }
    if (!url) continue;
    let posted: string | null = null;
    const match = date.match(/^([A-Z][a-z]{2}) (\d{1,2}), (20\d{2})$/);
    if (match) {
      const month = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ].indexOf(match[1]);
      if (month >= 0)
        posted = `${match[3]}-${String(month + 1).padStart(2, '0')}-${match[2].padStart(2, '0')}`;
    }
    listings.push({
      identity: url,
      title: readable(title).replace(/\*\*/g, ''),
      company,
      url,
      sourceUrl,
      text: `${company}\n${title}\n${readable(location)}\nSource date: ${date}\nFull description not provided by this repository.`,
      attribution: licenseNotice,
      locations: location
        .replace(/<summary\b[^>]*>[\s\S]*?<\/summary>/gi, '')
        .split(/<\/?br\s*\/?\s*>|\s\/\s/i)
        .map(readable)
        .filter(Boolean),
      posted,
      updated: null,
      arrangement: /remote/i.test(location) ? 'remote' : 'unknown',
      remoteCanada: /remote.*canada/i.test(location) ? true : null,
    });
  }
  if (!listings.length)
    throw new DeskError(
      'Repository table format is unsupported or empty. Use text import; no records were closed.',
    );
  return listings;
}
const ghJob = z.object({
  id: z.number(),
  title: z.string(),
  absolute_url: z.url(),
  content: z.string().optional(),
  updated_at: z.string().optional(),
  location: z.object({ name: z.string() }).optional(),
});
const leverJob = z.object({
  id: z.string(),
  text: z.string(),
  descriptionPlain: z.string().optional(),
  additionalPlain: z.string().optional(),
  lists: z
    .array(z.object({ text: z.string(), content: z.string() }))
    .optional(),
  categories: z
    .object({
      location: z.string().optional(),
      allLocations: z.array(z.string()).optional(),
      commitment: z.string().optional(),
    })
    .optional(),
  hostedUrl: z.url(),
  applyUrl: z.url(),
  workplaceType: z.string().optional(),
});
async function collect(c: RecordRow<'connector'>) {
  const { type, config, etag, cursor } = c.data;
  const headers: Record<string, string> =
    etag && !cursor && c.data.adapterVersion === adapterVersion
      ? { 'If-None-Match': etag }
      : {};
  if (type === 'github') {
    const result = await safeFetch(
      `https://api.github.com/repos/${config.repository}/contents/${(config.path || 'README.md').split('/').map(encodeURIComponent).join('/')}${config.ref ? '?ref=' + encodeURIComponent(config.ref) : ''}`,
      headers,
    );
    if (result.status === 304) return { items: [], etag, unchanged: true };
    const payload = z
      .object({
        encoding: z.literal('base64'),
        content: z.string(),
        html_url: z.url(),
      })
      .parse(JSON.parse(result.text));
    return {
      items: parseGithub(
        Buffer.from(payload.content, 'base64').toString('utf8'),
        payload.html_url,
        config.licenseNotice,
      ),
      etag: result.etag,
      unchanged: false,
    };
  }
  if (type === 'greenhouse') {
    const result = await safeFetch(
      `https://boards-api.greenhouse.io/v1/boards/${config.board}/jobs?content=true`,
      headers,
    );
    if (result.status === 304) return { items: [], etag, unchanged: true };
    const rows = z
      .object({ jobs: z.array(ghJob) })
      .parse(JSON.parse(result.text)).jobs;
    return {
      items: rows.map(
        (j) =>
          ({
            identity: String(j.id),
            title: j.title,
            company: c.data.name,
            url: j.absolute_url,
            sourceUrl: j.absolute_url,
            text: readable(readable(readable(j.content || ''))),
            locations: j.location
              ? [...new Set(j.location.name.split(/;\s*/))]
              : [],
            posted: null,
            updated: j.updated_at || null,
          }) satisfies Listing,
      ),
      etag: result.etag,
      unchanged: false,
    };
  }
  if (type === 'lever') {
    const result = await safeFetch(
      `https://api${config.region === 'eu' ? '.eu' : ''}.lever.co/v0/postings/${config.board}?mode=json`,
      headers,
    );
    if (result.status === 304) return { items: [], etag, unchanged: true };
    const rows = z.array(leverJob).parse(JSON.parse(result.text));
    return {
      items: rows.map(
        (j) =>
          ({
            identity: j.id,
            title: j.text,
            company: c.data.name,
            url: j.applyUrl,
            sourceUrl: j.hostedUrl,
            text: [
              j.descriptionPlain,
              ...(j.lists || []).map(
                (l) => l.text + '\n' + readable(l.content),
              ),
              j.additionalPlain,
            ]
              .filter(Boolean)
              .join('\n\n'),
            locations:
              j.categories?.allLocations ||
              (j.categories?.location ? [j.categories.location] : []),
            posted: null,
            updated: null,
            arrangement:
              j.workplaceType === 'remote'
                ? 'remote'
                : j.workplaceType === 'hybrid'
                  ? 'hybrid'
                  : ['on-site', 'onsite'].includes(j.workplaceType || '')
                    ? 'on-site'
                    : 'unknown',
          }) satisfies Listing,
      ),
      etag: result.etag,
      unchanged: false,
    };
  }
  throw new DeskError('This source supports imports only.');
}
export function collectionItems(
  items: Listing[],
  config: RecordRow<'connector'>['data']['config'],
) {
  return items
    .filter(
      (item) =>
        (!config.canadaOnly ||
          item.locations.some(
            (location) => sourceLocation(location).country === 'Canada',
          )) &&
        (!config.studentOnly ||
          /\bintern(?:ship)?\b|\bco[ -]?op\b|\bstudent\b/i.test(item.title)),
    )
    .sort((a, b) => a.identity.localeCompare(b.identity));
}
export async function syncConnector(repo: Repository, id: string) {
  let c = await repo.get('connector', id);
  if (!c) throw new DeskError('Source not found.', 404);
  if (c.data.state !== 'connected')
    throw new DeskError('Connect or resume this source before refreshing.');
  if (
    c.data.expiresAt &&
    c.data.expiresAt < new Date().toISOString().slice(0, 10)
  ) {
    await repo.put(
      'connector',
      id,
      { ...c.data, state: 'paused', error: 'Subscription expired.' },
      c.revision,
    );
    return { paused: true };
  }
  if (!(await repo.acquire(`sync:${id}`, 120)))
    throw new DeskError(
      'This source was refreshed recently or is already running. Try again shortly.',
      429,
    );
  let run = await repo.put('sync', crypto.randomUUID(), {
    connectorId: id,
    status: 'running',
    processed: 0,
    cursor: c.data.cursor,
    error: null,
  });
  try {
    let result;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        result = await collect(c);
        break;
      } catch (e) {
        if (
          attempt ||
          (e instanceof DeskError && e.status !== 429 && e.status < 500)
        )
          throw e;
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
    if (!result) throw new DeskError('Source unavailable.');
    result.items = collectionItems(result.items, c.data.config);
    const start = c.data.cursor;
    const items = result.items.slice(start, start + 30);
    for (const item of items) {
      const current = await repo.get('connector', id);
      if (!current || current.data.state !== 'connected') {
        await repo.put(
          'sync',
          run.id,
          { ...run.data, status: 'cancelled' },
          run.revision,
        );
        return { cancelled: true };
      }
      await ingest(repo, normalize(item, repo.auth.owner, id, c.data.name));
      run = await repo.put(
        'sync',
        run.id,
        {
          ...run.data,
          processed: run.data.processed + 1,
          cursor: start + run.data.processed + 1,
        },
        run.revision,
      );
    }
    c = (await repo.get('connector', id))!;
    if (c.data.state !== 'connected') return { cancelled: true };
    const next =
      start + items.length < result.items.length ? start + items.length : 0;
    await repo.put(
      'connector',
      id,
      {
        ...c.data,
        lastSync: next ? c.data.lastSync : new Date().toISOString(),
        cursor: next,
        etag: next ? null : result.etag,
        adapterVersion,
        error: null,
      },
      c.revision,
    );
    await repo.put(
      'sync',
      run.id,
      { ...run.data, status: 'complete' },
      run.revision,
    );
    return {
      processed: items.length,
      remaining: next > 0,
      unchanged: result.unchanged,
    };
  } catch (e) {
    const message =
      e instanceof DeskError
        ? e.message
        : 'The source response could not be parsed. Existing jobs are preserved.';
    await repo.put(
      'sync',
      run.id,
      { ...run.data, status: 'failed', error: message },
      run.revision,
    );
    const latest = await repo.get('connector', id);
    if (latest)
      await repo.put(
        'connector',
        id,
        { ...latest.data, error: message, cursor: run.data.cursor },
        latest.revision,
      );
    throw new DeskError(message, 502);
  }
}
