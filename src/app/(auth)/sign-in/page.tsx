import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AuthForm } from '@/components/auth-form';
import { currentUser } from '@/lib/auth';

export const metadata: Metadata = { title: 'Sign in' };

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const raw = (await searchParams).next ?? '/internships';
  const next = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/internships';
  if (await currentUser()) redirect(next);
  return (
    <>
      <h1 className="font-display text-3xl font-extrabold tracking-tight">Intern External</h1>
      <p className="mb-8 mt-2 text-muted">Enter your password to continue.</p>
      <AuthForm next={next} />
    </>
  );
}
