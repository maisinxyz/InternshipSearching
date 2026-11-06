'use client';
import { Download, Sparkles, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { deleteDocument, generateDocument, saveDocument } from '@/lib/actions';
import { createBlankDocument } from '@/lib/doc-actions';
import { Markdown } from './markdown';

export function BuilderControls({ kind, jobs, initialJob, aiReady }: { kind: 'resume' | 'cover'; jobs: { id: string; title: string; company: string }[]; initialJob: string; aiReady: boolean }) {
  const [job, setJob] = useState(initialJob);
  const [error, setError] = useState('');
  const [pending, start] = useTransition();
  const router = useRouter();
  const path = kind === 'resume' ? '/resume-builder' : '/cover-builder';
  const run = () => start(async () => {
    setError('');
    const r = await generateDocument(kind, job || null);
    if (r.error) setError(r.error); else router.push(`${path}?doc=${r.id}`);
  });
  const blank = () => start(async () => {
    router.push(`${path}?doc=${await createBlankDocument(kind)}`);
  });
  return (
    <div className="card space-y-3 p-4">
      <label className="label" htmlFor="b-job">Target job</label>
      <select id="b-job" value={job} onChange={(e) => setJob(e.target.value)} className="field">
        <option value="">{kind === 'resume' ? 'General (no specific job)' : 'Choose a job…'}</option>
        {jobs.map((j) => <option key={j.id} value={j.id}>{j.company}: {j.title}</option>)}
      </select>
      <p className="text-xs text-muted">Shows your saved and tracked jobs. Open any posting and click “Build {kind === 'resume' ? 'Resume' : 'Cover'}” to target it.</p>
      <button onClick={run} disabled={pending || !aiReady} className="btn-primary w-full"><Sparkles className="size-4" />{pending ? 'Writing…' : 'Generate'}</button>
      <button onClick={blank} disabled={pending} className="btn-ghost w-full">Start blank</button>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function DocumentEditor({ id, kind, title, initial }: { id: string; kind: 'resume' | 'cover'; title: string; initial: string }) {
  const [text, setText] = useState(initial);
  const [saved, setSaved] = useState(true);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <div className="no-print card flex flex-col p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="truncate text-sm font-semibold">{title}</h2>
          <span className="text-xs text-muted" role="status">{pending ? 'Saving…' : saved ? 'Saved' : 'Unsaved changes'}</span>
        </div>
        <textarea aria-label="Document text (Markdown)" value={text} onChange={(e) => { setText(e.target.value); setSaved(false); }} onBlur={() => !saved && start(async () => { await saveDocument(id, text); setSaved(true); })} className="field min-h-[60vh] flex-1 font-mono text-[13px]" />
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={() => start(async () => { await saveDocument(id, text); setSaved(true); })} className="btn-dark" disabled={pending}>Save</button>
          <button onClick={() => window.print()} className="btn-ghost"><Download className="size-4" /> Download PDF</button>
          <button onClick={() => start(async () => { await deleteDocument(id, kind); router.push(kind === 'resume' ? '/resume-builder' : '/cover-builder'); })} className="btn ml-auto text-muted hover:text-red-600"><Trash2 className="size-4" /> Delete</button>
        </div>
        <p className="mt-2 text-xs text-muted">“Download PDF” opens your browser’s print dialog. Choose “Save as PDF”.</p>
      </div>
      <div className="print-sheet card mx-auto w-full max-w-[8.5in] bg-white p-10 shadow-xl shadow-ink/5">
        <Markdown source={text} />
      </div>
    </div>
  );
}
