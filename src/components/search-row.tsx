'use client';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { useTransition } from 'react';
import { deleteSearch, updateSearchAlerts } from '@/lib/actions';

export function SearchRow({ id, name, summary, href, alerts, count }: { id: string; name: string; summary: string; href: string; alerts: string; count: number }) {
  const [pending, start] = useTransition();
  return (
    <li className="card flex flex-wrap items-center gap-4 p-5">
      <div className="min-w-0 flex-1">
        <Link href={href} className="font-display font-bold hover:text-brand">{name}</Link>
        <p className="truncate text-sm text-muted">{summary} · <span className="font-semibold text-ink">{count}</span> open matches</p>
      </div>
      <label className="text-sm text-muted">
        <span className="sr-only">Alert frequency for {name}</span>
        <select defaultValue={alerts} disabled={pending} onChange={(e) => start(() => updateSearchAlerts(id, e.target.value))} className="field w-auto py-2">
          <option value="instant">Instant alerts</option>
          <option value="daily">Daily digest</option>
          <option value="off">Alerts off</option>
        </select>
      </label>
      <button aria-label={`Delete ${name}`} disabled={pending} onClick={() => start(() => deleteSearch(id))} className="rounded-full p-2 text-muted hover:bg-red-50 hover:text-red-600"><Trash2 className="size-4" /></button>
    </li>
  );
}
