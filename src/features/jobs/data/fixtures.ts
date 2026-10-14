import {
  companySchema,
  jobSchema,
  userJobStateSchema,
  visitStateSchema,
  type Company,
  type Job,
} from '@/domain/job';

// All role content is authored demonstration data, not a real vacancy or claim
// about an employer. Fixtures have no posting/application URL or connector.
export const FIXTURE_OWNER = 'sample-owner';
const base = (id: string) => ({
  id,
  owner_id: FIXTURE_OWNER,
  created_at: '2026-10-01T16:00:00Z',
  updated_at: '2026-10-13T16:00:00Z',
});
const day = (value: string) => ({ precision: 'day' as const, value });

function company(
  id: string,
  name: string,
  domain: string,
  careers: string,
  logoSlug: string | null,
): Company {
  return companySchema.parse({
    ...base(id),
    name,
    verified_domain: domain,
    careers_url: careers,
    logo: logoSlug
      ? {
          path: `/logos/${logoSlug}.svg`,
          source_url: `https://github.com/simple-icons/simple-icons/blob/develop/icons/${logoSlug}.svg`,
          license: 'CC0-1.0; employer trademarks retained',
        }
      : null,
  });
}

const companies = {
  shopify: company(
    'company-shopify',
    'Shopify',
    'shopify.com',
    'https://www.shopify.com/careers',
    'shopify',
  ),
  amd: company(
    'company-amd',
    'AMD',
    'amd.com',
    'https://careers.amd.com/',
    'amd',
  ),
  bchydro: company(
    'company-bchydro',
    'BC Hydro',
    'bchydro.com',
    'https://www.bchydro.com/careers.html',
    null,
  ),
  nvidia: company(
    'company-nvidia',
    'NVIDIA',
    'nvidia.com',
    'https://www.nvidia.com/en-us/about-nvidia/careers/',
    'nvidia',
  ),
  garmin: company(
    'company-garmin',
    'Garmin',
    'garmin.com',
    'https://careers.garmin.com/',
    'garmin',
  ),
  siemens: company(
    'company-siemens',
    'Siemens',
    'siemens.com',
    'https://www.siemens.com/global/en/company/jobs.html',
    'siemens',
  ),
  schneider: company(
    'company-schneider',
    'Schneider Electric',
    'se.com',
    'https://www.se.com/ww/en/about-us/careers/overview.jsp',
    'schneiderelectric',
  ),
  copperleaf: company(
    'company-copperleaf',
    'Copperleaf',
    'copperleaf.com',
    'https://www.copperleaf.com/company/careers/',
    null,
  ),
};

type FixtureSpec = Pick<
  Job,
  | 'id'
  | 'title'
  | 'company'
  | 'disciplines'
  | 'work_arrangement'
  | 'salary'
  | 'duration'
  | 'term'
  | 'involves'
  | 'technologies'
  | 'required'
  | 'preferred'
> & {
  city: string;
  province: string;
  posted: string | null;
  seen: string;
  deadline?: string;
  conflict?: boolean;
  updated?: string;
};

