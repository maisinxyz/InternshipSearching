import Link from 'next/link';
import { Bell } from 'lucide-react';
import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { signOut } from '@/lib/actions';
import { Wordmark } from './logo';
import { Dropdown } from './dropdown';
import { MobileNav } from './mobile-nav';
import { NotificationsPanel } from './notifications';

const menuLink = 'block rounded-xl px-3 py-2 text-sm font-medium text-ink hover:bg-canvas';
const navBtn = 'inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold text-ink/80 hover:text-ink hover:bg-canvas';

export const APP_NAV = [
  { label: 'Jobs', items: [{ href: '/internships', label: 'Internships' }, { href: '/saved', label: 'Saved Jobs' }, { href: '/tracker', label: 'Job Tracker' }, { href: '/searches', label: 'Saved Searches & Alerts' }] },
  { label: 'AI Builder', items: [{ href: '/resume-builder', label: 'Resume Builder' }, { href: '/cover-builder', label: 'Cover Builder' }] },
  { label: 'Networking', items: [{ href: '/contacts', label: 'My Contacts' }] },
];
export const PUBLIC_NAV = [
  { href: '/internships', label: 'Internships' }, { href: '/features', label: 'Features' }, { href: '/blog', label: 'Blog' }, { href: '/for-higher-ed', label: 'For Higher Ed' },
];

export async function SiteHeader() {
  const user = await currentUser();
  type Note = { id: string; title: string; company: string; job_id: string; search: string; created_at: string; read_at: string | null };
  const notes = user
    ? (db().prepare(`SELECT n.id, j.title, c.name AS company, j.id AS job_id, s.name AS search, n.created_at, n.read_at
        FROM notifications n JOIN jobs j ON j.id = n.job_id JOIN companies c ON c.slug = j.company_slug
        LEFT JOIN saved_searches s ON s.id = n.saved_search_id WHERE n.user_id = ? ORDER BY n.created_at DESC LIMIT 20`).all(user.id) as Note[])
    : [];
  const unread = notes.filter((n) => !n.read_at).length;

  return (
    <header className="no-print sticky top-0 z-30 border-b border-line/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Wordmark href={user ? '/internships' : '/'} />
        <nav aria-label="Main" className="ml-4 hidden items-center gap-1 lg:flex">
          {user ? (
            <>
              {APP_NAV.map((group) => (
                <Dropdown key={group.label} label={group.label} className={navBtn} panelClass="w-60">
                  {group.items.map((i) => <Link key={i.href} href={i.href} className={menuLink}>{i.label}</Link>)}
                </Dropdown>
              ))}
              <Link href="/profile" className={navBtn}>Profile</Link>
              <Link href="/resources" className={navBtn}>Resources</Link>
            </>
          ) : (
            PUBLIC_NAV.map((i) => <Link key={i.href} href={i.href} className={navBtn}>{i.label}</Link>)
          )}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <Dropdown align="right" panelClass="w-80" className="relative inline-flex size-10 items-center justify-center rounded-full hover:bg-canvas [&>svg:last-child]:hidden"
                label={<><Bell className="size-5" aria-hidden /><span className="sr-only">Notifications{unread ? ` (${unread} unread)` : ''}</span>{unread > 0 && <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-brand text-[10px] font-bold text-white">{Math.min(unread, 9)}</span>}</>}>
                <NotificationsPanel notes={notes} unread={unread} />
              </Dropdown>
              <Dropdown align="right" panelClass="w-56" className="inline-flex items-center gap-1 rounded-full p-1 hover:bg-canvas"
                label={<span className="grid size-8 place-items-center rounded-full bg-brand-soft text-sm font-bold text-brand" aria-label="Account menu">{user.name.slice(0, 1).toUpperCase()}</span>}>
                <div className="px-3 py-2 text-sm"><div className="font-semibold">{user.name}</div><div className="truncate text-muted">{user.email}</div></div>
                <Link href="/profile" className={menuLink}>Profile</Link>
                <Link href="/searches" className={menuLink}>Alerts</Link>
                <form action={signOut}><button className={`${menuLink} w-full text-left`}>Sign out</button></form>
              </Dropdown>
            </>
          ) : (
            <>
              <Link href="/sign-in" className="hidden text-sm font-semibold text-ink/80 hover:text-ink sm:inline">Sign In</Link>
              <Link href="/sign-up" className="btn-dark">Start for free</Link>
            </>
          )}
          <MobileNav signedIn={Boolean(user)} />
        </div>
      </div>
    </header>
  );
}
