import type { Metadata } from 'next';
import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { JOB_SELECT } from '@/lib/collect';
import type { JobRow } from '@/lib/search';
import { JobCard } from '@/components/job-card';
import { PageHeader } from '@/components/page-header';

export const metadata: Metadata = { title: 'Saved Jobs' };

export default async function SavedPage() {
  const user = await requireUser('/saved');
  const jobs = db().prepare(`${JOB_SELECT} JOIN saved_jobs s ON s.job_id = j.id WHERE s.user_id = ? ORDER BY s.created_at DESC`).all(user.id) as JobRow[];
  const open = jobs.filter((j) => !j.closed_at), closed = jobs.filter((j) => j.closed_at);
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <PageHeader title="Saved Jobs" intro={`${jobs.length} saved`} />
      {jobs.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="font-display text-lg font-bold">No saved jobs yet</p>
          <p className="mt-1 text-muted">Tap the bookmark on any internship to keep it here.</p>
          <Link href="/internships" className="btn-primary mt-5">Browse internships</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {open.map((j) => <JobCard key={j.id} job={j} saved signedIn />)}
          {closed.length > 0 && <h2 className="pt-6 font-display text-lg font-bold">No longer on the employer’s site</h2>}
          {closed.map((j) => <div key={j.id} className="opacity-60"><JobCard job={j} saved signedIn /></div>)}
        </div>
      )}
    </div>
  );
}
