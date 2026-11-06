import type { Metadata } from 'next';
import Link from 'next/link';
import { ProsePage } from '@/components/prose-page';

export const metadata: Metadata = { title: 'About' };

export default function AboutPage() {
  return (
    <ProsePage title="About Intern External" intro="An internship board that goes straight to the source.">
      <p>Students lose good opportunities because postings are scattered across hundreds of career pages and reach aggregators late. Intern External watches employer job boards directly and puts every internship in one place, refreshed throughout the day.</p>
      <p>We’re careful with data: every listing links to the employer’s original posting, unknown details are labelled “Not specified”, and the AI tools only use what you write in your profile.</p>
      <p>See exactly which employers we watch on the <Link href="/sources">Data sources</Link> page.</p>
    </ProsePage>
  );
}
