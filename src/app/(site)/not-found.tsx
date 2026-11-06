import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-display text-6xl font-extrabold text-brand">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold">We couldn’t find that page</h1>
      <p className="mt-2 text-muted">The posting may have been removed, or the link is wrong.</p>
      <Link href="/internships" className="btn-primary mt-6">Browse internships</Link>
    </div>
  );
}
