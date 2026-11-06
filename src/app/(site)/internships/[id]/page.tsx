import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, CalendarClock, Briefcase, Building2, Clock, DollarSign, Laptop, MapPin, Sparkles } from 'lucide-react';
import { currentUser } from '@/lib/auth';
import { trackJob } from '@/lib/actions';
import { getJob, savedIds } from '@/lib/jobs';
import { formatDate, MODE_LABEL, placeLabel, postedLabel } from '@/lib/format';
import { CompanyLogo } from '@/components/company-logo';
import { SaveButton } from '@/components/save-button';
import { Description } from '@/components/description';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const job = getJob(decodeURIComponent((await params).id));
  return { title: job ? `${job.title} at ${job.company_name}` : 'Internship' };
}

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const job = getJob(decodeURIComponent((await params).id));
  if (!job) notFound();
  const user = await currentUser();
  const saved = user ? savedIds(user.id).has(job.id) : false;
  const quals: string[] = JSON.parse(job.qualifications);
  const skills: string[] = JSON.parse(job.skills);
  const track = trackJob.bind(null, job.id);
  const builderQs = `?job=${encodeURIComponent(job.id)}`;

  const attrs = [
    { icon: CalendarClock, label: 'Term', value: job.term },
    { icon: Briefcase, label: 'Type', value: job.employment_type },
    { icon: Laptop, label: 'Work mode', value: job.work_mode ? MODE_LABEL[job.work_mode] : null },
    { icon: DollarSign, label: 'Pay', value: job.pay_text ?? (job.pay === 'paid' ? 'Paid' : job.pay === 'unpaid' ? 'Unpaid' : null) },
    { icon: Clock, label: 'Deadline', value: job.deadline ? formatDate(job.deadline) : 'No deadline listed' },
  ];

  return (
    <div className="bg-canvas/60">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Link href="/internships" className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink"><ArrowLeft className="size-4" /> All internships</Link>
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <article className="card p-6 sm:p-8">
            {job.closed_at && <p role="status" className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">This posting was removed from {job.company_name}’s careers page on {formatDate(job.closed_at)}. It may no longer accept applications.</p>}
            <div className="flex items-start gap-4">
              <CompanyLogo name={job.company_name} logo={job.logo} size="lg" />
              <div className="min-w-0">
                <p className="text-sm text-muted"><Link href={`/internships/company/${job.company_slug}`} className="font-semibold text-ink hover:text-brand">{job.company_name}</Link>{job.industry && ` · ${job.industry}`}</p>
                <h1 className="mt-1 font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">{job.title}</h1>
                <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                  <span className="inline-flex items-center gap-1"><MapPin className="size-4" />{placeLabel(job.locations, 4)}</span>
                  <span>{postedLabel(job)}</span>
                </p>
              </div>
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {attrs.map((a) => (
                <div key={a.label} className="rounded-xl bg-canvas p-3">
                  <dt className="flex items-center gap-1 text-xs text-muted"><a.icon className="size-3.5" aria-hidden />{a.label}</dt>
                  <dd className={`mt-1 text-sm font-semibold ${a.value ? '' : 'text-muted'}`}>{a.value ?? 'Not specified'}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex flex-wrap gap-2">
              <a href={job.url} target="_blank" rel="noopener noreferrer" className="btn-primary">Apply on {job.company_name} <ArrowUpRight className="size-4" /></a>
              <SaveButton jobId={job.id} saved={saved} signedIn={Boolean(user)} variant="full" />
              {user ? <form action={track}><button className="btn-ghost">Track application</button></form> : <Link href={`/sign-up?next=/internships/${encodeURIComponent(job.id)}`} className="btn-ghost">Track application</Link>}
            </div>
            {quals.length > 0 && (
              <section className="mt-8">
                <h2 className="font-display text-lg font-bold">Qualifications</h2>
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] text-ink/85">{quals.map((q) => <li key={q}>{q}</li>)}</ul>
              </section>
            )}
            {skills.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-1.5">{skills.map((s) => <span key={s} className="tag">{s}</span>)}</div>
            )}
            <section className="mt-8 border-t border-line pt-6">
              <h2 className="font-display text-lg font-bold">Full description</h2>
              <Description text={job.description} />
              <p className="mt-6 text-xs text-muted">Source: <a className="underline" href={job.url} target="_blank" rel="noopener noreferrer">{job.company_name} careers page</a>. Term, pay and work mode are read from the posting text and may be incomplete.</p>
            </section>
          </article>
          <aside className="space-y-4">
            <div className="card overflow-hidden">
              <div className="bg-gradient-to-br from-brand to-indigo-400 p-5 text-white">
                <Sparkles className="size-5" aria-hidden />
                <p className="mt-2 font-display text-lg font-extrabold">Improve your chances</p>
                <p className="mt-1 text-sm text-white/85">Tailor your resume and cover letter to this role in under a minute.</p>
              </div>
              <div className="grid gap-2 p-4">
                <Link href={`/resume-builder${builderQs}`} className="btn-dark">Build Resume</Link>
                <Link href={`/cover-builder${builderQs}`} className="btn-ghost">Build Cover</Link>
              </div>
            </div>
            <div className="card p-5 text-sm">
              <p className="flex items-center gap-2 font-semibold"><Building2 className="size-4" aria-hidden /> About {job.company_name}</p>
              <dl className="mt-3 space-y-2 text-muted">
                <div className="flex justify-between gap-2"><dt>Industry</dt><dd className="text-right text-ink">{job.industry ?? 'Not specified'}</dd></div>
                <div className="flex justify-between gap-2"><dt>Size</dt><dd className="text-right text-ink">{job.company_size ?? 'Not specified'}</dd></div>
                {job.domain && <div className="flex justify-between gap-2"><dt>Website</dt><dd><a className="text-brand hover:underline" href={`https://${job.domain}`} target="_blank" rel="noopener noreferrer">{job.domain}</a></dd></div>}
              </dl>
              <Link href={`/internships/company/${job.company_slug}`} className="mt-4 inline-block font-semibold text-brand hover:underline">More internships at {job.company_name}</Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
