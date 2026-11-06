import type { Metadata } from 'next';
import { ProsePage } from '@/components/prose-page';

export const metadata: Metadata = { title: 'Terms of service' };

export default function TermsPage() {
  return (
    <ProsePage title="Terms of service" intro="Plain-language summary. Have it reviewed before any public launch.">
      <ul>
        <li>Listings come from employers’ public job boards. We don’t guarantee that any role is still open or accurately described. Always check the employer’s posting.</li>
        <li>Company names and logos belong to their owners and identify the employer only.</li>
        <li>AI-generated documents are drafts. You’re responsible for reviewing them before you send them.</li>
        <li>Don’t misuse the service, scrape it aggressively, or attempt to access other users’ data.</li>
      </ul>
    </ProsePage>
  );
}
