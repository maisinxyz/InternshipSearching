// Pure helpers that turn raw posting text into filterable attributes.
// Unknown values stay null so the UI can say "Not specified" instead of guessing.

export type WorkMode = 'remote' | 'hybrid' | 'onsite';
export type Place = { city: string | null; region: string | null; country: string | null; remote: boolean };

const CA_REGIONS: Record<string, string> = {
  ON: 'Ontario', BC: 'British Columbia', QC: 'Quebec', AB: 'Alberta', MB: 'Manitoba', SK: 'Saskatchewan',
  NS: 'Nova Scotia', NB: 'New Brunswick', NL: 'Newfoundland and Labrador', PE: 'Prince Edward Island',
};
const US_STATES = new Set(
  'AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY DC'.split(' '),
);
const CA_CITIES = ['Toronto', 'Vancouver', 'Montreal', 'Montréal', 'Ottawa', 'Calgary', 'Edmonton', 'Waterloo', 'Kitchener', 'Burnaby', 'Mississauga', 'Markham', 'Halifax', 'Winnipeg', 'Quebec City', 'Victoria', 'Richmond', 'Surrey', 'Kanata', 'Saskatoon', 'Regina', "St. John's", 'Fredericton', 'London', 'Hamilton', 'Guelph'];
const US_CITIES: Record<string, string> = {
  'San Francisco': 'Bay Area', 'Palo Alto': 'Bay Area', 'Mountain View': 'Bay Area', 'Menlo Park': 'Bay Area', 'San Jose': 'Bay Area',
  'Sunnyvale': 'Bay Area', 'Santa Clara': 'Bay Area', 'Redwood City': 'Bay Area', 'Oakland': 'Bay Area', 'San Mateo': 'Bay Area',
  'Cupertino': 'Bay Area', 'South San Francisco': 'Bay Area', 'Foster City': 'Bay Area', 'Bay Area': 'Bay Area',
  'New York': 'New York', 'NYC': 'New York', 'Brooklyn': 'New York', 'Seattle': 'Seattle', 'Bellevue': 'Seattle', 'Redmond': 'Seattle',
  'Boston': 'Boston', 'Cambridge': 'Boston', 'Chicago': 'Chicago', 'Austin': 'Austin', 'Dallas': 'Dallas', 'Houston': 'Houston',
  'Los Angeles': 'Los Angeles', 'Santa Monica': 'Los Angeles', 'San Diego': 'San Diego', 'Denver': 'Denver', 'Boulder': 'Denver',
  'Atlanta': 'Atlanta', 'Washington': 'Washington DC', 'Arlington': 'Washington DC', 'Philadelphia': 'Philadelphia', 'Pittsburgh': 'Pittsburgh',
  'Phoenix': 'Phoenix', 'Charlotte': 'Charlotte', 'Miami': 'Miami', 'Salt Lake City': 'Salt Lake City', 'Portland': 'Portland', 'Detroit': 'Detroit',
  'Minneapolis': 'Minneapolis', 'Raleigh': 'Raleigh', 'Durham': 'Raleigh', 'Cincinnati': 'Cincinnati', 'Columbus': 'Columbus', 'Hawthorne': 'Los Angeles',
};

export function parsePlace(raw: string): Place {
  const text = raw.trim();
  const remote = /\bremote\b|\banywhere\b/i.test(text);
  const ca = CA_CITIES.find((c) => new RegExp(`\\b${c.replace('.', '\\.')}\\b`, 'i').test(text));
  const caRegion = Object.keys(CA_REGIONS).find((r) => new RegExp(`(,|\\s)${r}\\b`).test(text)) ?? Object.entries(CA_REGIONS).find(([, n]) => text.includes(n))?.[0];
  const isCanada = /\bcanada\b|\bCAN\b/i.test(text) || Boolean(caRegion) || (Boolean(ca) && !/\b(UK|United Kingdom|England|Ontario, CA|, KY|, OH)\b/.test(text) && ca !== 'London' && ca !== 'Richmond' && ca !== 'Cambridge');
  if (isCanada) {
    const city = ca === 'Montréal' ? 'Montreal' : (ca ?? null);
    return { city, region: caRegion ? CA_REGIONS[caRegion] : null, country: 'Canada', remote };
  }
  const usCity = Object.keys(US_CITIES).find((c) => new RegExp(`\\b${c}\\b`, 'i').test(text));
  const state = text.match(/,\s*([A-Z]{2})\b/)?.[1];
  const isUs = /\b(united states|USA|U\.S\.|\bUS\b)/i.test(text) || (state ? US_STATES.has(state) : false) || Boolean(usCity);
  if (isUs) return { city: usCity ? US_CITIES[usCity] : null, region: state && US_STATES.has(state) ? state : null, country: 'United States', remote };
  const intl = Object.entries(INTL_CITIES).find(([c]) => new RegExp(`\\b${c}\\b`, 'i').test(text));
  if (intl) return { city: intl[0], region: null, country: intl[1], remote };
  const code = text.match(/(?:^|[\s,-])([A-Z]{2})(?:$|[\s,-])/)?.[1];
  const country = Object.values(COUNTRY_CODES).find((c) => new RegExp(`\\b${c}\\b`, 'i').test(text)) ?? (code ? COUNTRY_CODES[code] : undefined);
  if (country) return { city: null, region: null, country, remote };
  return { city: null, region: null, country: null, remote };
}

