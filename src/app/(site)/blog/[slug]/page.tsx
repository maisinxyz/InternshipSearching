import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { POSTS } from '@/lib/blog';
import { formatDate } from '@/lib/format';

export function generateStaticParams() { return POSTS.map((p) => ({ slug: p.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: POSTS.find((p) => p.slug === slug)?.title ?? 'Blog' };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) notFound();
  return (
    <article className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <Link href="/blog" className="text-sm font-semibold text-brand">← Blog</Link>
      <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight tracking-tight">{post.title}</h1>
      <p className="mt-3 text-sm text-muted">{formatDate(post.date)} · {post.minutes} min read</p>
      <div className="mt-8 space-y-5 text-lg leading-relaxed text-ink/85">{post.body.map((b, i) => <p key={i}>{b}</p>)}</div>
      <div className="card mt-12 p-6 text-center">
        <p className="font-display text-xl font-bold">Ready to find your internship?</p>
        <Link href="/internships" className="btn-primary mt-4">Browse internships</Link>
      </div>
    </article>
  );
}
