import { describe, expect, it } from 'vitest';
import { isInternship, parsePlace, payOf, termOf, workModeOf } from '../src/lib/taxonomy.ts';
import { htmlToText, normalize } from '../src/lib/collect.ts';

describe('parsePlace', () => {
  it('recognizes Canadian, US and international locations', () => {
    expect(parsePlace('Toronto, ON')).toMatchObject({ city: 'Toronto', country: 'Canada' });
    expect(parsePlace('London, Ontario, Canada')).toMatchObject({ country: 'Canada' });
    expect(parsePlace('London')).toMatchObject({ city: 'London', country: 'United Kingdom' });
    expect(parsePlace('San Francisco, CA')).toMatchObject({ city: 'Bay Area', country: 'United States', region: 'CA' });
    expect(parsePlace('Cambridge, MA')).toMatchObject({ city: 'Boston', country: 'United States' });
    expect(parsePlace('Zurich, CH')).toMatchObject({ country: 'Switzerland' });
    expect(parsePlace('Remote - Canada')).toMatchObject({ country: 'Canada', remote: true });
  });
  it('keeps unknown places explicit', () => {
    expect(parsePlace('Flexible - Any Site')).toEqual({ city: null, region: null, country: null, remote: false });
  });
});

describe('attributes', () => {
  it('detects internships but not senior roles', () => {
    expect(isInternship('Software Engineering Intern')).toBe(true);
    expect(isInternship('Co-op Student, Firmware')).toBe(true);
    expect(isInternship('Senior Software Engineer')).toBe(false);
    expect(isInternship('Internal Tools Engineer')).toBe(false);
  });
  it('reads term, pay and work mode', () => {
    expect(termOf('Data Science Intern (Summer 2027)', '')).toBe('Summer 2027');
    expect(termOf('Intern', 'Join us for the Fall 2026 term')).toBe('Fall 2026');
    expect(termOf('Intern', 'no season here')).toBeNull();
    expect(payOf('The hourly rate is $45 - $55/hour')).toEqual({ pay: 'paid', payText: '$45 - $55/hour' });
    expect(payOf('nothing')).toEqual({ pay: null, payText: null });
    expect(workModeOf('This is a hybrid role', [])).toBe('hybrid');
    expect(workModeOf('', [], 'Remote')).toBe('remote');
    expect(workModeOf('', [])).toBeNull();
  });
});

describe('collector normalization', () => {
  it('decodes escaped Greenhouse HTML', () => {
    expect(htmlToText('&lt;p&gt;Hello &amp;amp; welcome&lt;/p&gt;&lt;ul&gt;&lt;li&gt;Python&lt;/li&gt;&lt;/ul&gt;')).toBe('Hello & welcome\n\n- Python');
  });
  it('builds a filterable job', () => {
    const n = normalize({ identity: '1', title: 'Software Engineer Intern - Summer 2027', url: 'https://x', text: 'Hybrid role. Python and React. $40/hour', locations: ['Vancouver, BC'], posted: null });
    expect(n).toMatchObject({ country: 'Canada', city: 'Vancouver', work_mode: 'hybrid', term: 'Summer 2027', pay: 'paid', employment_type: 'Internship', posted_at: null });
    expect(n.skills).toEqual(['Python', 'React']);
    expect(n.majors).toContain('Software Engineering');
  });
});

describe('entities', () => {
  it('decodes named punctuation entities', () => {
    expect(htmlToText('&lt;p&gt;$53,800&amp;mdash;$64,600 CAD&lt;/p&gt;')).toBe('$53,800—$64,600 CAD');
  });
});
