import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import type { JobDetail } from './jobs';
import type { Profile } from './models';

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-5-5';

const SYSTEM = `You write internship application documents for students.
Use only facts present in the candidate profile. Never invent employers, dates, grades, metrics, skills or links.
If the job asks for something the profile lacks, do not claim it; you may emphasize related experience instead.
Output plain Markdown only, with no preamble or closing remarks.`;

const RESUME = `Write a one-page, ATS-friendly resume in Markdown tailored to the job (if given).
Format: "# Full Name", one line of contact details separated by " | ", then "## Section" headings
(Education, Experience, Projects, Skills, plus Activities/Volunteer only if present).
Entries: "**Title**, Organization | Location | Dates" followed by "- " bullets with strong action verbs.
Reorder and lightly rephrase bullets to match the job's keywords where truthful.`;

const COVER = `Write a concise cover letter (250 to 350 words) in Markdown for the job below.
Start with "Dear Hiring Team," and end with "Sincerely," and the candidate's name. Three or four short paragraphs,
specific to the company and role, grounded in the candidate's real experience.`;

export async function generate(kind: 'resume' | 'cover', profile: Profile, job: JobDetail | null): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('AI builders need ANTHROPIC_API_KEY in .env.local.');
  const client = new Anthropic();
  const jobText = job ? `JOB\nCompany: ${job.company_name}\nTitle: ${job.title}\n\n${job.description.slice(0, 12000)}` : 'JOB\n(none, so write a general-purpose resume)';
  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 8000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'medium' },
    system: SYSTEM,
    messages: [{ role: 'user', content: `${kind === 'resume' ? RESUME : COVER}\n\nCANDIDATE PROFILE (JSON)\n${JSON.stringify(profile)}\n\n${jobText}` }],
  });
  if (response.stop_reason === 'refusal') throw new Error('The model declined this request. Try editing your profile or picking another job.');
  const text = response.content.flatMap((b) => (b.type === 'text' ? [b.text] : [])).join('').trim();
  if (!text) throw new Error('The model returned an empty document. Please try again.');
  return text;
}
