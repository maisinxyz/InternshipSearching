import 'server-only';
import { createHash } from 'node:crypto';
import { jobSchema, type Job, type Discipline } from '@/domain/job';
import { sourceLocation } from '@/domain/source-location';
import { Repository } from './repository';
export type Listing = {
  identity: string;
  title: string;
  company: string;
  url: string | null;
  sourceUrl: string | null;
  text: string;
  locations: string[];
  posted: string | null;
  updated: string | null;
  closed?: boolean;
  arrangement?: Job['work_arrangement'];
  remoteCanada?: boolean | null;
  attribution?: string;
};
export const hash = (text: string) =>
  createHash('sha256').update(text).digest('hex');
export function canonicalUrl(raw: string) {
  const u = new URL(raw);
  for (const key of [...u.searchParams.keys()])
    if (/^utm_|^(gclid|fbclid|ref|referrer)$/i.test(key))
      u.searchParams.delete(key);
  u.hash = '';
  return u.href;
}
export function normalize(
  input: Listing,
  owner: string,
  connectorId: string | null,
  label: string,
  kind: 'source' | 'import' = 'source',
): Job {
  const now = new Date().toISOString();
  const id = hash(`${connectorId || 'manual'}:${input.identity}`);
  const meta = (id: string) => ({
    id,
    owner_id: owner,
    created_at: now,
    updated_at: now,
  });
  const originalText =
    input.title +
    '\n\n' +
    input.text +
    (input.attribution
      ? '\n\nRepository reuse notice:\n' + input.attribution
      : '');
  const sourceId = `${id}-source`,
    snapshotId = `${id}-${hash(originalText).slice(0, 16)}`;
  const rules: [Discipline, RegExp][] = [
    ['software', /software|developer|programming/i],
    ['firmware', /firmware/i],
    ['embedded', /embedded/i],
    ['electrical', /electrical/i],
    ['electronics', /electronics/i],
    ['robotics', /robot/i],
    ['controls', /controls|automation/i],
    ['hardware', /hardware|pcb|circuit/i],
    ['mechanical', /mechanical/i],
    ['mechatronics', /mechatronic/i],
    ['qa-test', /test|quality assurance/i],
    ['manufacturing-automation', /manufacturing|automation/i],
  ];
  const disciplines = rules
    .filter(([, re]) => re.test(input.title + ' ' + input.text))
    .map(([d]) => d);
  const posted = input.posted
    ? {
        precision:
          input.posted.length === 10 ? ('day' as const) : ('instant' as const),
        value: input.posted,
      }
    : null;
  const updated = input.updated
    ? {
        precision:
          input.updated.length === 10 ? ('day' as const) : ('instant' as const),
        value: input.updated,
      }
    : null;
  const durationQuote = input.title.match(/\b(\d{1,2})[ -]+months?\b/i);
  const termQuote = input.title.match(
    /\b(?:January|February|March|April|May|June|July|August|September|October|November|December|Winter|Spring|Summer|Fall|Autumn)\s+20\d{2}\b/i,
  )?.[0];
  const tech = [
    'C++',
    'Python',
    'Rust',
    'JavaScript',
    'TypeScript',
    'React',
    'Linux',
    'ARM',
    'ESP32',
    'ROS2',
    'Altium',
    'MATLAB',
    'Simulink',
    'RTOS',
    'FPGA',
  ].filter((t) =>
    new RegExp(
      `(^|[^a-z0-9])${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$)`,
      'i',
    ).test(input.text),
  );
  return jobSchema.parse({
    ...meta(id),
    title: input.title,
    requisition_id: input.identity,
    company: {
      ...meta(hash(input.company.toLowerCase())),
      name: input.company,
      verified_domain: null,
      careers_url: null,
      logo: null,
    },
    disciplines: disciplines.length ? disciplines : ['unknown'],
    employment_type: /co-?op/i.test(input.title)
      ? 'co-op'
      : /intern/i.test(input.title)
        ? 'internship'
        : /student/i.test(input.title)
          ? 'student'
          : /new.?grad/i.test(input.title)
            ? 'new-grad'
            : 'other',
    status: input.closed ? 'closed' : 'open',
    locations: input.locations.map((original_text, i) => {
      return {
        ...meta(`${id}-location-${i}`),
        ...sourceLocation(original_text),
        coordinates: null,
        precision: 'unknown',
      };
    }),
    work_arrangement: input.arrangement || 'unknown',
    remote_open_to_canada: input.remoteCanada ?? null,
    source_posted_at: posted,
    source_updated_at: updated,
    posting_date_trustworthy: !!posted,
    first_seen_at: now,
    last_seen_at: now,
    content_changed_at: now,
    salary: null,
    duration:
      durationQuote && Number(durationQuote[1]) > 0
        ? { months: Number(durationQuote[1]), original_text: durationQuote[0] }
        : null,
    term: termQuote
      ? { label: termQuote, start_date: null, original_text: termQuote }
      : null,
    deadline: null,
    involves: [],
    technologies: tech,
    required: [],
    preferred: [],
    sources: [
      {
        ...meta(sourceId),
        connector_instance_id: connectorId,
        upstream_id: input.identity,
        label,
        source_url: input.sourceUrl,
        application_url: input.url,
        source_posted_at: posted,
        source_updated_at: updated,
        posting_date_trustworthy: !!posted,
      },
    ],
    snapshots: [
      {
        ...meta(snapshotId),
        job_source_id: sourceId,
        retrieved_at: now,
        content_hash: hash(originalText),
        original_text: originalText,
        sections: [
          {
            heading: 'Original posting',
            paragraphs: [
              input.text || 'The source does not provide a full description.',
            ],
            items: [],
          },
        ],
        kind,
      },
    ],
    evidence: [
      ...tech.map((t, i) => ({
        ...meta(`${snapshotId}-e-${i}`),
        field: 'technologies',
        snapshot_id: snapshotId,
        quote: input.text.slice(
          Math.max(0, input.text.toLowerCase().indexOf(t.toLowerCase()) - 25),
          input.text.toLowerCase().indexOf(t.toLowerCase()) + t.length + 50,
        ),
        method: 'deterministic',
      })),
      ...(
        [
          { field: 'duration', quote: durationQuote?.[0] },
          { field: 'term', quote: termQuote },
        ] as const
      ).flatMap(({ field, quote }) =>
        quote
          ? [
              {
                ...meta(`${snapshotId}-${field}`),
                field,
                snapshot_id: snapshotId,
                quote,
                method: 'deterministic',
              },
            ]
          : [],
      ),
    ],
    conflicts: [],
  });
}
export async function ingest(repo: Repository, incoming: Job) {
  const all = await repo.list('job');
  const source = incoming.sources[0];
  const url = source.application_url
    ? canonicalUrl(source.application_url)
    : null;
  const existing =
    all.find((r) =>
      r.data.sources.some(
        (s) =>
          s.connector_instance_id === source.connector_instance_id &&
          s.upstream_id === source.upstream_id,
      ),
    ) ||
    all.find(
      (r) =>
        url &&
        r.data.sources.some(
          (s) => s.application_url && canonicalUrl(s.application_url) === url,
        ),
    );
  if (!existing) return repo.put('job', incoming.id, incoming);
  const old = existing.data;
  const sameSource = old.sources.find(
    (s) =>
      s.connector_instance_id === source.connector_instance_id &&
      s.upstream_id === source.upstream_id,
  );
  const unchanged = old.snapshots.some(
    (s) =>
      s.content_hash === incoming.snapshots[0].content_hash &&
      s.job_source_id === (sameSource?.id || source.id),
  );
  if (unchanged)
    return repo.put(
      'job',
      existing.id,
      {
        ...old,
        ...(sameSource
          ? {
              disciplines: incoming.disciplines,
              locations: incoming.locations,
              work_arrangement: incoming.work_arrangement,
              status: incoming.status,
              duration: incoming.duration,
              term: incoming.term,
            }
          : {}),
        last_seen_at: incoming.last_seen_at,
        source_updated_at: incoming.source_updated_at || old.source_updated_at,
      },
      existing.revision,
    );
  const snapshot = {
    ...incoming.snapshots[0],
    job_source_id: sameSource?.id || source.id,
  };
  const conflicts = [...old.conflicts];
  if (old.title !== incoming.title)
    conflicts.push({
      field: 'title',
      values: [
        { source_id: old.sources[0].id, original_value: old.title },
        { source_id: source.id, original_value: incoming.title },
      ],
    });
  // Keep first discovery, original posting date, prior snapshots and separately stored user corrections.
  return repo.put(
    'job',
    existing.id,
    {
      ...old,
      ...(sameSource
        ? {
            title: incoming.title,
            disciplines: incoming.disciplines,
            locations: incoming.locations,
            technologies: incoming.technologies,
            work_arrangement: incoming.work_arrangement,
            status: incoming.status,
            duration: incoming.duration,
            term: incoming.term,
          }
        : {}),
      sources: [
        ...old.sources.filter((s) => s.id !== sameSource?.id),
        { ...source, id: sameSource?.id || source.id },
      ],
      snapshots: [...old.snapshots, snapshot],
      evidence: [...old.evidence, ...incoming.evidence],
      conflicts,
      last_seen_at: incoming.last_seen_at,
      content_changed_at: incoming.content_changed_at,
      source_updated_at: incoming.source_updated_at || old.source_updated_at,
    },
    existing.revision,
  );
}