const fixtures: FixtureSpec[] = [
  {
    id: 'job-01-shopify',
    title: 'Software Developer Intern',
    company: companies.shopify,
    disciplines: ['software'],
    city: 'Toronto',
    province: 'ON',
    work_arrangement: 'remote',
    posted: '2026-10-13',
    seen: '2026-10-13T16:00:00Z',
    salary: {
      minimum: 35,
      maximum: 45,
      currency: 'CAD',
      interval: 'hour',
      original_text:
        'CAD $35–$45 per hour, depending on experience and location.',
      qualification: 'Depending on experience and location.',
    },
    duration: { months: 4, original_text: 'A four-month internship.' },
    term: {
      label: 'Summer 2027',
      start_date: '2027-05-03',
      original_text: 'Summer 2027, beginning May 3, 2027.',
    },
    involves: [
      'Build and ship merchant-facing product features with a small engineering team.',
      'Write tested services and improve the reliability of existing tools.',
    ],
    technologies: ['TypeScript', 'React', 'Ruby'],
    required: [
      'Currently enrolled in a computer science, engineering, or related program.',
      'Experience building software and using version control.',
      'Must be authorized to work in Canada for the internship.',
    ],
    preferred: [
      'Familiarity with React or Ruby on Rails.',
      'Experience collaborating on a software project.',
    ],
    deadline: '2026-11-06',
  },
  {
    id: 'job-02-amd',
    title: 'Firmware Engineering Co-op',
    company: companies.amd,
    disciplines: ['firmware', 'software'],
    city: 'Markham',
    province: 'ON',
    work_arrangement: 'hybrid',
    posted: '2026-10-12',
    seen: '2026-10-13T15:00:00Z',
    salary: {
      minimum: 30,
      maximum: 38,
      currency: 'CAD',
      interval: 'hour',
      original_text: 'CAD $30–$38 per hour based on academic level.',
      qualification: 'Based on academic level.',
    },
    duration: { months: 8, original_text: 'An eight-month co-op placement.' },
    term: {
      label: 'Winter 2027',
      start_date: '2027-01-04',
      original_text: 'Winter 2027, starting January 4, 2027.',
    },
    involves: [
      'Develop and debug low-level firmware for embedded platforms.',
      'Work with hardware engineers on board bring-up and automated validation.',
    ],
    technologies: ['C / C++', 'Python', 'Embedded Linux'],
    required: [
      'Enrolled in electrical, computer, or mechatronics engineering.',
      'Working knowledge of C or C++ and basic computer architecture.',
    ],
    preferred: [
      'Familiarity with JTAG, oscilloscopes, or logic analyzers.',
      'Experience with Linux and Python scripting.',
    ],
  },
  {
    id: 'job-03-bchydro',
    title:
      'Electrical Engineering Co-op — Protection, Control & Telecommunications',
    company: companies.bchydro,
    disciplines: ['electrical'],
    city: 'Burnaby',
    province: 'BC',
    work_arrangement: 'on-site',
    posted: '2026-10-12',
    seen: '2026-10-12T16:00:00Z',
    salary: {
      minimum: 29.1,
      maximum: 35.2,
      currency: 'CAD',
      interval: 'hour',
      original_text:
        'CAD $29.10–$35.20 per hour, determined by completed work terms.',
      qualification: 'Determined by completed work terms.',
    },
    duration: null,
    conflict: true,
    term: {
      label: 'Winter 2027',
      start_date: null,
      original_text: 'Winter 2027 work term; exact start date is not stated.',
    },
    involves: [
      'Support protection and control design for electrical substations.',
      'Review drawings, document test results, and assist with engineering calculations.',
    ],
    technologies: ['AutoCAD', 'Protection & controls', 'Power systems'],
    required: [
      'Enrolled in an electrical engineering co-op program.',
      'Completed second year of study before the work term begins.',
      'Eligible to work in Canada.',
    ],
    preferred: ['Familiarity with circuit analysis and electrical drawings.'],
    deadline: '2026-10-30',
  },
  {
    id: 'job-04-garmin',
    title: 'Embedded Software Engineering Intern',
    company: companies.garmin,
    disciplines: ['firmware', 'software'],
    city: 'Cochrane',
    province: 'AB',
    work_arrangement: 'unknown',
    posted: null,
    seen: '2026-10-11T17:45:00Z',
    salary: null,
    duration: null,
    term: null,
    involves: [
      'Implement embedded software features for navigation products.',
      'Investigate defects and validate changes on target hardware.',
    ],
    technologies: ['C', 'C++', 'Debugging'],
    required: [
      'Studying computer, electrical, or software engineering.',
      'Experience programming in C or C++.',
    ],
    preferred: [
      'Experience with microcontrollers or real-time operating systems.',
    ],
  },
  {
    id: 'job-05-siemens',
    title: 'Automation & Controls Engineering Co-op',
    company: companies.siemens,
    disciplines: ['electrical', 'firmware'],
    city: 'Oakville',
    province: 'ON',
    work_arrangement: 'hybrid',
    posted: '2026-10-10',
    seen: '2026-10-10T18:00:00Z',
    salary: null,
    duration: { months: 4, original_text: 'Four-month co-op.' },
    term: {
      label: 'Summer 2027',
      start_date: null,
      original_text: 'Summer 2027.',
    },
    involves: [
      'Assist with PLC programming and industrial automation testing.',
      'Create engineering documentation for control systems.',
    ],
    technologies: ['PLC', 'TIA Portal', 'Controls'],
    required: [
      'Studying mechatronics, electrical, or automation engineering.',
      'Basic understanding of control systems and electrical safety.',
    ],
    preferred: [
      'Exposure to PLC programming or industrial communication protocols.',
    ],
  },
  {
    id: 'job-06-nvidia',
    title: 'Systems Software Engineering Intern',
    company: companies.nvidia,
    disciplines: ['software', 'firmware'],
    city: 'Vancouver',
    province: 'BC',
    work_arrangement: 'hybrid',
    posted: '2026-10-08',
    seen: '2026-10-09T17:00:00Z',
    updated: '2026-10-13',
    salary: {
      minimum: 36,
      maximum: 48,
      currency: 'CAD',
      interval: 'hour',
      original_text: 'CAD $36–$48 per hour; final rate depends on experience.',
      qualification: 'Final rate depends on experience.',
    },
    duration: { months: 4, original_text: 'A four-month internship.' },
    term: {
      label: 'Summer 2027',
      start_date: null,
      original_text: 'Summer 2027.',
    },
    involves: [
      'Build systems tooling and improve performance on Linux platforms.',
      'Collaborate on debugging and validation of GPU software.',
    ],
    technologies: ['C++', 'Linux', 'Python'],
    required: [
      'Pursuing a degree in computer science or a related engineering field.',
      'Experience with C++ and systems programming.',
    ],
    preferred: ['Knowledge of GPU architecture or parallel computing.'],
  },
  {
    id: 'job-07-schneider',
    title: 'Electronics Hardware Design Co-op',
    company: companies.schneider,
    disciplines: ['electrical'],
    city: 'Victoria',
    province: 'BC',
    work_arrangement: 'on-site',
    posted: '2026-10-07',
    seen: '2026-10-08T16:00:00Z',
    salary: {
      minimum: 26,
      maximum: 32,
      currency: 'CAD',
      interval: 'hour',
      original_text: 'CAD $26–$32 per hour, based on completed academic terms.',
      qualification: 'Based on completed academic terms.',
    },
    duration: { months: 8, original_text: 'Eight-month co-op term.' },
    term: {
      label: 'Winter 2027',
      start_date: null,
      original_text: 'Winter 2027.',
    },
    involves: [
      'Assist with circuit design, PCB layout reviews, and hardware validation.',
      'Use lab equipment to characterize electronic assemblies.',
    ],
    technologies: ['Altium', 'PCB design', 'Lab testing'],
    required: [
      'Enrolled in electrical or electronics engineering.',
      'Familiarity with analog and digital circuit fundamentals.',
    ],
    preferred: ['Hands-on experience with oscilloscopes and PCB design tools.'],
  },
  {
    id: 'job-08-copperleaf',
    title: 'Software Developer Co-op',
    company: companies.copperleaf,
    disciplines: ['software'],
    city: 'Vancouver',
    province: 'BC',
    work_arrangement: 'hybrid',
    posted: '2026-10-06',
    seen: '2026-10-07T16:00:00Z',
    salary: null,
    duration: { months: 4, original_text: 'Four-month co-op placement.' },
    term: {
      label: 'Winter 2027',
      start_date: null,
      original_text: 'Winter 2027.',
    },
    involves: [
      'Develop web application features for decision-support software.',
      'Participate in code review and improve automated test coverage.',
    ],
    technologies: ['TypeScript', 'C#', 'SQL'],
    required: [
      'Enrolled in a software or engineering co-op program.',
      'Experience with object-oriented programming.',
    ],
    preferred: ['Experience with web development and relational databases.'],
  },
];

