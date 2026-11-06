import { ChevronDown } from 'lucide-react';

export const FAQ = [
  { q: 'How is Intern External different from LinkedIn or Handshake?', a: 'We go straight to the source: employer career pages and applicant-tracking boards. New postings show up here soon after they’re published, often before they spread to the big aggregators, so you can apply while the applicant pool is still small.' },
  { q: 'How fresh are the listings?', a: 'Every employer board is re-checked on a 30-minute cycle. When a posting disappears from the employer’s page we mark it closed. Each card says “Posted” when the employer published a date, or “Found” when we only know when we first saw it.' },
  { q: 'How do I apply?', a: 'Every listing links to the employer’s own application page. We never apply on your behalf and never ask for your credentials on other sites.' },
  { q: 'Is it free?', a: 'Yes. Browsing a preview of the board needs no account. A free account unlocks the full board, saved jobs, alerts, the tracker and the profile.' },
  { q: 'How do the AI resume and cover letter builders work?', a: 'They combine your profile with the job description. They only use facts you wrote, and they won’t claim skills you didn’t list. You can edit everything before you download it.' },
  { q: 'Which companies do you cover?', a: 'A curated, growing list of employers with public job boards on Greenhouse, Lever and Ashby. See the Data sources page for the full list and when each one was last checked.' },
  { q: 'How do alerts work?', a: 'Save any search with filters, then pick instant or daily alerts. New matches appear under the bell icon, and by email once email delivery is configured.' },
  { q: 'Why does a job say “Not specified”?', a: 'We only show what the posting actually says. If the employer didn’t state the term, pay or work mode, we say so instead of guessing.' },
];

export function FaqList({ items = FAQ }: { items?: { q: string; a: string }[] }) {
  return (
    <div className="mt-10 divide-y divide-line rounded-2xl border border-line bg-white">
      {items.map((f) => (
        <details key={f.q} className="group px-5 py-4 sm:px-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
            {f.q}
            <ChevronDown className="size-5 shrink-0 text-muted transition group-open:rotate-180" aria-hidden />
          </summary>
          <p className="mt-3 text-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
