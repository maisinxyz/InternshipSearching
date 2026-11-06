'use client';
import Link from 'next/link';
import { DndContext, KeyboardSensor, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { ExternalLink, Plus, Trash2 } from 'lucide-react';
import { useActionState, useOptimistic, useState, useTransition } from 'react';
import { addApplication, deleteApplication, moveApplication, updateApplication } from '@/lib/actions';
import { STAGES, STAGE_LABELS, type Stage } from '@/lib/models';
import { formatDate } from '@/lib/format';
import { CompanyLogo } from './company-logo';

export type App = { id: string; job_id: string | null; company: string; title: string; url: string | null; stage: Stage; applied_on: string | null; notes: string; updated_at: string; logo: string | null };

const TINT: Record<Stage, string> = { saved: 'bg-slate-400', applied: 'bg-brand', interview: 'bg-amber-400', offer: 'bg-mint', rejected: 'bg-rose-400' };

export function Tracker({ apps }: { apps: App[] }) {
  const [optimistic, move] = useOptimistic(apps, (state, { id, stage }: { id: string; stage: Stage }) => state.map((a) => (a.id === id ? { ...a, stage } : a)));
  const [, start] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor));
  const setStage = (id: string, stage: Stage) => start(async () => { move({ id, stage }); await moveApplication(id, stage); });
  const onDragEnd = (e: DragEndEvent) => {
    const stage = e.over?.id as Stage | undefined;
    const app = optimistic.find((a) => a.id === e.active.id);
    if (stage && app && app.stage !== stage) setStage(app.id, stage);
  };
  return (
    <>
      <AddForm />
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="mt-6 grid gap-4 overflow-x-auto pb-4 md:grid-cols-5">
          {STAGES.map((s) => <Column key={s} stage={s} apps={optimistic.filter((a) => a.stage === s)} setStage={setStage} />)}
        </div>
      </DndContext>
    </>
  );
}

function Column({ stage, apps, setStage }: { stage: Stage; apps: App[]; setStage: (id: string, s: Stage) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  return (
    <section ref={setNodeRef} aria-label={STAGE_LABELS[stage]} className={`min-h-48 min-w-56 rounded-2xl border p-3 transition ${isOver ? 'border-brand bg-brand-soft/60' : 'border-line bg-canvas'}`}>
      <h2 className="mb-3 flex items-center gap-2 px-1 text-sm font-semibold">
        <span className={`size-2.5 rounded-full ${TINT[stage]}`} aria-hidden />{STAGE_LABELS[stage]}<span className="ml-auto text-muted">{apps.length}</span>
      </h2>
      <div className="space-y-2">{apps.map((a) => <Card key={a.id} app={a} setStage={setStage} />)}</div>
    </section>
  );
}

function Card({ app, setStage }: { app: App; setStage: (id: string, s: Stage) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: app.id });
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : undefined;
  return (
    <article ref={setNodeRef} style={style} className={`rounded-xl border border-line bg-white p-3 shadow-sm ${isDragging ? 'z-50 rotate-1 shadow-xl' : ''}`}>
      <div {...listeners} {...attributes} aria-label={`${app.title} at ${app.company}. Press space to pick up, arrow keys to move.`} className="flex cursor-grab gap-2.5 active:cursor-grabbing">
        <CompanyLogo name={app.company} logo={app.logo} size="sm" />
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-semibold leading-snug">{app.title}</p>
          <p className="truncate text-xs text-muted">{app.company}</p>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-muted">
        <span>{app.applied_on ? `Applied ${formatDate(app.applied_on)}` : 'Not applied yet'}</span>
        <button onClick={() => setOpen(!open)} className="font-semibold text-brand" aria-expanded={open}>{open ? 'Close' : 'Details'}</button>
      </div>
      {open && (
        <div className="mt-3 space-y-2 border-t border-line pt-3">
          <label className="block text-xs font-medium">Stage
            <select value={app.stage} onChange={(e) => setStage(app.id, e.target.value as Stage)} className="field mt-1 py-1.5">
              {STAGES.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
            </select>
          </label>
          <label className="block text-xs font-medium">Applied on
            <input type="date" defaultValue={app.applied_on ?? ''} onBlur={(e) => start(() => updateApplication(app.id, { applied_on: e.target.value || null }))} className="field mt-1 py-1.5" />
          </label>
          <label className="block text-xs font-medium">Notes
            <textarea defaultValue={app.notes} rows={3} onBlur={(e) => e.target.value !== app.notes && start(() => updateApplication(app.id, { notes: e.target.value }))} className="field mt-1 py-1.5" placeholder="Interview dates, contacts, follow-ups…" />
          </label>
          <div className="flex items-center justify-between pt-1">
            <div className="flex gap-3 text-xs font-semibold">
              {app.job_id && <Link href={`/internships/${encodeURIComponent(app.job_id)}`} className="text-brand">View job</Link>}
              {app.url && <a href={app.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-brand">Posting <ExternalLink className="size-3" /></a>}
            </div>
            <button disabled={pending} onClick={() => start(() => deleteApplication(app.id))} aria-label="Remove from tracker" className="rounded-full p-1.5 text-muted hover:bg-red-50 hover:text-red-600"><Trash2 className="size-3.5" /></button>
          </div>
        </div>
      )}
    </article>
  );
}

function AddForm() {
  const [state, action, pending] = useActionState(addApplication, undefined);
  const [open, setOpen] = useState(false);
  if (!open) return <button onClick={() => setOpen(true)} className="btn-ghost"><Plus className="size-4" /> Add an application</button>;
  return (
    <form action={action} className="card grid gap-3 p-4 sm:grid-cols-[1fr_1fr_1fr_auto_auto] sm:items-end">
      <div><label className="label" htmlFor="t-company">Company</label><input id="t-company" name="company" required className="field" /></div>
      <div><label className="label" htmlFor="t-title">Role</label><input id="t-title" name="title" required className="field" /></div>
      <div><label className="label" htmlFor="t-url">Posting URL (optional)</label><input id="t-url" name="url" type="url" className="field" /></div>
      <div><label className="label" htmlFor="t-stage">Stage</label>
        <select id="t-stage" name="stage" defaultValue="applied" className="field">{STAGES.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}</select>
      </div>
      <div className="flex gap-2"><button className="btn-primary" disabled={pending}>Add</button><button type="button" onClick={() => setOpen(false)} className="btn-ghost">Done</button></div>
      {state?.error && <p role="alert" className="text-sm text-red-600 sm:col-span-5">{state.error}</p>}
    </form>
  );
}
