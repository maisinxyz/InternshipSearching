import Link from 'next/link';

export function Wordmark({ href = '/' }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-ink" aria-label="Intern External home">
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden>
        <rect width="32" height="32" rx="9" fill="#3b4cf5" />
        <path d="M10 22V10h7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M15 17l8-8m0 0h-5.5M23 9v5.5" stroke="#ffd84d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <span>Intern <span className="text-brand">External</span></span>
    </Link>
  );
}
