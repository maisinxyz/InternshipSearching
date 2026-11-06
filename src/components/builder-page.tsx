import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { getJob } from '@/lib/jobs';
import { getProfile } from '@/lib/profile';
import { formatDate } from '@/lib/format';
import { PageHeader } from './page-header';
import { BuilderControls, DocumentEditor } from './builder';

type Doc = { id: string; title: string; content: string; updated_at: string };

export async function BuilderPage({ kind, sp }: { kind: 'resume' | 'cover'; sp: { job?: string; doc?: string } }) {
  const path = kind === 'resume' ? '/resume-builder' : '/cover-builder';
  const user = await requireUser(path);
  const conn = db();
  const docs = conn.prepare('SELECT id, title, content, updated_at FROM documents WHERE user_id = ? AND kind = ? ORDER BY updated_at DESC').all(user.id, kind) as Doc[];
  // Jobs to pick from: the one passed in, then saved and tracked jobs.
  const options = conn.prepare(`SELECT DISTINCT j.id, j.title, c.name AS company FROM jobs j JOIN companies c ON c.slug = j.company_slug
    WHERE j.id IN (SELECT job_id FROM saved_jobs WHERE user_id = ?) OR j.id IN (SELECT job_id FROM applications WHERE user_id = ? AND job_id IS NOT NULL)`).all(user.id, user.id) as { id: string; title: string; company: string }[];
  const passed = sp.job ? getJob(sp.job) : null;
  if (passed && !options.some((o) => o.id === passed.id)) options.unshift({ id: passed.id, title: passed.title, company: passed.company_name });
  const current = docs.find((d) => d.id === sp.doc) ?? null;
  const profile = getProfile(user);
  const hasProfile = Boolean(profile.experience.length || profile.education.length || profile.projects.length);
  const aiReady = Boolean(process.env.ANTHROPIC_API_KEY);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="no-print">
        <PageHeader title={kind === 'resume' ? 'Resume Builder' : 'Cover Builder'} intro={kind === 'resume' ? 'Generate an ATS-friendly resume from your profile, tailored to a job.' : 'Generate a tailored cover letter for any internship from your profile.'} />
        {!hasProfile && <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">Your profile is mostly empty. <Link href="/profile" className="font-semibold underline">Add your experience</Link> first, because the builder only uses what’s there.</p>}
        {!aiReady && <p className="mb-4 rounded-xl bg-canvas px-4 py-3 text-sm text-muted">Generation is off on this server (no <code>ANTHROPIC_API_KEY</code>). You can still write and export documents by hand.</p>}
      </div>
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="no-print space-y-4">
          <BuilderControls kind={kind} jobs={options} initialJob={passed?.id ?? ''} aiReady={aiReady} />
          <div className="card p-4">
            <h2 className="mb-2 text-sm font-semibold">Your {kind === 'resume' ? 'resumes' : 'cover letters'}</h2>
            {docs.length === 0 ? <p className="text-sm text-muted">None yet.</p> : (
              <ul className="space-y-1">
                {docs.map((d) => (
                  <li key={d.id}><Link href={`${path}?doc=${d.id}`} className={`block rounded-lg px-2 py-1.5 text-sm hover:bg-canvas ${current?.id === d.id ? 'bg-brand-soft font-semibold text-brand' : ''}`}>
                    <span className="line-clamp-1">{d.title}</span><span className="text-xs text-muted">{formatDate(d.updated_at)}</span>
                  </Link></li>
                ))}
              </ul>
            )}
          </div>
        </aside>
        {current ? <DocumentEditor key={current.id} id={current.id} kind={kind} title={current.title} initial={current.content} /> : (
          <div className="card no-print grid min-h-96 place-items-center p-10 text-center text-muted">Pick a job and generate, or open a saved document.</div>
        )}
      </div>
    </div>
  );
}
