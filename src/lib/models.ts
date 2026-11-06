import { z } from 'zod';

export const STAGES = ['saved', 'applied', 'interview', 'offer', 'rejected'] as const;
export type Stage = (typeof STAGES)[number];
export const STAGE_LABELS: Record<Stage, string> = { saved: 'Saved', applied: 'Applied', interview: 'Interview', offer: 'Offer', rejected: 'Rejected' };

const text = (max = 200) => z.string().trim().max(max).default('');
const entry = z.object({
  title: text(), org: text(), location: text(), start: text(40), end: text(40), bullets: z.array(z.string().trim().max(400)).max(12).default([]),
});
export type ProfileEntry = z.infer<typeof entry>;

export const PROFILE_SECTIONS = [
  { key: 'experience', label: 'Experience', title: 'Role', org: 'Company' },
  { key: 'education', label: 'Education', title: 'Degree / program', org: 'School' },
  { key: 'projects', label: 'Projects', title: 'Project name', org: 'Tech / context' },
  { key: 'activities', label: 'Activities', title: 'Position', org: 'Club / organization' },
  { key: 'volunteer', label: 'Volunteer', title: 'Role', org: 'Organization' },
] as const;

export const profileSchema = z.object({
  fullName: text(120), email: text(200), phone: text(40), location: text(120), links: text(400), headline: text(300),
  skills: text(1000),
  experience: z.array(entry).max(20).default([]), education: z.array(entry).max(10).default([]), projects: z.array(entry).max(20).default([]),
  activities: z.array(entry).max(20).default([]), volunteer: z.array(entry).max(20).default([]),
});
export type Profile = z.infer<typeof profileSchema>;
export const emptyProfile = (): Profile => profileSchema.parse({});
