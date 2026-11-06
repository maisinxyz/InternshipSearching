import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { timeAgo } from '@/lib/format';

export const metadata: Metadata = { title: 'Data sources' };
export const dynamic = 'force-dynamic';

export default function SourcesPage() {
  const rows = db().prepare(`SELECT s.id, s.type, s.board, s.last_run_at, s.last_status, s.last_count, c.name FROM sources s
    JOIN companies c ON c.slug = s.company_slug ORDER BY c.name`).all() as { id: string; type: string; board: string; last_run_at: string | null; last_status: string | null; last_count: number | null; name: string }[];
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold tracking-tight">Data sources</h1>
      <p className="mt-2 max-w-2xl text-muted">Every listing comes from one of these public employer job boards. Each is re-checked on a 30-minute cycle while the collector is running.</p>
      <div className="card mt-8 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
            <tr><th className="px-4 py-3">Employer</th><th className="px-4 py-3">Platform</th><th className="px-4 py-3">Internships</th><th className="px-4 py-3">Last checked</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-2.5 font-semibold">{r.name}</td>
                <td className="px-4 py-2.5 capitalize text-muted">{r.type}</td>
                <td className="px-4 py-2.5">{r.last_count ?? '—'}</td>
                <td className="px-4 py-2.5 text-muted">{r.last_run_at ? `${timeAgo(r.last_run_at)}${r.last_status === 'error' ? ' (failed)' : ''}` : 'Never'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
