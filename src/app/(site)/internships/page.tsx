import type { Metadata } from 'next';
import { Board } from '@/components/board';
import { parseFilters } from '@/lib/search';

export const metadata: Metadata = { title: 'Internships' };

export default async function InternshipsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const page = Math.max(1, Math.min(50, Number(sp.page) || 1));
  return <Board filters={parseFilters(sp)} page={page} title="Internships" intro="Fresh roles from employer career pages, updated throughout the day." />;
}
