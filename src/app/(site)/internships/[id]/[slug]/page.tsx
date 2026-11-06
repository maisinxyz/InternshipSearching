import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Board } from '@/components/board';
import { facets } from '@/lib/jobs';
import { EMPTY, parseFilters, type Filters } from '@/lib/search';
import { slugify } from '@/lib/taxonomy';

// The first segment is the facet (location | role | company | term); it shares the [id] folder with job detail pages.
type Params = { id: string; slug: string };

function resolve({ id: facet, slug }: Params): { filters: Filters; title: string } | null {
  const f = facets();
  if (facet === 'location') {
    if (slug === 'remote') return { filters: { ...EMPTY, location: ['Remote'] }, title: 'Remote internships' };
    const place = [...f.countries, ...f.cities].map(([p]) => p).find((p) => slugify(p) === slug);
    return place ? { filters: { ...EMPTY, location: [place] }, title: `Internships in ${place}` } : null;
  }
  if (facet === 'role') {
    const major = f.majors.find((m) => slugify(m) === slug);
    return major ? { filters: { ...EMPTY, major: [major] }, title: `${major} internships` } : null;
  }
  if (facet === 'company') {
    const c = f.companies.find((x) => x.slug === slug);
    return c ? { filters: { ...EMPTY, company: [c.slug] }, title: `${c.name} internships` } : null;
  }
  if (facet === 'term') {
    const t = f.terms.map(([x]) => x).find((x) => slugify(x) === slug);
    return t ? { filters: { ...EMPTY, term: [t] }, title: `${t} internships` } : null;
  }
  return null;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  return { title: resolve(await params)?.title ?? 'Internships' };
}

export default async function FacetPage({ params, searchParams }: { params: Promise<Params>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const p = await params;
  const r = resolve(p);
  if (!r) notFound();
  const sp = await searchParams;
  const extra = parseFilters(sp);
  const page = Math.max(1, Math.min(50, Number(sp.page) || 1));
  return <Board filters={{ ...extra, ...Object.fromEntries(Object.entries(r.filters).filter(([, v]) => (Array.isArray(v) ? v.length : v))) } as Filters} page={page} title={r.title} basePath={`/internships/${p.id}/${p.slug}`} />;
}
