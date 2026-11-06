'use client';
import { Bookmark } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toggleSave } from '@/lib/actions';

export function SaveButton({ jobId, saved: initial, signedIn, variant = 'icon' }: { jobId: string; saved: boolean; signedIn: boolean; variant?: 'icon' | 'full' }) {
  const [saved, setSaved] = useState(initial);
  const [pending, start] = useTransition();
  const router = useRouter();
  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!signedIn) return router.push(`/sign-up?next=${encodeURIComponent(`/internships/${encodeURIComponent(jobId)}`)}`);
    setSaved(!saved);
    start(async () => setSaved(await toggleSave(jobId)));
  };
  const label = saved ? 'Saved' : 'Save';
  return variant === 'icon' ? (
    <button onClick={onClick} disabled={pending} aria-pressed={saved} aria-label={`${label} job`} className={`relative z-10 inline-flex size-9 items-center justify-center rounded-full border transition ${saved ? 'border-brand bg-brand-soft text-brand' : 'border-line bg-white text-muted hover:text-ink'}`}>
      <Bookmark className="size-4" fill={saved ? 'currentColor' : 'none'} />
    </button>
  ) : (
    <button onClick={onClick} disabled={pending} aria-pressed={saved} className={saved ? 'btn border border-brand bg-brand-soft text-brand' : 'btn-ghost'}>
      <Bookmark className="size-4" fill={saved ? 'currentColor' : 'none'} /> {label}
    </button>
  );
}
