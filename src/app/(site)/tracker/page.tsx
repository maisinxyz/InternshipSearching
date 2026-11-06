import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { PageHeader } from '@/components/page-header';
import { Tracker, type App } from '@/components/tracker';

export const metadata: Metadata = { title: 'Job Tracker' };

export default async function TrackerPage() {
  const user = await requireUser('/tracker');
  const apps = db().prepare(`SELECT a.id, a.job_id, a.company, a.title, a.url, a.stage, a.applied_on, a.notes, a.updated_at, c.logo
    FROM applications a LEFT JOIN jobs j ON j.id = a.job_id LEFT JOIN companies c ON c.slug = j.company_slug
    WHERE a.user_id = ? ORDER BY a.updated_at DESC`).all(user.id) as App[];
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <PageHeader title="Job Tracker" intro="Drag cards between columns, or use the menu on each card. Moving a card out of Saved records today as the applied date." />
      <Tracker apps={apps} />
    </div>
  );
}