function makeJob(spec: FixtureSpec): Job {
  const sourceId = `${spec.id}-employer`;
  const snapshotId = `${spec.id}-snapshot`;
  const locationText = `${spec.city}, ${spec.province}, Canada`;
  const source = {
    ...base(sourceId),
    connector_instance_id: null,
    upstream_id: `SAMPLE-${spec.id}`,
    label: 'Employer sample',
    source_url: null,
    application_url: null,
    source_posted_at: spec.posted ? day(spec.posted) : null,
    source_updated_at: spec.updated ? day(spec.updated) : null,
    posting_date_trustworthy: spec.posted !== null,
  };
  const sections = [
    { heading: 'About the role', paragraphs: spec.involves, items: [] },
    {
      heading: 'Technologies & tools',
      paragraphs: [],
      items: spec.technologies,
    },
    {
      heading: 'Required qualifications',
      paragraphs: [],
      items: spec.required,
    },
    {
      heading: 'Preferred qualifications',
      paragraphs: [],
      items: spec.preferred,
    },
    {
      heading: 'Compensation & placement',
      paragraphs: [
        spec.salary?.original_text,
        spec.duration?.original_text,
        spec.term?.original_text,
        locationText,
        spec.work_arrangement === 'remote'
          ? 'Remote, open to applicants working in Canada.'
          : spec.work_arrangement === 'unknown'
            ? null
            : `Work arrangement: ${spec.work_arrangement}.`,
        spec.deadline ? `Application deadline: ${spec.deadline}.` : null,
        spec.conflict ? 'Employer sample: a four-month co-op placement.' : null,
      ].filter((value): value is string => Boolean(value)),
      items: [],
    },
  ];
  const originalText = sections
    .map((section) =>
      [
        section.heading,
        ...section.paragraphs,
        ...section.items.map((item) => `• ${item}`),
      ].join('\n'),
    )
    .join('\n\n');
  const evidenceValues = {
    involves: spec.involves.join(' '),
    technologies: spec.technologies.join('\n• '),
    required: spec.required.join('\n• '),
    preferred: spec.preferred.join('\n• '),
    salary: spec.salary?.original_text,
    duration: spec.duration?.original_text,
    term: spec.term?.original_text,
    location: locationText,
    deadline: spec.deadline ? `Application deadline: ${spec.deadline}.` : null,
  };
  // Each quote is an exact excerpt of its attached snapshot, not generated evidence.
  const evidence = Object.entries(evidenceValues)
    .filter(([, quote]) => Boolean(quote))
    .map(([field]) => {
      const sectionForField: Record<string, number> = {
        involves: 0,
        technologies: 1,
        required: 2,
        preferred: 3,
      };
      const section =
        sectionForField[field] !== undefined
          ? sections[sectionForField[field]]
          : null;
      const quote = section
        ? [
            ...section.paragraphs,
            ...section.items.map((item) => `• ${item}`),
          ].join('\n')
        : evidenceValues[field as keyof typeof evidenceValues];
      return {
        ...base(`${spec.id}-evidence-${field}`),
        field,
        snapshot_id: snapshotId,
        quote,
        method: 'fixture',
      };
    });
  return jobSchema.parse({
    ...base(spec.id),
    title: spec.title,
    requisition_id: `SAMPLE-${spec.id.slice(4, 6)}`,
    company: spec.company,
    disciplines: spec.disciplines,
    employment_type: spec.title.includes('Intern') ? 'internship' : 'co-op',
    status: 'unknown',
    locations: [
      {
        ...base(`${spec.id}-location`),
        original_text: locationText,
        city: spec.city,
        province: spec.province,
        country: 'CA',
        coordinates: null,
        precision: 'unknown',
      },
    ],
    work_arrangement: spec.work_arrangement,
    remote_open_to_canada: spec.work_arrangement === 'remote' ? true : null,
    source_posted_at: source.source_posted_at,
    source_updated_at: source.source_updated_at,
    posting_date_trustworthy: source.posting_date_trustworthy,
    first_seen_at: spec.seen,
    last_seen_at: '2026-10-13T16:00:00Z',
    content_changed_at: spec.updated ? '2026-10-13T16:00:00Z' : spec.seen,
    salary: spec.salary,
    duration: spec.duration,
    term: spec.term,
    deadline: spec.deadline ? day(spec.deadline) : null,
    involves: spec.involves,
    technologies: spec.technologies,
    required: spec.required,
    preferred: spec.preferred,
    sources: spec.conflict
      ? [
          source,
          {
            ...source,
            ...base(`${spec.id}-community`),
            label: 'Community sample',
            upstream_id: `community-${spec.id}`,
            source_posted_at: null,
            posting_date_trustworthy: false,
          },
        ]
      : [source],
    snapshots: [
      {
        ...base(snapshotId),
        job_source_id: sourceId,
        retrieved_at: spec.seen,
        content_hash: null,
        original_text: originalText,
        sections,
        kind: 'fixture',
      },
      ...(spec.conflict
        ? [
            {
              ...base(`${spec.id}-community-snapshot`),
              job_source_id: `${spec.id}-community`,
              retrieved_at: spec.seen,
              content_hash: null,
              original_text: 'Duration: eight months.',
              sections: [
                {
                  heading: 'Placement duration',
                  paragraphs: ['Duration: eight months.'],
                  items: [],
                },
              ],
              kind: 'fixture',
            },
          ]
        : []),
    ],
    evidence,
    conflicts: spec.conflict
      ? [
          {
            field: 'Duration',
            values: [
              { source_id: sourceId, original_value: 'Four months' },
              {
                source_id: `${spec.id}-community`,
                original_value: 'Eight months',
              },
            ],
          },
        ]
      : [],
  });
}

export const fixtureJobs = fixtures.map(makeJob);
export const fixtureUserStates = fixtureJobs.map((job) =>
  userJobStateSchema.parse({
    ...base(`state-${job.id}`),
    job_id: job.id,
    saved: ['job-02-amd', 'job-07-schneider'].includes(job.id),
    hidden: false,
    viewed_at: null,
    applied_at: job.id === 'job-08-copperleaf' ? '2026-10-10T17:00:00Z' : null,
  }),
);
export const fixtureVisit = visitStateSchema.parse({
  ...base('sample-visit'),
  previous_visit_at: '2026-10-12T18:00:00Z',
  current_visit_started_at: '2026-10-13T16:05:00Z',
  baseline_completed_at: '2026-10-07T12:00:00Z',
});

export function isNewJob(job: Job): boolean {
  return (
    job.first_seen_at > fixtureVisit.previous_visit_at &&
    job.first_seen_at > fixtureVisit.baseline_completed_at &&
    job.first_seen_at <= fixtureVisit.current_visit_started_at
  );
}