const COUNTRY_CODES: Record<string, string> = {
  GB: 'United Kingdom', UK: 'United Kingdom', DE: 'Germany', FR: 'France', NL: 'Netherlands', IE: 'Ireland', CH: 'Switzerland',
  PL: 'Poland', ES: 'Spain', IT: 'Italy', SE: 'Sweden', IN: 'India', SG: 'Singapore', AU: 'Australia', JP: 'Japan',
  HK: 'Hong Kong', CN: 'China', RS: 'Serbia', RO: 'Romania', IL: 'Israel', BR: 'Brazil', MX: 'Mexico', KR: 'South Korea',
};
const INTL_CITIES: Record<string, string> = {
  London: 'United Kingdom', Cambridge: 'United Kingdom', Edinburgh: 'United Kingdom', Berlin: 'Germany', Munich: 'Germany',
  Paris: 'France', Amsterdam: 'Netherlands', Dublin: 'Ireland', Zurich: 'Switzerland', Warsaw: 'Poland', Madrid: 'Spain',
  Milan: 'Italy', Stockholm: 'Sweden', Bengaluru: 'India', Bangalore: 'India', Hyderabad: 'India', Singapore: 'Singapore',
  Sydney: 'Australia', Tokyo: 'Japan', 'Hong Kong': 'Hong Kong', Shanghai: 'China', Belgrade: 'Serbia', Bucharest: 'Romania',
  'Tel Aviv': 'Israel', 'São Paulo': 'Brazil', Seoul: 'South Korea', 'Mexico City': 'Mexico',
};

export function workModeOf(text: string, places: Place[], hint?: string | null): WorkMode | null {
  const h = (hint ?? '').toLowerCase();
  if (h.includes('remote')) return 'remote';
  if (h.includes('hybrid')) return 'hybrid';
  if (h.includes('on-site') || h.includes('onsite') || h.includes('in office')) return 'onsite';
  if (/\bhybrid\b/i.test(text)) return 'hybrid';
  if (places.length && places.every((p) => p.remote)) return 'remote';
  if (/\b(fully remote|100% remote|remote-first)\b/i.test(text)) return 'remote';
  if (/\b(on-?site|in[- ]office|in[- ]person)\b/i.test(text)) return 'onsite';
  return null;
}

export function isInternship(title: string, employmentType?: string | null): boolean {
  if (/\b(senior|staff|principal|director|manager|lead)\b/i.test(title) && !/\bintern/i.test(title)) return false;
  return /\bintern(ship)?s?\b|\bco-?op\b|\bstudent\b|\bplacement\b|\bapprentice/i.test(title) || /intern/i.test(employmentType ?? '');
}

export function employmentTypeOf(title: string, text: string): string | null {
  if (/\bco-?op\b/i.test(title)) return 'Co-op';
  if (/\bpart[- ]time\b/i.test(title + ' ' + text.slice(0, 1500))) return 'Part-time';
  if (/\bintern/i.test(title)) return 'Internship';
  return null;
}

