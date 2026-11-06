'use client';
import Link from 'next/link';
import { BellPlus, Search, SlidersHorizontal, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { saveSearch } from '@/lib/actions';
import { activeCount, EMPTY, toQuery, type Filters } from '@/lib/search';
import { Dropdown } from './dropdown';

type Facets = {
  countries: [string, number][]; cities: [string, number][]; companies: { slug: string; name: string; n: number }[];
  terms: [string, number][]; majors: string[]; sizes: string[]; remote: number;
};
type ListKey = 'location' | 'major' | 'company' | 'term' | 'size' | 'mode' | 'type';

const POSTED = [['1', 'Past 24 hours'], ['3', 'Past 3 days'], ['7', 'Past week'], ['30', 'Past month']] as const;

export function FilterBar({ filters, facets, signedIn, basePath = '/internships' }: { filters: Filters; facets: Facets; signedIn: boolean; basePath?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(filters.q);
  useEffect(() => setQ(filters.q), [filters.q]);

  const go = (next: Filters) => {
    const qs = toQuery(next);
    // Facet landing pages (/internships/location/…) hand off to the main board once filters change.
    router.push(`${pathname === basePath ? basePath : '/internships'}${qs ? `?${qs}` : ''}`, { scroll: false });
  };
  const toggle = (key: ListKey, value: string) =>
    go({ ...filters, [key]: filters[key].includes(value) ? filters[key].filter((v) => v !== value) : [...filters[key], value] });

  const Check = ({ k, value, label, count }: { k: ListKey; value: string; label?: string; count?: number }) => (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm hover:bg-canvas">
      <input type="checkbox" className="size-4 accent-brand" checked={filters[k].includes(value)} onChange={() => toggle(k, value)} />
      <span className="flex-1 truncate">{label ?? value}</span>
      {count !== undefined && <span className="text-xs text-muted">{count}</span>}
    </label>
  );
  const Heading = ({ children }: { children: React.ReactNode }) => <div className="px-2.5 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-muted">{children}</div>;
  const n = (k: ListKey) => (filters[k].length ? ` · ${filters[k].length}` : '');
  const [companyQuery, setCompanyQuery] = useState('');

  return (
    <div className="space-y-3">
      <form
        role="search"
        onSubmit={(e) => { e.preventDefault(); go({ ...filters, q: q.trim() }); }}
        className="flex items-center gap-2 rounded-2xl border border-line bg-white p-1.5 pl-4 shadow-sm focus-within:border-brand focus-within:ring-4 focus-within:ring-brand-soft"
      >
        <Search className="size-5 shrink-0 text-muted" aria-hidden />
        <input
          value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search internships"
          placeholder="Search for roles, companies, or locations" className="min-w-0 flex-1 bg-transparent py-2 text-[15px] outline-none placeholder:text-muted/80"
        />
        {q && <button type="button" aria-label="Clear search" onClick={() => { setQ(''); go({ ...filters, q: '' }); }} className="rounded-full p-1.5 text-muted hover:bg-canvas"><X className="size-4" /></button>}
        <button className="btn-primary px-5">Search</button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <Dropdown label={`Location${n('location')}`} active={filters.location.length > 0} panelClass="w-72 max-h-96 overflow-y-auto">
          <Check k="location" value="Remote" count={facets.remote} />
          <Heading>Countries</Heading>
          {facets.countries.slice(0, 10).map(([c, count]) => <Check key={c} k="location" value={c} count={count} />)}
          <Heading>Cities</Heading>
          {facets.cities.map(([c, count]) => <Check key={c} k="location" value={c} count={count} />)}
        </Dropdown>

        <Dropdown label={filters.posted ? POSTED.find(([v]) => v === filters.posted)![1] : 'Posted'} active={Boolean(filters.posted)} panelClass="w-56">
          {(close) => [['', 'Any time'] as const, ...POSTED].map(([v, label]) => (
            <button key={v} onClick={() => { go({ ...filters, posted: v }); close(); }} className={`block w-full rounded-lg px-2.5 py-1.5 text-left text-sm hover:bg-canvas ${filters.posted === v ? 'font-semibold text-brand' : ''}`}>{label}</button>
          ))}
        </Dropdown>

        <Dropdown label={`Major${n('major')}`} active={filters.major.length > 0} panelClass="w-72 max-h-96 overflow-y-auto">
          {facets.majors.map((m) => <Check key={m} k="major" value={m} />)}
        </Dropdown>

        <Dropdown label={`Company${n('company')}`} active={filters.company.length > 0} panelClass="w-72">
          <input value={companyQuery} onChange={(e) => setCompanyQuery(e.target.value)} placeholder="Find a company" aria-label="Find a company" className="field mb-1 py-2" />
          <div className="max-h-72 overflow-y-auto">
            {facets.companies.filter((c) => c.name.toLowerCase().includes(companyQuery.toLowerCase())).map((c) => <Check key={c.slug} k="company" value={c.slug} label={c.name} count={c.n} />)}
          </div>
        </Dropdown>

        <Dropdown label={`Term${n('term')}`} active={filters.term.length > 0} panelClass="w-60 max-h-96 overflow-y-auto">
          {facets.terms.map(([t, count]) => <Check key={t} k="term" value={t} count={count} />)}
        </Dropdown>

        <Dropdown label={`Company Size${n('size')}`} active={filters.size.length > 0} panelClass="w-64">
          {facets.sizes.map((s) => <Check key={s} k="size" value={s} />)}
        </Dropdown>

        <Dropdown label={<><SlidersHorizontal className="size-4" aria-hidden /> More{filters.mode.length + filters.type.length + (filters.pay ? 1 : 0) ? ` · ${filters.mode.length + filters.type.length + (filters.pay ? 1 : 0)}` : ''}</>} active={filters.mode.length + filters.type.length > 0 || Boolean(filters.pay)} panelClass="w-64">
          <Heading>Work mode</Heading>
          <Check k="mode" value="remote" label="Remote" /><Check k="mode" value="hybrid" label="Hybrid" /><Check k="mode" value="onsite" label="On-site" />
          <Heading>Employment type</Heading>
          <Check k="type" value="Internship" /><Check k="type" value="Co-op" /><Check k="type" value="Part-time" />
          <Heading>Pay</Heading>
          <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm hover:bg-canvas">
            <input type="checkbox" className="size-4 accent-brand" checked={filters.pay === 'paid'} onChange={() => go({ ...filters, pay: filters.pay ? '' : 'paid' })} />
            Paid only (stated in posting)
          </label>
        </Dropdown>

        <div className="ml-auto flex items-center gap-2">
          <SaveSearch filters={filters} signedIn={signedIn} />
          <button type="button" onClick={() => { setQ(''); go(EMPTY); }} disabled={activeCount(filters) === 0} className="btn text-muted hover:text-ink disabled:opacity-40">Clear Filters</button>
        </div>
      </div>
    </div>
  );
}

function SaveSearch({ filters, signedIn }: { filters: Filters; signedIn: boolean }) {
  const [state, action, pending] = useActionState(saveSearch, undefined);
  const query = toQuery(filters);
  if (!signedIn)
    return <Link href={`/sign-up?next=${encodeURIComponent(`/internships${query ? `?${query}` : ''}`)}`} className="btn-ghost"><BellPlus className="size-4" aria-hidden /> Save Search</Link>;
  return (
    <Dropdown align="right" className="btn-ghost [&>svg:last-child]:hidden" panelClass="w-80" label={<><BellPlus className="size-4" aria-hidden /> Save Search</>}>
      <form action={action} className="space-y-3 p-2">
        <div className="font-semibold">Saved filters & alerts</div>
        <input type="hidden" name="query" value={query} />
        <div>
          <label className="label" htmlFor="ss-name">Name</label>
          <input id="ss-name" name="name" className="field" placeholder="e.g. Toronto SWE, Summer 2027" defaultValue={filters.q || ''} />
        </div>
        <div>
          <label className="label" htmlFor="ss-alerts">Email me new matches</label>
          <select id="ss-alerts" name="alerts" className="field" defaultValue="daily">
            <option value="instant">As soon as they’re posted</option>
            <option value="daily">Daily digest</option>
            <option value="off">Don’t send alerts</option>
          </select>
        </div>
        <button className="btn-primary w-full" disabled={pending}>{pending ? 'Saving…' : 'Save search'}</button>
        {state?.ok && <p role="status" className="text-sm text-mint">{state.ok} <Link href="/searches" className="font-semibold underline">Manage</Link></p>}
        {state?.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
      </form>
    </Dropdown>
  );
}
