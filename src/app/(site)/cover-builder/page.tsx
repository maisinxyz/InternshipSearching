import type { Metadata } from 'next';
import { BuilderPage } from '@/components/builder-page';

export const metadata: Metadata = { title: 'Cover Builder' };

export default async function Page({ searchParams }: { searchParams: Promise<{ job?: string; doc?: string }> }) {
  return <BuilderPage kind="cover" sp={await searchParams} />;
}
