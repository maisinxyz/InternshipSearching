import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import { CompanyLogo } from '@/components/company-logo';

export const metadata: Metadata = { title: 'Companies' };
export const dynamic = 'force-dynamic';

export default function CompaniesPage() {
  const rows = db().prepare(`SELECT c.slug, c.name, c.logo, c.industry, COUNT(j.id) AS n FROM companies c
    LEFT JOIN jobs j ON j.company_slug = c.slug AND j.closed_at IS NULL GROUP BY c.slug ORDER BY n DESC, c.name`).all() as { slug: string; name: string; logo: string | null; industry: string | null; n: number }[];
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold tracking-tight">Companies</h1>
      <p className="mt-1 text-muted">{rows.length} employers watched.</p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((c) => (
          <li key={c.slug}>
            <Link href={`/internships/company/${c.slug}`} className="card flex items-center gap-3 p-4 transition hover:border-brand">
              <CompanyLogo name={c.name} logo={c.logo} size="sm" />
              <span className="min-w-0 flex-1"><span className="block truncate font-semibold">{c.name}</span><span className="block truncate text-xs text-muted">{c.industry}</span></span>
              <span className="text-sm font-bold text-brand">{c.n}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
