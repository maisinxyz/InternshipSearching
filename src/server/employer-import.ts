import 'server-only';
import { z } from 'zod';
import { safeFetch, readable } from './safe-fetch';
import type { Listing } from './ingestion';

export function greenhouseImportTarget(value: string) {
  const url = new URL(value);
  if (
    !['job-boards.greenhouse.io', 'boards.greenhouse.io'].includes(url.hostname)
  )
    return null;
  const match = url.pathname.match(/^\/([\w-]+)\/jobs\/(\d+)\/?$/);
  return match ? { board: match[1], id: match[2] } : null;
}

// Public employer Job Board API only. No subscription cookies or credentials.
export async function publicEmployerPosting(
  url: string,
): Promise<Listing | null> {
  const target = greenhouseImportTarget(url);
  if (!target) return null;
  const [jobResponse, boardResponse] = await Promise.all([
    safeFetch(
      `https://boards-api.greenhouse.io/v1/boards/${target.board}/jobs/${target.id}`,
    ),
    safeFetch(`https://boards-api.greenhouse.io/v1/boards/${target.board}`),
  ]);
  const job = z
    .object({
      title: z.string().min(1),
      content: z.string(),
      location: z.object({ name: z.string() }),
      updated_at: z.iso.datetime({ offset: true }).optional(),
    })
    .parse(JSON.parse(jobResponse.text));
  const board = z
    .object({ name: z.string().min(1) })
    .parse(JSON.parse(boardResponse.text));
  return {
    identity: `greenhouse:${target.board}:${target.id}`,
    title: job.title,
    company: board.name,
    text: readable(readable(readable(job.content))),
    locations: job.location.name.split(/\s*;\s*/).filter(Boolean),
    url,
    sourceUrl: url,
    posted: null,
    updated: job.updated_at ? new Date(job.updated_at).toISOString() : null,
  };
}
