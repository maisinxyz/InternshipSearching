import Link from 'next/link';
import { Wordmark } from './logo';

const COLS = [
  { title: 'Browse internships', links: [['/internships/location/canada', 'Locations'], ['/internships/role/software-engineering', 'Roles'], ['/internships?size=Enterprise%20(10%2C000%2B)', 'Industries'], ['/internships/role/data-science', 'Fields of study'], ['/internships/term/summer-2027', 'Terms'], ['/internships/location/remote', 'Remote'], ['/companies', 'Companies']] },
  { title: 'Features', links: [['/features#resume', 'AI resume builder'], ['/features#cover', 'Cover letter builder'], ['/features#contacts', 'Contact manager'], ['/features#alerts', 'Internship alerts'], ['/features#tracker', 'Application tracker'], ['/features#profile', 'Unified profile']] },
  { title: 'Resources', links: [['/blog', 'Blog'], ['/resources', 'Guides'], ['/faq', 'FAQ'], ['/privacy', 'Privacy policy'], ['/terms', 'Terms of service']] },
  { title: 'Company', links: [['/about', 'About'], ['/for-higher-ed', 'For higher ed'], ['/sources', 'Data sources']] },
] as const;

export function SiteFooter() {
  return (
    <footer className="no-print border-t border-line bg-canvas">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.3fr_repeat(4,1fr)]">
        <div className="space-y-3">
          <Wordmark />
          <p className="max-w-xs text-sm text-muted">Internships pulled straight from employer career pages, refreshed throughout the day.</p>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <h2 className="mb-3 text-sm font-semibold">{c.title}</h2>
            <ul className="space-y-2">
              {c.links.map(([href, label]) => <li key={label}><Link href={href} className="text-sm text-muted hover:text-ink">{label}</Link></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-2 px-4 py-5 text-xs text-muted sm:px-6">
          <span>© {new Date().getFullYear()} Intern External</span>
          <span>Company names and logos belong to their owners. Listings link to the employer’s own posting.</span>
        </div>
      </div>
    </footer>
  );
}
