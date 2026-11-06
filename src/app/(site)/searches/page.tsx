import type { Metadata } from 'next';
import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { openJobs } from '@/lib/jobs';
import { describe, matches, parseFilters } from '@/lib/search';
import { PageHeader } from '@/components/page-header';
import { SearchRow } from '@/components/search-row';

export const metadata: Metadata = { title: 'Saved Searches & Alerts' };

export default async function SearchesPage() {
  const user = await requireUser('/searches');
  const rows = db().prepare('SELECT id, name, query, alerts, created_at FROM saved_searches WHERE user_id = ? ORDER BY created_at DESC').all(user.id) as { id: string; name: string; query: string; alerts: string; created_at: string }[];
  const jobs = openJobs();
  const emailOn = Boolean(process.env.RESEND_API_KEY && process.env.ALERT_FROM_EMAIL);
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <PageHeader title="Saved Searches & Alerts" intro={<>New matches appear under the bell.{emailOn ? ' We also email them to you.' : ' Email delivery isn’t configured on this server yet.'}</>} />
      {rows.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="font-display text-lg font-bold">No saved searches yet</p>
          <p className="mt-1 text-muted">Set filters on the board, then click “Save Search”.</p>
          <Link href="/internships" className="btn-primary mt-5">Go to Internships</Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => {
            const f = parseFilters(new URLSearchParams(r.query));
            return <SearchRow key={r.id} id={r.id} name={r.name} summary={describe(f)} href={`/internships${r.query ? `?${r.query}` : ''}`} alerts={r.alerts} count={jobs.filter((j) => matches(j, f)).length} />;
          })}
        </ul>
      )}
    </div>
  );
}
