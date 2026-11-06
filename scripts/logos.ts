// Vendors CC0 Simple Icons for seeded companies into public/logos (run once after adding sources).
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { SOURCE_SEEDS } from '../src/lib/sources.ts';
import { slugify } from '../src/lib/taxonomy.ts';

const data = JSON.parse(readFileSync('node_modules/simple-icons/data/simple-icons.json', 'utf8'));
const icons: { title: string; slug?: string; hex: string }[] = Array.isArray(data) ? data : data.icons;
const key = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
let n = 0;
for (const s of SOURCE_SEEDS) {
  const icon = icons.find((i) => key(i.title) === key(s.name));
  if (!icon) continue;
  const slug = icon.slug ?? key(icon.title);
  const file = `node_modules/simple-icons/icons/${slug}.svg`;
  if (!existsSync(file)) continue;
  writeFileSync(`public/logos/${slugify(s.name)}.svg`, readFileSync(file, 'utf8').replace('<svg ', `<svg fill="#${icon.hex}" `));
  n++;
}
console.log(`wrote ${n} logos`);
