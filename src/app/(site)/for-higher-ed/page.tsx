import type { Metadata } from 'next';
import { ProsePage } from '@/components/prose-page';

export const metadata: Metadata = { title: 'For Higher Ed' };

export default function HigherEdPage() {
  return (
    <ProsePage title="For career centres and co-op offices" intro="Give your students a live view of internships posted directly by employers.">
      <h2>What students get</h2>
      <ul>
        <li>A board refreshed from employer career pages every 30 minutes</li>
        <li>Saved searches with alerts, plus an application tracker</li>
        <li>Resume and cover letter tools that never invent experience</li>
      </ul>
      <h2>Partnerships</h2>
      <p>Institution dashboards and bulk student access aren’t available yet. If you’d like to pilot Intern External with your students, contact the team running this deployment.</p>
    </ProsePage>
  );
}
