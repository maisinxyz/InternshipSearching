import { redirect } from 'next/navigation';
import { configured, session } from '@/server/auth';
import { Desk } from '@/features/workspace/desk';
import { Setup } from '@/features/workspace/setup';
export const dynamic = 'force-dynamic';
export default async function Home() {
  if (!configured()) return <Setup />;
  try {
    await session();
  } catch {
    redirect('/login');
  }
  return <Desk />;
}
