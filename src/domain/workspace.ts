import { z } from 'zod';
import { arrangementSchema, disciplineSchema, jobSchema } from './job';
const text = z.string().max(20000);
const short = z.string().max(300);
export const filtersSchema = z.object({
  countries: z.array(short).default([]), provinces: z.array(short).default([]), cities: z.array(short).default([]),
  disciplines: z.array(disciplineSchema).default([]), technologies: z.array(short).default([]),
  arrangements: z.array(arrangementSchema).default([]), canadaRemote: z.boolean().default(false),
  keywords: short.default(''), keywordMode: z.enum(['any','all','phrase']).default('all'), exclude: short.default(''),
  terms: z.array(short).default([]), companies: z.array(short).default([]), sources: z.array(short).default([]),
  types: z.array(z.enum(['internship','co-op','student','new-grad','other'])).default(['internship','co-op','student']),
  minimumPay: z.number().nonnegative().nullable().default(null), currency: z.string().length(3).default('CAD'), payInterval: z.enum(['hour','month','year']).default('hour'),
  minimumMonths: z.number().nonnegative().nullable().default(null), maximumMonths: z.number().nonnegative().nullable().default(null),
  includeUnknownPay: z.boolean().default(true), includeUnknownTerm: z.boolean().default(true), includeUnknownLocation: z.boolean().default(true),
  saved: z.boolean().default(false), applied: z.enum(['any','yes','no']).default('any'), hidden: z.enum(['exclude','include','only']).default('exclude'), newOnly: z.boolean().default(false),
  radius: z.object({latitude:z.number().min(-90).max(90),longitude:z.number().min(-180).max(180),km:z.number().positive().max(20000),approximate:z.boolean().default(false)}).nullable().default(null),
});
export type Filters = z.infer<typeof filtersSchema>;
export const savedSearchSchema = z.object({name:short.min(1), filters:filtersSchema, isDefault:z.boolean().default(false), version:z.literal(1).default(1)});
export const connectorSchema = z.object({
  type:z.enum(['github','greenhouse','lever','myexperience','intern-insider','workday','linkedin','manual']), name:short.min(1),
  state:z.enum(['connected','import-only','paused','needs-sign-in','unavailable']).default('paused'),
  config:z.object({repository:short.optional(),path:short.optional(),ref:short.optional(),board:short.optional(),region:z.enum(['global','eu']).optional(),reuseConfirmed:z.boolean().default(false)}),
  expiresAt:z.iso.date().nullable().default(null), lastSync:z.iso.datetime().nullable().default(null), etag:short.nullable().default(null), cursor:z.number().int().nonnegative().default(0), error:short.nullable().default(null), adapterVersion:z.literal('1').default('1'),
});
export const factSchema = z.object({text:text.min(1),tags:z.array(short).default([]),source:short.min(1),approved:z.boolean().default(false),version:z.number().int().positive().default(1)});
export const templateSchema = z.object({name:short.min(1),tex:z.string().min(20).max(250000),version:z.number().int().positive().default(1)});
export const rulesSchema = z.object({text:text.min(1),version:z.number().int().positive().default(1)});
export const draftSchema = z.object({jobId:short,jobSnapshot:jobSchema,templateId:short,factIds:z.array(short),rulesId:short,tex:z.string().max(250000),origin:z.enum(['gemini','external','edit','restore']),parentId:short.nullable(),summary:text,checks:z.array(short),pageCount:z.number().int().positive().nullable().default(null),visualReviewed:z.boolean().default(false)});
export const applicationSchema = z.object({jobId:short,jobSnapshot:jobSchema,status:z.enum(['Saved','Preparing','Applied','Interview','Offer','Rejected','Withdrawn']),appliedAt:z.iso.date().nullable(),resumeId:short.nullable(),documentIds:z.array(short).default([]),notes:text.default(''),contact:short.default(''),followUpDate:z.iso.date().nullable().default(null),interviewDate:z.iso.date().nullable().default(null),checklist:z.array(z.object({label:short,done:z.boolean()})).default([])});
export const materialSchema = z.object({applicationId:short,kind:z.enum(['cover-letter','answer','follow-up']),question:text.default(''),text,limit:z.number().int().positive().nullable().default(null),limitType:z.enum(['characters','words']).default('characters'),factIds:z.array(short).default([]),missingFacts:z.array(short).default([]),parentId:short.nullable().default(null)});
export const followupSchema = z.object({applicationId:short,date:z.iso.date(),contact:short.default(''),draft:text.default(''),status:z.enum(['pending','complete','dismissed']).default('pending')});
export const profileSchema = z.object({name:short.default(''),education:text.default(''),availability:short.default(''),authorization:short.default(''),eligibility:short.default(''),origin:z.object({latitude:z.number().min(-90).max(90),longitude:z.number().min(-180).max(180),label:short}).nullable().default(null),answerBank:z.array(z.object({question:short,answer:text})).default([])});
export const schemas = {job:jobSchema,search:savedSearchSchema,connector:connectorSchema,fact:factSchema,template:templateSchema,rules:rulesSchema,draft:draftSchema,application:applicationSchema,material:materialSchema,followup:followupSchema,profile:profileSchema,
  state:z.object({job_id:short,saved:z.boolean(),hidden:z.boolean(),viewed_at:z.iso.datetime().nullable(),applied_at:z.iso.datetime().nullable()}),
  visit:z.object({previous:z.iso.datetime().nullable(),started:z.iso.datetime(),baseline:z.iso.datetime()}),
  sync:z.object({connectorId:short,status:z.enum(['running','complete','failed','cancelled']),processed:z.number(),cursor:z.number(),error:short.nullable()}),
  override:z.object({jobId:short,field:z.enum(['title','involves','technologies','required','preferred']),value:text}),
} as const;
export type Kind = keyof typeof schemas;
export type RecordRow<K extends Kind = Kind> = {id:string;owner_id:string;kind:K;created_at:string;updated_at:string;revision:number;data:z.infer<(typeof schemas)[K]>};
export type WorkspaceData = { [K in Kind]: RecordRow<K>[] };
export const defaultRules = 'Preserve the master layout, preamble, commands, contact block, links and 10 pt baseline. Use only approved facts. Preserve names, numbers, dates and metrics exactly. Prefer concise action-led bullets. Never add unsupported technologies or expertise. Shorten content before changing spacing. Exactly one page after compilation; page count remains unverified until compiled. No whole-sentence bolding.';
