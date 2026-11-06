'use client';
import { Plus, Trash2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { saveProfile, type FormState } from '@/lib/actions';
import { PROFILE_SECTIONS, type Profile, type ProfileEntry } from '@/lib/models';

const blank = (): ProfileEntry => ({ title: '', org: '', location: '', start: '', end: '', bullets: [] });
type SectionKey = (typeof PROFILE_SECTIONS)[number]['key'];

export function ProfileEditor({ initial }: { initial: Profile }) {
  const [p, setP] = useState(initial);
  const [status, setStatus] = useState<FormState>();
  const [pending, start] = useTransition();
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => { setP({ ...p, [k]: v }); setStatus(undefined); };
  const setEntry = (k: SectionKey, i: number, patch: Partial<ProfileEntry>) => set(k, p[k].map((e, j) => (j === i ? { ...e, ...patch } : e)));
  const field = (k: 'fullName' | 'email' | 'phone' | 'location' | 'links', label: string, type = 'text') => (
    <div><label className="label" htmlFor={`p-${k}`}>{label}</label><input id={`p-${k}`} type={type} value={p[k]} onChange={(e) => set(k, e.target.value)} className="field" /></div>
  );

  return (
    <form onSubmit={(e) => { e.preventDefault(); start(async () => setStatus(await saveProfile(p))); }} className="space-y-6">
      <section className="card p-6">
        <h2 className="mb-4 font-display text-lg font-bold">Basics</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {field('fullName', 'Full name')}{field('email', 'Email', 'email')}{field('phone', 'Phone')}{field('location', 'Location')}
          <div className="sm:col-span-2">{field('links', 'Links (LinkedIn, GitHub, portfolio)')}</div>
          <div className="sm:col-span-2"><label className="label" htmlFor="p-headline">Headline</label><input id="p-headline" value={p.headline} onChange={(e) => set('headline', e.target.value)} className="field" placeholder="e.g. 3rd-year Computer Engineering student interested in embedded systems" /></div>
        </div>
      </section>

      {PROFILE_SECTIONS.map((s) => (
        <section key={s.key} className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">{s.label}</h2>
            <button type="button" onClick={() => set(s.key, [...p[s.key], blank()])} className="btn-ghost py-1.5"><Plus className="size-4" /> Add</button>
          </div>
          {p[s.key].length === 0 && <p className="text-sm text-muted">Nothing added yet.</p>}
          <div className="space-y-4">
            {p[s.key].map((e, i) => (
              <fieldset key={i} className="rounded-xl border border-line p-4">
                <legend className="sr-only">{s.label} {i + 1}</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input aria-label={s.title} placeholder={s.title} value={e.title} onChange={(ev) => setEntry(s.key, i, { title: ev.target.value })} className="field" />
                  <input aria-label={s.org} placeholder={s.org} value={e.org} onChange={(ev) => setEntry(s.key, i, { org: ev.target.value })} className="field" />
                  <input aria-label="Location" placeholder="Location" value={e.location} onChange={(ev) => setEntry(s.key, i, { location: ev.target.value })} className="field" />
                  <div className="grid grid-cols-2 gap-3">
                    <input aria-label="Start" placeholder="Start (e.g. Sep 2025)" value={e.start} onChange={(ev) => setEntry(s.key, i, { start: ev.target.value })} className="field" />
                    <input aria-label="End" placeholder="End (or Present)" value={e.end} onChange={(ev) => setEntry(s.key, i, { end: ev.target.value })} className="field" />
                  </div>
                  <textarea aria-label="Highlights, one per line" placeholder="Highlights, one per line" rows={3} value={e.bullets.join('\n')} onChange={(ev) => setEntry(s.key, i, { bullets: ev.target.value.split('\n') })} className="field sm:col-span-2" />
                </div>
                <button type="button" onClick={() => set(s.key, p[s.key].filter((_, j) => j !== i))} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-red-600"><Trash2 className="size-3.5" /> Remove</button>
              </fieldset>
            ))}
          </div>
        </section>
      ))}

      <section className="card p-6">
        <h2 className="mb-4 font-display text-lg font-bold">Skills</h2>
        <textarea aria-label="Skills" rows={3} value={p.skills} onChange={(e) => set('skills', e.target.value)} className="field" placeholder="Python, TypeScript, React, SQL, SolidWorks…" />
      </section>

      <div className="sticky bottom-4 flex items-center justify-end gap-3 rounded-2xl border border-line bg-white/95 p-3 shadow-lg backdrop-blur">
        {status?.ok && <span role="status" className="text-sm text-mint">{status.ok}</span>}
        {status?.error && <span role="alert" className="text-sm text-red-600">{status.error}</span>}
        <button className="btn-primary" disabled={pending}>{pending ? 'Saving…' : 'Save profile'}</button>
      </div>
    </form>
  );
}
