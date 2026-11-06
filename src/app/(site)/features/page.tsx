import type { Metadata } from 'next';
import Link from 'next/link';
import { Bell, FileText, KanbanSquare, Mail, Search, UserRound, Users } from 'lucide-react';

export const metadata: Metadata = { title: 'Features' };

const F = [
  { id: 'board', icon: Search, title: 'A board built from the source', body: 'We check employer career pages on Greenhouse, Lever and Ashby every 30 minutes. Filter by location, posted date, major, company, term, company size, work mode, employment type and pay.', href: '/internships' },
  { id: 'alerts', icon: Bell, title: 'Internship alerts', body: 'Save any combination of filters. Choose instant or daily alerts, and see new matches under the bell.', href: '/searches' },
  { id: 'tracker', icon: KanbanSquare, title: 'Application tracker', body: 'A drag-and-drop board with Saved, Applied, Interview, Offer and Rejected. Applied dates are recorded automatically and you can add notes.', href: '/tracker' },
  { id: 'resume', icon: FileText, title: 'AI resume builder', body: 'Generates a one-page, ATS-friendly resume from your profile, tailored to a posting’s keywords. It never invents experience. Edit it, then save it as a PDF.', href: '/resume-builder' },
  { id: 'cover', icon: Mail, title: 'Cover letter builder', body: 'A focused 250 to 350 word letter for a specific role, grounded in what you’ve actually done.', href: '/cover-builder' },
  { id: 'contacts', icon: Users, title: 'Contact manager', body: 'Track recruiters, alumni and referrals alongside your applications. Automatic recruiter lookup is planned.', href: '/contacts' },
  { id: 'profile', icon: UserRound, title: 'Unified profile', body: 'Experience, education, projects, skills, activities and volunteering, written once and reused by every tool.', href: '/profile' },
];

export default function FeaturesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Everything you need, from search to offer</h1>
        <p className="mt-4 text-lg text-muted">Free tools that work together, so you spend less time searching and more time applying.</p>
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {F.map((f) => (
          <section key={f.id} id={f.id} className="card scroll-mt-24 p-7">
            <span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand"><f.icon className="size-5" aria-hidden /></span>
            <h2 className="mt-4 font-display text-xl font-bold">{f.title}</h2>
            <p className="mt-2 text-muted">{f.body}</p>
            <Link href={f.href} className="mt-4 inline-block text-sm font-semibold text-brand hover:underline">Open →</Link>
          </section>
        ))}
      </div>
    </div>
  );
}
