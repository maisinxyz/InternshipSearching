import type { Metadata } from 'next';
import { FaqList } from '@/components/faq';

export const metadata: Metadata = { title: 'FAQ' };

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-4xl font-extrabold tracking-tight">Frequently asked questions</h1>
      <FaqList />
    </div>
  );
}
