import Link from 'next/link';
import { MapPin } from 'lucide-react';
import type { JobRow } from '@/lib/search';
import { isNew } from '@/lib/jobs';
import { MODE_LABEL, placeLabel, postedLabel } from '@/lib/format';
import { CompanyLogo } from './company-logo';
import { SaveButton } from './save-button';

export function JobCard({ job, saved, signedIn }: { job: JobRow; saved: boolean; signedIn: boolean }) {
  const skills: string[] = JSON.parse(job.skills);
  const href = `/internships/${encodeURIComponent(job.id)}`;
  return (
    <article className="card group relative flex gap-4 p-4 transition hover:border-ink/20 hover:shadow-lg hover:shadow-ink/5 sm:p-5">
      <CompanyLogo name={job.company_name} logo={job.logo} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-base font-bold leading-snug text-ink group-hover:text-brand">
              <Link href={href} className="after:absolute after:inset-0">{job.title}</Link>
            </h3>
            <p className="mt-0.5 text-sm text-muted">
              <span className="font-semibold text-ink/80">{job.company_name}</span> · {postedLabel(job)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {isNew(job) && <span className="rounded-full bg-mint/10 px-2 py-0.5 text-xs font-bold text-mint">New</span>}
            <SaveButton jobId={job.id} saved={saved} signedIn={signedIn} />
          </div>
        </div>
        <p className="mt-2 flex items-center gap-1 text-sm text-ink/80">
          <MapPin className="size-3.5 shrink-0 text-muted" aria-hidden /> <span className="truncate">{placeLabel(job.locations)}</span>
        </p>
        <p className="mt-2 line-clamp-2 text-sm text-muted">{job.summary}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.term && <span className="tag bg-brand-soft text-brand">{job.term}</span>}
          {job.work_mode && <span className="tag">{MODE_LABEL[job.work_mode]}</span>}
          {job.pay === 'paid' && <span className="tag">Paid</span>}
          {skills.slice(0, 4).map((s) => <span key={s} className="tag">{s}</span>)}
        </div>
      </div>
    </article>
  );
}
