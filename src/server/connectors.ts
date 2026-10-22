import 'server-only';
import { z } from 'zod';
import { connectorSchema, type RecordRow } from '@/domain/workspace';
import { safeFetch, readable, publicUrl } from './safe-fetch';
import { normalize, ingest, canonicalUrl, type Listing } from './ingestion';
import { Repository } from './repository';
import { DeskError } from './auth';
import { sourceLocation } from '@/domain/source-location';
import { isAutomatic } from '@/domain/collection';
const adapterVersion = '4';
export const capabilities = {
  github: { scheduled: true, descriptions: false, closure: false },
  greenhouse: { scheduled: true, descriptions: true, closure: false },
  lever: { scheduled: true, descriptions: true, closure: false },
  ashby: { scheduled: true, descriptions: true, closure: false },
  myexperience: { scheduled: false, descriptions: false, closure: false },
  'intern-insider': { scheduled: false, descriptions: false, closure: false },
  workday: { scheduled: false, descriptions: false, closure: false },
  linkedin: { scheduled: false, descriptions: false, closure: false },
  manual: { scheduled: false, descriptions: false, closure: false },
};
export function validateConnector(input: unknown) {
  const c = connectorSchema.parse(input);
  if (isAutomatic(c.type)) {
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
    } else if (
      !(c.type === 'ashby' ? /^[\w.-]+$/ : /^[\w-]+$/).test(
        c.config.board || '',
      ) ||
      c.config.board?.includes('..')
    )
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
      posted: null, // Repository addition dates are not employer publication dates.
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
  first_published: z.string().nullable().optional(),
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
export function parseAshby(payload: unknown, company: string): Listing[] {
  const rows = z
    .object({
      jobs: z.array(
        z.object({
          id: z.string().optional(),
          title: z.string(),
          jobUrl: z.url(),
          applyUrl: z.url(),
          isListed: z.boolean(),
          descriptionPlain: z.string(),
          location: z.string().optional(),
          secondaryLocations: z
            .array(z.object({ location: z.string() }))
            .optional(),
          publishedAt: z.string().optional(),
          workplaceType: z.string().nullable().optional(),
          employmentType: z.string().optional(),
        }),
      ),
    })
    .parse(payload).jobs;
  return rows
    .filter((j) => j.isListed)
    .map((j) => ({
      identity: j.id || j.jobUrl,
      title: j.title,
      company,
      url: j.applyUrl,
      sourceUrl: j.jobUrl,
      text: j.descriptionPlain,
      locations: [
        j.location || '',
        ...(j.secondaryLocations || []).map((l) => l.location),
      ].filter(Boolean),
      posted: null,
      updated: null,
      republished: j.publishedAt || null,
      employmentType: j.employmentType === 'Intern' ? 'internship' : undefined,
      arrangement:
        j.workplaceType === 'Remote'
          ? 'remote'
          : j.workplaceType === 'Hybrid'
            ? 'hybrid'
            : j.workplaceType === 'OnSite'
              ? 'on-site'
              : 'unknown',
    }));
}
export async function collect(c: RecordRow<'connector'>) {
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
            posted: j.first_published || null,
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
  if (type === 'ashby') {
    const result = await safeFetch(
      `https://api.ashbyhq.com/posting-api/job-board/${config.board}?includeCompensation=true`,
      headers,
    );
    if (result.status === 304) return { items: [], etag, unchanged: true };
    return {
      items: parseAshby(JSON.parse(result.text), c.data.name),
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
          item.remoteCanada === true ||
          item.locations.some(
            (location) => sourceLocation(location).country === 'Canada',
          )) &&
        (!config.technicalOnly ||
          (!/\bfinance\b|\baccounting\b|\bbusiness development\b|\baccount development\b|\bsales\b|\bmarketing\b|\bhuman resources\b|\brecruit(?:er|ing|ment)\b/i.test(
            item.title,
          ) &&
            /engineer|develop|software|firmware|hardware|electr|robot|control|automat|manufactur|mechanic|test|quality|data|analyst|\bAI\b|\bML\b|machine learning|\bIT\b|cloud|security|product|technical (?:support|program|product|operations|analyst)|design|research/i.test(
              item.title,
            ))) &&
        (!config.studentOnly ||
          ['internship', 'co-op', 'student'].includes(
            item.employmentType || '',
          ) ||
          /\bintern(?:ship)?\b|\bco[ -]?op\b|\bstudent\b/i.test(item.title)),
    )
    .sort((a, b) => a.identity.localeCompare(b.identity));
}
export async function syncConnector(
  repo: Repository,
  id: string,
  deadline = Date.now() + 35000,
) {
  let c = await repo.get('connector', id);
  if (!c || c.data.state !== 'connected' || !isAutomatic(c.data.type))
    throw new DeskError('Enable this employer board before checking it.', 409);
  if (
    c.data.expiresAt &&
    c.data.expiresAt < new Date().toISOString().slice(0, 10)
  )
    throw new DeskError('This source has expired.', 409);
  if (
    c.data.nextRunAt &&
    Date.parse(c.data.nextRunAt) > Date.now() &&
    c.data.failures
  )
    throw new DeskError(
      'Source is backing off after a failed check. Retry after ' +
        c.data.nextRunAt,
      429,
    );
  if (!(await repo.acquire(`sync:${id}`, 120)))
    throw new DeskError(
      'This board is already checking or was checked recently.',
      429,
    );
  const signature = JSON.stringify([
    c.data.type,
    c.data.config,
    c.data.intervalMinutes,
  ]);
  let run = await repo.get('sync', `active:${id}`);
  // A saved batch is tied to the exact configuration that fetched it.
  if (run?.data.batch && run.data.configKey !== signature)
    run = await repo.put(
      'sync',
      run.id,
      { ...run.data, batch: null, cursor: 0 },
      run.revision,
    );
  try {
    if (!run?.data.batch) {
      const result = await collect(c);
      const checkedAt = new Date().toISOString();
      run = await repo.put(
        'sync',
        `active:${id}`,
        {
          connectorId: id,
          status: 'running',
          processed: 0,
          cursor: 0,
          error: null,
          batch: collectionItems(result.items, c.data.config),
          batchEtag: result.etag,
          checkedAt,
          configKey: signature,
        },
        run?.revision || 0,
      );
    }
    const batch = run.data.batch!;
    let processed = 0;
    // Load the identity index once per batch, rather than once per posting.
    const known = await repo.list('job');
    while (
      run.data.cursor < batch.length &&
      processed < 30 &&
      Date.now() < deadline
    ) {
      const current = await repo.get('connector', id);
      if (
        !current ||
        current.data.state !== 'connected' ||
        JSON.stringify([
          current.data.type,
          current.data.config,
          current.data.intervalMinutes,
        ]) !== signature
      ) {
        await repo.put(
          'sync',
          run.id,
          { ...run.data, status: 'cancelled', batch: null },
          run.revision,
        );
        return { cancelled: true };
      }
      const incoming = normalize(
        batch[run.data.cursor],
        repo.auth.owner,
        id,
        c.data.name,
      );
      incoming.baseline = !c.data.baselineComplete && !c.data.lastSync;
      const saved = await ingest(repo, incoming, known);
      const index = known.findIndex((j) => j.id === saved.id);
      if (index < 0) known.push(saved);
      else known[index] = saved;
      run = await repo.put(
        'sync',
        run.id,
        {
          ...run.data,
          cursor: run.data.cursor + 1,
          processed: run.data.processed + 1,
        },
        run.revision,
      );
      processed++;
    }
    c = await repo.get('connector', id);
    if (
      !c ||
      c.data.state !== 'connected' ||
      JSON.stringify([c.data.type, c.data.config, c.data.intervalMinutes]) !==
        signature
    )
      return { cancelled: true };
    const remaining = run.data.cursor < batch.length;
    await repo.put(
      'connector',
      id,
      {
        ...c.data,
        cursor: remaining ? run.data.cursor : 0,
        lastSync: remaining ? c.data.lastSync : run.data.checkedAt,
        etag: remaining ? null : run.data.batchEtag,
        nextRunAt: new Date(
          Date.now() + (remaining ? 120000 : c.data.intervalMinutes * 60000),
        ).toISOString(),
        baselineComplete: c.data.baselineComplete || !remaining,
        failures: 0,
        error: null,
        adapterVersion,
      },
      c.revision,
    );
    await repo.put(
      'sync',
      run.id,
      {
        ...run.data,
        status: remaining ? 'running' : 'complete',
        batch: remaining ? batch : null,
      },
      run.revision,
    );
    return { processed, remaining };
  } catch (e) {
    const message =
      e instanceof DeskError
        ? e.message.slice(0, 300)
        : 'Board response could not be processed. Existing jobs are preserved.';
    if (run)
      await repo.put(
        'sync',
        run.id,
        { ...run.data, status: 'failed', error: message },
        run.revision,
      );
    const latest = await repo.get('connector', id);
    if (
      latest &&
      JSON.stringify([
        latest.data.type,
        latest.data.config,
        latest.data.intervalMinutes,
      ]) === signature
    ) {
      const failures = latest.data.failures + 1;
      const delay = Math.max(
        e instanceof DeskError ? e.retryAfterMs || 0 : 0,
        Math.min(3600000, 60000 * 2 ** Math.min(failures, 6)) +
          Math.floor(Math.random() * 30000),
      );
      await repo.put(
        'connector',
        id,
        {
          ...latest.data,
          failures,
          error: message,
          nextRunAt: new Date(Date.now() + delay).toISOString(),
        },
        latest.revision,
      );
    }
    throw new DeskError(message, 502);
  }
}
