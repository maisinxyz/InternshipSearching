export type Post = { slug: string; title: string; date: string; minutes: number; excerpt: string; body: string[] };

export const POSTS: Post[] = [
  {
    slug: 'apply-in-the-first-72-hours', title: 'Why the first 72 hours after a posting matter most', date: '2026-10-28', minutes: 4,
    excerpt: 'Most recruiters screen in batches. Getting into the first batch is the cheapest edge you can get.',
    body: [
      'Recruiters rarely wait for a posting to close before they start reviewing. Many screen the first batch of applicants within days, and strong early candidates can fill the interview slots before late applicants are read.',
      'That’s why Intern External reads career pages directly. Turn on instant alerts for a saved search and you’ll hear about matching roles soon after they’re published.',
      'A practical routine: keep a tailored base resume ready, check alerts once or twice a day, and apply to strong matches the same day. Use the tracker so you don’t lose track of follow-ups.',
    ],
  },
  {
    slug: 'ats-friendly-resume-checklist', title: 'An ATS-friendly resume checklist for internship applications', date: '2026-10-14', minutes: 5,
    excerpt: 'Simple formatting, honest keywords and quantified bullets. Here’s what actually matters.',
    body: [
      'Use a single-column layout with standard section names: Education, Experience, Projects, Skills. Avoid tables, text boxes and images, which parsers can scramble.',
      'Mirror the posting’s language where it’s true. If the job says “REST APIs” and you built one, say “REST APIs”, not just “backend work”. Never add skills you don’t have.',
      'Lead each bullet with an action verb and include a result: what changed, by how much, for whom. One page is plenty for most students.',
      'The Resume Builder applies these rules automatically, using only the facts in your profile.',
    ],
  },
  {
    slug: 'co-op-vs-internship', title: 'Co-op vs. internship: what’s the difference?', date: '2026-09-30', minutes: 3,
    excerpt: 'They’re often used interchangeably, but terms, timing and credit can differ.',
    body: [
      'Co-ops are usually tied to a school program, often run four to eight months, and may count toward your degree. Internships are more often summer-length and arranged directly with the employer.',
      'Many employers post both under similar titles. Use the “More → Employment type” filter to narrow the board, and check the Term filter for the season you need.',
      'Whatever you call it, the advice is the same: apply early, tailor your resume, and track every application.',
    ],
  },
];
