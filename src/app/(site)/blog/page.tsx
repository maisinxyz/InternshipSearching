import type { Metadata } from 'next';
import Link from 'next/link';
import { POSTS } from '@/lib/blog';
import { formatDate } from '@/lib/format';

export const metadata: Metadata = { title: 'Blog' };

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-4xl font-extrabold tracking-tight">Blog</h1>
      <p className="mt-2 text-muted">Practical advice for landing internships and co-ops.</p>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {POSTS.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="card group flex flex-col p-6 transition hover:border-brand">
            <p className="text-xs text-muted">{formatDate(p.date)} · {p.minutes} min read</p>
            <h2 className="mt-2 font-display text-lg font-bold group-hover:text-brand">{p.title}</h2>
            <p className="mt-2 flex-1 text-sm text-muted">{p.excerpt}</p>
            <span className="mt-4 text-sm font-semibold text-brand">Read →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
