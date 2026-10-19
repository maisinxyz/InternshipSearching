import { z } from 'zod';
import type { Job } from './job';

export const supportSchema = z.object({
  status: z.enum([
    'supported',
    'unsupported',
    'conditional',
    'not-stated',
    'conflicting',
  ]),
  quotes: z.array(z.string()),
});
export const opportunitySchema = z.object({
  sponsorship: supportSchema,
  relocation: supportSchema,
  housing: supportSchema,
  remoteBC: supportSchema,
});
export const metroCities = [
  'Vancouver',
  'Burnaby',
  'Surrey',
  'Richmond',
  'New Westminster',
  'Coquitlam',
  'Port Coquitlam',
  'Port Moody',
  'North Vancouver',
  'West Vancouver',
  'Delta',
  'Langley',
  'Maple Ridge',
  'Pitt Meadows',
  'White Rock',
];
export const isMetro = (job: Job) =>
  job.locations.some(
    (l) =>
      l.country === 'Canada' &&
      l.province === 'BC' &&
      metroCities.some((city) => city.toLowerCase() === l.city?.toLowerCase()),
  );

// Preserve the sentence, and require an explicit offer/denial rather than a sponsorship question.
function support(text: string, topic: RegExp): z.infer<typeof supportSchema> {
  const quotes = text
    .split(/\n+|(?<=[.!?])\s+|;\s*|,?\s+but\s+/i)
    .map((s) => s.trim())
    .filter((s) => topic.test(s) && !s.includes('?'));
  const negative = quotes.filter((s) =>
    /\b(no|not|cannot|unable|without|unavailable)\b.{0,55}\b(sponsor|sponsorship|relocation|housing)|\b(sponsorship|relocation|housing)\b.{0,45}\b(not available|not provided|not offered|not supported|unavailable)\b/i.test(
      s,
    ),
  );
  const positive = quotes.filter(
    (s) =>
      !negative.includes(s) &&
      /\b(provide|provided|provides|offer|offers|offered|available|eligible for|assist|assistance|support|supported|cover|covered|stipend)\b/i.test(
        s,
      ),
  );
  const evidence = [...negative, ...positive];
  return {
    status:
      negative.length && positive.length
        ? 'conflicting'
        : negative.length
          ? 'unsupported'
          : positive.length
            ? positive.some((s) =>
                /\b(may|eligible|eligibility|depending|case.by.case|subject to|discretionary|conditional|optional)\b/i.test(
                  s,
                ),
              )
              ? 'conditional'
              : 'supported'
            : 'not-stated',
    quotes: evidence,
  };
}
export function extractOpportunity(
  text: string,
  locations: string[],
  arrangement: Job['work_arrangement'],
): z.infer<typeof opportunitySchema> {
  const remoteText = locations.join('\n') + '\n' + text;
  const remoteQuotes = remoteText
    .split(/\n+|(?<=[.!?])\s+/)
    .filter(
      (s) =>
        /remote|work from|resid|based in/i.test(s) &&
        /Canada|Canadian|British Columbia|\bBC\b|United States|US.only/i.test(
          s,
        ),
    );
  const canada = remoteQuotes.filter((s) =>
    /Canada|Canadian|British Columbia|\bBC\b/i.test(s),
  );
  const restriction =
    /\b(?:only|must|restricted|excluding|except)\b.{0,65}(?:Ontario|Quebec|Québec|Alberta|United States|\bUSA\b)|(?:Ontario|Quebec|Québec|Alberta|United States|\bUSA\b).{0,25}\bonly\b/i.test(
      remoteText,
    );
  const narrowRegion =
    /(?:remote (?:within|in|from)|(?:must (?:be |reside |live )?|based |located |resid(?:e|ing) )in)\s+(?:(?:the|either)\s+)?(?:Ontario|Quebec|Québec|Alberta|Toronto|Montreal|Montréal|Ottawa|United States|USA)\b|(?:excluding|except)\s+(?:British Columbia|BC)\b/i.test(
      remoteText,
    );
  return {
    sponsorship: support(text, /visa|sponsor|immigration/i),
    relocation: support(text, /relocat|moving (?:cost|expense|assistance)/i),
    housing: support(text, /housing|accommodation stipend/i),
    remoteBC: {
      status:
        arrangement === 'remote' &&
        canada.length &&
        !restriction &&
        !narrowRegion
          ? 'supported'
          : 'not-stated',
      quotes: remoteQuotes,
    },
  };
}
export function opportunityView(job: Job, view: string) {
  if (view === 'all') return true;
  if (view === 'vancouver') return isMetro(job);
  if (view === 'remote')
    return (
      job.work_arrangement === 'remote' &&
      job.opportunity?.remoteBC.status === 'supported'
    );
  const elsewhere =
    !isMetro(job) &&
    job.work_arrangement !== 'remote' &&
    job.locations.some((l) =>
      ['Canada', 'United States'].includes(l.country || ''),
    );
  if (!elsewhere) return false;
  const supported = [
    job.opportunity?.sponsorship,
    job.opportunity?.relocation,
    job.opportunity?.housing,
  ].some((s) => s && ['supported', 'conditional'].includes(s.status));
  return view === 'relocation' ? supported : !supported;
}
export const relocationBudgetSchema = z.object({
  currency: z.enum(['CAD', 'USD']),
  months: z.number().positive().max(24),
  monthlyTakeHome: z.number().nonnegative(),
  monthlyRent: z.number().nonnegative(),
  monthlyOther: z.number().nonnegative(),
  movingCosts: z.number().nonnegative(),
  confirmedSupport: z.number().nonnegative(),
  localTermSavings: z.number(),
});
export function relocationBudget(
  input: z.infer<typeof relocationBudgetSchema>,
) {
  const b = relocationBudgetSchema.parse(input);
  const remaining =
    (b.monthlyTakeHome - b.monthlyRent - b.monthlyOther) * b.months -
    b.movingCosts +
    b.confirmedSupport;
  return { remaining, versusLocal: remaining - b.localTermSavings };
}
