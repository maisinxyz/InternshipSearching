'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { markNotificationsRead } from '@/lib/actions';
import { timeAgo } from '@/lib/format';

type Note = { id: string; title: string; company: string; job_id: string; search: string | null; created_at: string; read_at: string | null };

export function NotificationsPanel({ notes, unread }: { notes: Note[]; unread: number }) {
  // Opening the panel marks everything read.
  useEffect(() => { if (unread) void markNotificationsRead(); }, [unread]);
  return (
    <div>
      <div className="flex items-center justify-between px-3 py-2">
        <span className="font-semibold">Alerts</span>
        <Link href="/searches" className="text-xs font-semibold text-brand">Manage</Link>
      </div>
      {notes.length === 0 ? (
        <p className="px-3 pb-3 text-sm text-muted">No alerts yet. Save a search on the Internships page and we’ll notify you when new roles match.</p>
      ) : (
        <ul className="max-h-96 overflow-y-auto">
          {notes.map((n) => (
            <li key={n.id}>
              <Link href={`/internships/${encodeURIComponent(n.job_id)}`} className="block rounded-xl px-3 py-2 hover:bg-canvas">
                <div className="flex items-start gap-2">
                  {!n.read_at && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand" aria-label="Unread" />}
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{n.title}</div>
                    <div className="truncate text-xs text-muted">{n.company} · {n.search ?? 'Alert'} · {timeAgo(n.created_at)}</div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