const SEASONS = ['Winter', 'Spring', 'Summer', 'Fall', 'Autumn'] as const;
export function termOf(title: string, text: string): string | null {
  for (const source of [title, text.slice(0, 4000)]) {
    const m = source.match(/\b(Winter|Spring|Summer|Fall|Autumn)\s*(?:\/\s*(?:Winter|Spring|Summer|Fall|Autumn)\s*)?(?:term\s*)?['’]?\s*(20\d{2}|\d{2})\b/i);
    if (m) {
      const season = SEASONS.find((s) => s.toLowerCase() === m[1].toLowerCase())!;
      const year = m[2].length === 2 ? `20${m[2]}` : m[2];
      return `${season === 'Autumn' ? 'Fall' : season} ${year}`;
    }
  }
  return null;
}

export function payOf(text: string): { pay: 'paid' | 'unpaid' | null; payText: string | null } {
  const range = text.match(/(?:CA|US)?\$\s?\d[\d,.]*(?:\s?[kK])?(?:\s?(?:-|–|—|to)\s?(?:CA|US)?\$?\s?\d[\d,.]*(?:\s?[kK])?)?(?:\s?(?:CAD|USD))?(?:\s?(?:\/|per)\s?(?:hour|hr|year|yr|month|week))?/);
  if (range) return { pay: 'paid', payText: range[0].trim() };
  if (/\bunpaid\b/i.test(text)) return { pay: 'unpaid', payText: null };
  if (/\bpaid internship\b|\bcompetitive (?:pay|salary|compensation)\b|\bhourly (?:rate|wage)\b/i.test(text)) return { pay: 'paid', payText: null };
  return { pay: null, payText: null };
}

export function deadlineOf(text: string): string | null {
  const m = text.match(/(?:deadline|apply by|applications? (?:close|due))[^.\n]{0,20}?((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2}(?:st|nd|rd|th)?,?\s+20\d{2})/i);
  if (!m) return null;
  const d = new Date(m[1].replace(/(st|nd|rd|th)/, ''));
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

export const MAJORS: Record<string, RegExp> = {
  'Computer Science': /\bcomputer science\b|\bsoftware\b|\bbackend\b|\bfrontend\b|\bfull[- ]stack\b|\bdeveloper\b/i,
  'Software Engineering': /\bsoftware engineer/i,
  'Computer Engineering': /\bcomputer engineering\b|\bfirmware\b|\bembedded\b|\bASIC\b|\bFPGA\b/i,
  'Electrical Engineering': /\belectrical\b|\belectronics?\b|\bhardware\b|\bcircuit\b|\bpower systems\b/i,
  'Mechanical Engineering': /\bmechanical\b|\bmechatronics\b|\bCAD\b|\bthermal\b/i,
  'Data Science': /\bdata scien|\bmachine learning\b|\b(AI|ML)\b|\banalytics\b|\bdata analyst\b|\bdata engineer/i,
  'Mathematics & Statistics': /\bmathematic|\bstatistic|\bquantitative\b|\bquant\b/i,
  'Business': /\bbusiness\b|\bstrategy\b|\boperations\b|\bconsult/i,
  'Finance & Accounting': /\bfinance\b|\bfinancial\b|\baccounting\b|\binvestment\b|\btrading\b/i,
  'Marketing & Communications': /\bmarketing\b|\bcommunications\b|\bbrand\b|\bsocial media\b|\bcontent\b/i,
  'Design': /\bdesign(er)?\b|\bUX\b|\bUI\b|\buser research\b/i,
  'Product Management': /\bproduct manag/i,
  'Physics & Sciences': /\bphysics\b|\bchemistry\b|\bbiology\b|\bresearch scientist\b/i,
};

export function majorsOf(title: string, text: string): string[] {
  const head = `${title}\n${title}\n${text.slice(0, 3000)}`;
  const fromTitle = Object.entries(MAJORS).filter(([, re]) => re.test(title)).map(([m]) => m);
  if (fromTitle.length) return fromTitle;
  return Object.entries(MAJORS).filter(([, re]) => re.test(head)).map(([m]) => m).slice(0, 3);
}

const SKILLS = ['Python', 'Java', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Go', 'Rust', 'C++', 'C#', 'SQL', 'AWS', 'GCP', 'Azure', 'Kubernetes', 'Docker', 'Linux', 'PyTorch', 'TensorFlow', 'Swift', 'Kotlin', 'iOS', 'Android', 'Figma', 'Excel', 'Tableau', 'MATLAB', 'Verilog', 'SolidWorks', 'Spark', 'GraphQL', 'Ruby', 'Scala', 'Machine Learning', 'LLMs'];
export function skillsOf(text: string): string[] {
  return SKILLS.filter((s) => new RegExp(`(^|[^A-Za-z+#])${s.replace(/[+.#]/g, '\\$&')}([^A-Za-z+#]|$)`, s.length <= 3 ? '' : 'i').test(text)).slice(0, 6);
}

export function qualificationsOf(text: string): string[] {
  const lines = text.split('\n');
  const start = lines.findIndex((l) => /^(qualifications|requirements|what you('|’)ll (need|bring)|who you are|you (have|bring|may be a fit)|minimum qualifications|about you|what we('|’)re looking for)/i.test(l.trim().replace(/[:#*]/g, '')));
  const pool = start >= 0 ? lines.slice(start + 1, start + 25) : lines;
  return pool.map((l) => l.trim()).filter((l) => /^[-•*·]/.test(l) || (start >= 0 && l.length > 15 && l.length < 300 && !/:$/.test(l)))
    .map((l) => l.replace(/^[-•*·]\s*/, '')).filter((l) => l.length > 3).slice(0, 8);
}

export function summaryOf(text: string): string {
  const para = text.split(/\n+/).map((s) => s.trim()).find((s) => s.length > 80 && !/^(about|who we are|our company)/i.test(s)) ?? text.trim();
  return para.length > 260 ? `${para.slice(0, 257).trimEnd()}…` : para;
}

export function slugify(s: string): string {
  return s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-');
}
