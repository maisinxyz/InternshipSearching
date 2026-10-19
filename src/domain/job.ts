import { z } from 'zod';
import { opportunitySchema } from './opportunity';

const id = z.string().min(1);
const instant = z.iso.datetime({ offset: true });
const recordFields = {
  id,
  owner_id: id,
  created_at: instant,
  updated_at: instant,
};

// An absent date is null. A date-only source never acquires an invented time.
export const sourceDateSchema = z.discriminatedUnion('precision', [
  z.object({ precision: z.literal('day'), value: z.iso.date() }),
  z.object({ precision: z.literal('instant'), value: instant }),
]);

export const disciplineSchema = z.enum([
  'software',
  'firmware',
  'electrical',
  'embedded',
  'electronics',
  'robotics',
  'controls',
  'hardware',
  'mechatronics',
  'mechanical',
  'qa-test',
  'manufacturing-automation',
  'data-ai',
  'it-cloud',
  'technical-product',
  'unknown',
]);
export const arrangementSchema = z.enum([
  'on-site',
  'hybrid',
  'remote',
  'unknown',
]);

export const companySchema = z.object({
  ...recordFields,
  name: z.string(),
  verified_domain: z.string().nullable(),
  careers_url: z.url().nullable(),
  logo: z
    .object({ path: z.string(), source_url: z.url(), license: z.string() })
    .nullable(),
});

export const jobLocationSchema = z.object({
  ...recordFields,
  original_text: z.string(),
  city: z.string().nullable(),
  province: z.string().nullable(),
  country: z.string().nullable(),
  coordinates: z
    .object({ latitude: z.number(), longitude: z.number() })
    .nullable(),
  precision: z.enum([
    'exact-address',
    'postal-code',
    'city-centroid',
    'unknown',
  ]),
});

export const jobSourceSchema = z.object({
  ...recordFields,
  connector_instance_id: id.nullable(),
  upstream_id: z.string(),
  label: z.string(),
  source_url: z.url().nullable(),
  application_url: z.url().nullable(),
  source_posted_at: sourceDateSchema.nullable(),
  source_updated_at: sourceDateSchema.nullable(),
  source_republished_at: sourceDateSchema.nullable().optional(),
  posting_date_trustworthy: z.boolean(),
});

export const descriptionSectionSchema = z.object({
  heading: z.string(),
  paragraphs: z.array(z.string()),
  items: z.array(z.string()),
});

export const jobSnapshotSchema = z.object({
  ...recordFields,
  job_source_id: id,
  retrieved_at: instant,
  content_hash: z.string().nullable(),
  original_text: z.string(),
  sections: z.array(descriptionSectionSchema),
  kind: z.enum(['fixture', 'source', 'import']),
});

export const fieldEvidenceSchema = z.object({
  ...recordFields,
  field: z.enum([
    'involves',
    'technologies',
    'required',
    'preferred',
    'salary',
    'duration',
    'term',
    'location',
    'deadline',
  ]),
  snapshot_id: id,
  quote: z.string(),
  method: z.enum(['fixture', 'deterministic', 'gemini', 'manual']),
});

const salarySchema = z.object({
  minimum: z.number().nonnegative(),
  maximum: z.number().nonnegative().nullable(),
  currency: z.string().length(3),
  interval: z.enum(['hour', 'month', 'year']),
  original_text: z.string(),
  qualification: z.string().nullable(),
});

export const jobSchema = z.object({
  ...recordFields,
  title: z.string().min(1),
  requisition_id: z.string(),
  company: companySchema,
  disciplines: z.array(disciplineSchema).min(1),
  employment_type: z.enum([
    'internship',
    'co-op',
    'student',
    'new-grad',
    'other',
  ]),
  status: z.enum(['open', 'closed', 'unknown']),
  locations: z.array(jobLocationSchema),
  work_arrangement: arrangementSchema,
  remote_open_to_canada: z.boolean().nullable(),
  source_posted_at: sourceDateSchema.nullable(),
  source_updated_at: sourceDateSchema.nullable(),
  source_republished_at: sourceDateSchema.nullable().optional(),
  opportunity: opportunitySchema.optional(),
  baseline: z.boolean().optional(),
  posting_date_trustworthy: z.boolean(),
  first_seen_at: instant,
  last_seen_at: instant,
  content_changed_at: instant,
  salary: salarySchema.nullable(),
  duration: z
    .object({ months: z.number().positive(), original_text: z.string() })
    .nullable(),
  term: z
    .object({
      label: z.string(),
      start_date: z.iso.date().nullable(),
      original_text: z.string(),
    })
    .nullable(),
  deadline: sourceDateSchema.nullable(),
  involves: z.array(z.string()),
  technologies: z.array(z.string()),
  required: z.array(z.string()),
  preferred: z.array(z.string()),
  sources: z.array(jobSourceSchema).min(1),
  snapshots: z.array(jobSnapshotSchema).min(1),
  evidence: z.array(fieldEvidenceSchema),
  conflicts: z.array(
    z.object({
      field: z.string(),
      values: z.array(z.object({ source_id: id, original_value: z.string() })),
    }),
  ),
});

export const userJobStateSchema = z.object({
  ...recordFields,
  job_id: id,
  saved: z.boolean(),
  hidden: z.boolean(),
  viewed_at: instant.nullable(),
  applied_at: instant.nullable(),
});
export const jobOverrideSchema = z.object({
  ...recordFields,
  job_id: id,
  field: z.string(),
  corrected_value: z.string(),
});
export const visitStateSchema = z.object({
  ...recordFields,
  previous_visit_at: instant,
  current_visit_started_at: instant,
  baseline_completed_at: instant,
});

export type Job = z.infer<typeof jobSchema>;
export type Company = z.infer<typeof companySchema>;
export type Discipline = z.infer<typeof disciplineSchema>;
export type Arrangement = z.infer<typeof arrangementSchema>;
export type SourceDate = z.infer<typeof sourceDateSchema>;
export type EvidenceField = z.infer<typeof fieldEvidenceSchema>['field'];
export type UserJobState = z.infer<typeof userJobStateSchema>;
