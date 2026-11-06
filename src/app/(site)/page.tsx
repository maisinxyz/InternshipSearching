import Link from 'next/link';
import { ArrowRight, Bell, Bot, FileText, KanbanSquare, Mail, Search, UserRound, Users } from 'lucide-react';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { openJobs, stats } from '@/lib/jobs';
import { postedTime } from '@/lib/search';
import { slugify } from '@/lib/taxonomy';
import { CompanyLogo } from '@/components/company-logo';
import { FAQ, FaqList } from '@/components/faq';
import { postedLabel } from '@/lib/format';

export const dynamic = 'force-dynamic';

const TOOLS = [
  { id: 'alerts', icon: Bell, title: 'Internship alerts', body: 'Save any search and get an email the moment a new posting matches, or a daily digest.' },
  { id: 'tracker', icon: KanbanSquare, title: 'Application tracker', body: 'Drag applications from Saved to Applied, Interview and Offer, with dates and notes.' },
  { id: 'resume', icon: FileText, title: 'AI resume builder', body: 'Turn your profile into an ATS-friendly resume tailored to each posting’s keywords.' },
  { id: 'cover', icon: Mail, title: 'Cover letter builder', body: 'Draft a specific, honest cover letter for any job in seconds, then edit it freely.' },
  { id: 'contacts', icon: Users, title: 'Contact manager', body: 'Keep recruiters, alumni and referrals in one place, linked to the roles you care about.' },
  { id: 'profile', icon: UserRound, title: 'Unified profile', body: 'Experience, education, projects, skills, activities and volunteering, written once and reused everywhere.' },
];

export default async function Home() {
  if (await currentUser()) redirect('/internships');
  const s = stats();
  const latest = openJobs().sort((a, b) => postedTime(b).localeCompare(postedTime(a))).slice(0, 5);
  const logos = db().prepare('SELECT name, logo FROM companies WHERE logo IS NOT NULL ORDER BY name').all() as { name: string; logo: string }[];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 -top-40 h-[480px] bg-[radial-gradient(ellipse_at_top,_#e4e7ff_0%,_transparent_65%)]" aria-hidden />
        <div className="relative mx-auto max-w-4xl px-4 pb-16 pt-20 text-center sm:px-6 sm:pt-28">
          <p className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-sm font-medium text-muted">
            <span className="size-2 rounded-full bg-mint" aria-hidden /> {s.today} new postings in the last 24 hours
          </p>
          <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            Find internships <span className="underline-mark">before the crowd</span> does.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
            Intern External checks employer career pages all day and puts every new internship in one searchable board, with alerts, a tracker and AI tools to help you apply.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/sign-up" className="btn-primary px-6 py-3 text-base">Start for free <ArrowRight className="size-4" /></Link>
            <Link href="/internships" className="btn-ghost px-6 py-3 text-base">Browse internships</Link>
          </div>
          <dl className="mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-4">
            {[[s.open.toLocaleString(), 'open internships'], [s.companies, 'employers watched'], ['30 min', 'refresh cycle']].map(([v, l]) => (
              <div key={l} className="rounded-2xl border border-line bg-white p-4">
                <dt className="sr-only">{l}</dt>
                <dd className="font-display text-2xl font-extrabold sm:text-3xl">{v}</dd>
                <dd className="text-xs text-muted sm:text-sm">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
        {/* Logo strip */}
        <div className="relative border-y border-line bg-white py-6">
          <p className="mb-4 text-center text-sm font-semibold text-muted">Internships from companies like</p>
          <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
            <div className="marquee flex w-max gap-10">
              {[...logos, ...logos].map((l, i) => (
                <div key={i} className="flex items-center gap-2 opacity-80 grayscale transition hover:opacity-100 hover:grayscale-0" aria-hidden={i >= logos.length}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.logo} alt="" className="size-6" />
                  <span className="whitespace-nowrap font-display font-bold text-ink/80">{l.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live board preview */}
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Every new posting, the day it goes live</h2>
          <p className="mt-4 text-lg text-muted">We read career pages directly, so roles show up here before they’re buried on the big job sites. Filter by location, term, major, company and size.</p>
          <Link href="/internships" className="mt-6 inline-flex items-center gap-1.5 font-semibold text-brand hover:underline">Open the board <ArrowRight className="size-4" /></Link>
        </div>
        <div className="card p-3 shadow-2xl shadow-ink/10">
          <div className="flex items-center gap-2 rounded-xl border border-line px-3 py-2.5 text-sm text-muted"><Search className="size-4" /> Search for roles, companies, or locations</div>
          <ul className="mt-2 divide-y divide-line">
            {latest.map((j) => (
              <li key={j.id}>
                <Link href={`/internships/${encodeURIComponent(j.id)}`} className="flex items-center gap-3 rounded-xl p-3 hover:bg-canvas">
                  <CompanyLogo name={j.company_name} logo={j.logo} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{j.title}</p>
                    <p className="truncate text-xs text-muted">{j.company_name} · {j.city ?? j.country ?? 'Location not specified'}</p>
                  </div>
                  <span className="hidden shrink-0 text-xs text-muted sm:block">{postedLabel(j)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* City counts */}
      <section className="bg-canvas py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Open internships by city</h2>
            <p className="mt-3 text-muted">Live counts from the board right now.</p>
          </div>
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {s.cities.map(([city, n]) => (
              <li key={city}>
                <Link href={`/internships/location/${slugify(city)}`} className="card flex items-center justify-between p-4 transition hover:border-brand">
                  <span className="font-semibold">{city}</span>
                  <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-sm font-bold text-brand">{n}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Tools */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Everything you need to land the offer</h2>
          <p className="mt-3 text-muted">One account, from first search to signed offer.</p>
        </div>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((t) => (
            <li key={t.id} id={t.id} className="card p-6">
              <span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand"><t.icon className="size-5" aria-hidden /></span>
              <h3 className="mt-4 font-display text-lg font-bold">{t.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{t.body}</p>
            </li>
          ))}
        </ul>
        <div className="mt-10 rounded-3xl bg-ink p-8 text-white sm:p-12">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <Bot className="size-7 text-sun" aria-hidden />
              <h3 className="mt-3 font-display text-2xl font-extrabold">Tailored, never invented</h3>
              <p className="mt-2 text-white/70">The AI builders only use what’s in your profile. If a posting wants a skill you don’t have, they won’t claim it for you.</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              {['Saved', 'Applied', 'Interview'].map((stage, i) => (
                <div key={stage} className="rounded-2xl bg-white/10 p-3">
                  <p className="font-semibold">{stage}</p>
                  <div className="mt-2 space-y-2">{Array.from({ length: 3 - i }, (_, k) => <div key={k} className="h-8 rounded-lg bg-white/15" />)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-canvas py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-center font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Frequently asked questions</h2>
          <FaqList items={FAQ.slice(0, 7)} />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-brand px-6 py-14 text-center text-white">
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Try Intern External for free</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">Create an account in seconds. Save jobs, set alerts and track every application.</p>
          <Link href="/sign-up" className="btn mt-7 bg-white px-6 py-3 text-base text-brand hover:bg-brand-soft">Start for free <ArrowRight className="size-4" /></Link>
        </div>
      </section>
    </>
  );
}
