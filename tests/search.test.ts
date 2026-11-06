import { describe, expect, it } from 'vitest';
import { EMPTY, matches, parseFilters, toQuery, type JobRow } from '../src/lib/search.ts';

const job: JobRow = {
  id: 'g:1', company_slug: 'stripe', company_name: 'Stripe', company_size: 'Large (1,001–10,000)', industry: 'Financial Technology',
  title: 'Software Engineer Intern', city: 'Toronto', country: 'Canada', remote: 0,
  places: JSON.stringify([{ city: 'Toronto', country: 'Canada', remote: false }]), locations: '["Toronto, ON"]',
  work_mode: 'hybrid', employment_type: 'Internship', term: 'Summer 2027', pay: 'paid', pay_text: null, deadline: null,
  posted_at: null, first_seen_at: '2026-11-05T00:00:00Z', closed_at: null, summary: '', skills: '["Python"]',
  majors: '["Computer Science"]', url: '', logo: null, domain: null,
};
const at = Date.parse('2026-11-06T00:00:00Z');

describe('filters', () => {
  it('round-trips through the URL', () => {
    const f = { ...EMPTY, q: 'stripe', location: ['Canada', 'Remote'], term: ['Summer 2027'], posted: '7' as const };
    expect(parseFilters(new URLSearchParams(toQuery(f)))).toEqual(f);
  });
  it('matches on every dimension', () => {
    expect(matches(job, EMPTY, at)).toBe(true);
    expect(matches(job, { ...EMPTY, q: 'stripe python' }, at)).toBe(true);
    expect(matches(job, { ...EMPTY, q: 'google' }, at)).toBe(false);
    expect(matches(job, { ...EMPTY, location: ['Toronto'] }, at)).toBe(true);
    expect(matches(job, { ...EMPTY, location: ['Remote'] }, at)).toBe(false);
    expect(matches(job, { ...EMPTY, posted: '1' }, at)).toBe(true);
    expect(matches(job, { ...EMPTY, posted: '1' }, at + 3 * 86_400_000)).toBe(false);
    expect(matches(job, { ...EMPTY, term: ['Fall 2027'] }, at)).toBe(false);
    expect(matches(job, { ...EMPTY, major: ['Computer Science'], mode: ['hybrid'], pay: 'paid' }, at)).toBe(true);
  });
});
