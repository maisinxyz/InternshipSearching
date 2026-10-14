'use client';

import { useState } from 'react';
import type { Company } from '@/domain/job';

export function CompanyLogo({
  company,
  large = false,
}: {
  company: Company;
  large?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const initials = company.name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('');
  return (
    <span
      className={`company-logo ${large ? 'logo-large' : ''} ${!company.logo || failed ? 'logo-fallback' : ''}`}
    >
      {company.logo && !failed ? (
        // Static, vendored brand icons. Never fetch a logo by an ambiguous company name.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={company.logo.path}
          alt={`${company.name} logo`}
          width={34}
          height={34}
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-label={`${company.name} initials`}>{initials}</span>
      )}
    </span>
  );
}
