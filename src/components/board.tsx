import Link from 'next/link';
import { Lock } from 'lucide-react';
import { currentUser } from '@/lib/auth';
import { facets, savedIds, searchJobs } from '@/lib/jobs';
import { toQuery, type Filters } from '@/lib/search';
import { FilterBar } from './filter-bar';
import { JobCard } from './job-card';

const PAGE = 30;
const PREVIEW = 12; // shortcut: signed-out visitors see a preview, sign up for the full board (mirrors the reference site's gating).

export async function Board({ filters, page, title, intro, basePath }: { filters: Filters; page: number; title: string; intro?: string; basePath?: string }) {
  const user = await currentUser();
  const { results, total } = searchJobs(filters);
  const saved = user ? savedIds(user.id) : new Set<string>();
  const limit = user ? page * PAGE : PREVIEW;
  const shown = results.slice(0, limit);
  const qs = toQuery(filters);

  return (
    <div className="bg-canvas/60">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
            {intro && <p className="mt-1 text-muted">{intro}</p>}
          </div>
          <Link href="/faq" className="text-sm font-semibold text-brand hover:underline">FAQ</Link>
        </div>
        <FilterBar filters={filters} facets={facets()} signedIn={Boolean(user)} basePath={basePath} />
        <p className="mb-3 mt-5 text-sm text-muted" aria-live="polite">
          <span className="font-semibold text-ink">{results.length.toLocaleString()}</span> internships{results.length !== total ? ` match (of ${total.toLocaleString()} open)` : ' open'}
        </p>
        {results.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="font-display text-lg font-bold">No internships match these filters yet</p>
            <p className="mt-1 text-muted">Save this search and we’ll alert you when one is posted.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {shown.map((j) => <JobCard key={j.id} job={j} saved={saved.has(j.id)} signedIn={Boolean(user)} />)}
          </div>
        )}
        {!user && results.length > PREVIEW && (
          <div className="relative -mt-24 rounded-2xl bg-gradient-to-b from-transparent via-white to-white pt-24 text-center">
            <div className="card mx-auto max-w-lg p-8 shadow-xl shadow-ink/5">
              <Lock className="mx-auto size-6 text-brand" aria-hidden />
              <p className="mt-3 font-display text-xl font-extrabold">See all {results.length.toLocaleString()} internships</p>
              <p className="mt-1 text-sm text-muted">Create a free account to unlock the full board, save jobs, and get alerts.</p>
              <div className="mt-5 flex justify-center gap-2">
                <Link href={`/sign-up?next=${encodeURIComponent(`/internships${qs ? `?${qs}` : ''}`)}`} className="btn-primary">Start for free</Link>
                <Link href="/sign-in" className="btn-ghost">Sign in</Link>
              </div>
            </div>
          </div>
        )}
        {user && results.length > limit && (
          <div className="mt-6 text-center">
            <Link scroll={false} href={`?${qs ? `${qs}&` : ''}page=${page + 1}`} className="btn-ghost">Show more internships</Link>
          </div>
        )}
      </div>
    </div>
  );
}
