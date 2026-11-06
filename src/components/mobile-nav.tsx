'use client';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const APP = [
  ['Jobs', [['/internships', 'Internships'], ['/saved', 'Saved Jobs'], ['/tracker', 'Job Tracker'], ['/searches', 'Saved Searches & Alerts']]],
  ['AI Builder', [['/resume-builder', 'Resume Builder'], ['/cover-builder', 'Cover Builder']]],
  ['Networking', [['/contacts', 'My Contacts']]],
  ['Account', [['/profile', 'Profile'], ['/resources', 'Resources']]],
] as const;
const PUBLIC = [['/internships', 'Internships'], ['/features', 'Features'], ['/blog', 'Blog'], ['/for-higher-ed', 'For Higher Ed'], ['/sign-in', 'Sign In']] as const;

export function MobileNav({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="lg:hidden">
      <button className="inline-flex size-10 items-center justify-center rounded-full hover:bg-canvas" aria-expanded={open} aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>
      {open && (
        <nav aria-label="Mobile" className="fixed inset-x-0 top-16 z-40 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-line bg-white px-4 pb-6 pt-2 shadow-xl">
          {signedIn
            ? APP.map(([group, items]) => (
                <div key={group} className="py-2">
                  <div className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted">{group}</div>
                  {items.map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2.5 font-medium hover:bg-canvas">{label}</Link>)}
                </div>
              ))
            : PUBLIC.map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3 font-medium hover:bg-canvas">{label}</Link>)}
        </nav>
      )}
    </div>
  );
}
