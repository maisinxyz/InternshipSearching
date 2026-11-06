import type { Metadata } from 'next';
import { BuilderPage } from '@/components/builder-page';

export const metadata: Metadata = { title: 'Resume Builder' };

export default async function Page({ searchParams }: { searchParams: Promise<{ job?: string; doc?: string }> }) {
  return <BuilderPage kind="resume" sp={await searchParams} />;
}
