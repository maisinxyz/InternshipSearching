import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, HelpCircle, Map, Newspaper } from 'lucide-react';
import { POSTS } from '@/lib/blog';

export const metadata: Metadata = { title: 'Resources' };

const LINKS = [
  { href: '/blog', icon: Newspaper, title: 'Blog', body: 'Strategy, resumes and timing.' },
  { href: '/faq', icon: HelpCircle, title: 'FAQ', body: 'How the board, alerts and tools work.' },
  { href: '/features', icon: BookOpen, title: 'Feature guide', body: 'Everything Intern External can do.' },
  { href: '/sources', icon: Map, title: 'Data sources', body: 'Which employers we watch, and how fresh they are.' },
];

export default function ResourcesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold tracking-tight">Resources</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="card flex gap-4 p-5 transition hover:border-brand">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand"><l.icon className="size-5" aria-hidden /></span>
            <span><span className="block font-display font-bold">{l.title}</span><span className="text-sm text-muted">{l.body}</span></span>
          </Link>
        ))}
      </div>
      <h2 className="mt-12 font-display text-xl font-bold">Guides</h2>
      <ul className="mt-4 divide-y divide-line rounded-2xl border border-line">
        {POSTS.map((p) => <li key={p.slug}><Link href={`/blog/${p.slug}`} className="block px-5 py-4 hover:bg-canvas"><span className="font-semibold">{p.title}</span><span className="block text-sm text-muted">{p.excerpt}</span></Link></li>)}
      </ul>
    </div>
  );
}
