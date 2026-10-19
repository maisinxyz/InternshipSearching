'use client';
import { useState } from 'react';
import type { Job } from '@/domain/job';
import { relocationBudget } from '@/domain/opportunity';

const labels = {
  months: 'Term length in months',
  monthlyTakeHome: 'Monthly take-home pay',
  monthlyRent: 'Monthly rent and utilities',
  monthlyOther: 'Other monthly living costs',
  movingCosts: 'Travel and moving costs',
  confirmedSupport: 'Confirmed cash assistance for the term',
  localTermSavings: 'Expected savings if staying local for this term',
};
export function RelocationReview({ job }: { job: Job }) {
  const [currency, setCurrency] = useState<'CAD' | 'USD'>('CAD');
  const [values, setValues] = useState<Record<keyof typeof labels, string>>({
    months: '',
    monthlyTakeHome: '',
    monthlyRent: '',
    monthlyOther: '',
    movingCosts: '',
    confirmedSupport: '',
    localTermSavings: '',
  });
  let result: ReturnType<typeof relocationBudget> | null = null;
  if (Object.values(values).every((v) => v.trim() !== '')) {
    try {
      result = relocationBudget({
        ...Object.fromEntries(
          Object.entries(values).map(([k, v]) => [k, Number(v)]),
        ),
        currency,
      } as Parameters<typeof relocationBudget>[0]);
    } catch {
      /* Incomplete or invalid scenario remains uncalculated. */
    }
  }
  const money = (n: number) =>
    new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  return (
    <section className="detail-section">
      <h3>Work location & moving support</h3>
      {(['remoteBC', 'sponsorship', 'relocation', 'housing'] as const).map(
        (key) => (
          <div className="support-fact" key={key}>
            <strong>
              {
                {
                  remoteBC: 'Remote from BC',
                  sponsorship: 'Visa sponsorship',
                  relocation: 'Relocation assistance',
                  housing: 'Housing support',
                }[key]
              }
            </strong>
            <span>
              {job.opportunity?.[key].status.replaceAll('-', ' ') ||
                'not stated'}
            </span>
            {job.opportunity?.[key].quotes.map((q) => (
              <blockquote key={q}>{q}</blockquote>
            ))}
          </div>
        ),
      )}
      <p className="section-caption">
        Work authorization must be confirmed separately. A sponsorship question
        on an application is not an offer of sponsorship.
      </p>
      <details className="original-description">
        <summary>Would moving be worthwhile?</summary>
        <div className="original-text">
          <p>
            Compare the money remaining after the term with staying local. Enter
            your own estimates in one currency. These scenario inputs reset when
            you open another job.
          </p>
          <label className="desk-field">
            Scenario currency
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as 'CAD' | 'USD')}
            >
              <option>CAD</option>
              <option>USD</option>
            </select>
          </label>
          <div className="desk-form-grid">
            {Object.entries(labels).map(([key, label]) => (
              <label className="desk-field" key={key}>
                <span>{label}</span>
                <input
                  type="number"
                  step="any"
                  min={
                    key === 'localTermSavings'
                      ? undefined
                      : key === 'months'
                        ? '0.1'
                        : '0'
                  }
                  value={values[key as keyof typeof labels]}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [key]: e.target.value }))
                  }
                />
              </label>
            ))}
          </div>
          <p role="status">
            {result
              ? `Estimated term savings: ${money(result.remaining)}. Difference from staying local: ${money(result.versusLocal)}.`
              : 'Enter every amount, including zero where appropriate, to compare scenarios.'}
          </p>
          <p>
            Use take-home pay for the actual term and a short-term apartment
            quote. Include insurance and transport; keep refundable deposits
            available separately. Do not count unconfirmed benefits or equity as
            cash.
          </p>
          <h4>The career case</h4>
          <p>
            Look for technical ownership, mentoring, work you can discuss in
            future interviews, and a credible return-offer path. Company
            reputation alone does not establish these. Review the description
            and confirm the team’s plans.
          </p>
        </div>
      </details>
    </section>
  );
}
