import { z } from 'zod';

export const automaticTypes = [
  'greenhouse',
  'lever',
  'ashby',
  'github',
] as const;
export const isAutomatic = (type: string) =>
  automaticTypes.some((t) => t === type);
export const listingSchema = z.object({
  identity: z.string().min(1),
  title: z.string().min(1),
  company: z.string(),
  url: z.url().nullable(),
  sourceUrl: z.url().nullable(),
  text: z.string(),
  locations: z.array(z.string()),
  posted: z.string().nullable(),
  updated: z.string().nullable(),
  republished: z.string().nullable().optional(),
  closed: z.boolean().optional(),
  arrangement: z.enum(['remote', 'hybrid', 'on-site', 'unknown']).optional(),
  remoteCanada: z.boolean().nullable().optional(),
  attribution: z.string().optional(),
  employmentType: z
    .enum(['internship', 'co-op', 'student', 'new-grad', 'other'])
    .optional(),
});
export type Listing = z.infer<typeof listingSchema>;

export function sourceHealth(
  source: {
    state: string;
    lastSync: string | null;
    error: string | null;
    intervalMinutes?: number;
  },
  now = Date.now(),
) {
  if (source.state !== 'connected') return 'Paused';
  if (source.error) return 'Check failed';
  if (!source.lastSync) return 'Awaiting first check';
  return now - Date.parse(source.lastSync) >
    (source.intervalMinutes ?? 15) * 120000
    ? 'Checks overdue'
    : 'Recently checked';
}
