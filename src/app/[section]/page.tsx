import { redirect, notFound } from 'next/navigation';
import { localOpenAccess } from '@/server/local-access';
import { configured, session } from '@/server/auth';
import { Desk } from '@/features/workspace/desk';
import { Setup } from '@/features/workspace/setup';
import { JobsWorkspace } from '@/features/jobs/components/jobs-workspace';
export const dynamic = 'force-dynamic';
export default async function Section({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (section === 'setup') return <Setup />;
  if (section === 'preview') return <JobsWorkspace />;
  if (!['applications', 'sources', 'resume', 'settings'].includes(section))
    notFound();
  if (!configured()) return <Setup />;
  try {
    await session();
  } catch {
    redirect('/login');
  }
  return <Desk section={section} localOpen={localOpenAccess()} />;
}
