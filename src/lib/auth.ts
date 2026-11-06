import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { db, now } from './db';

// shortcut: single-owner mode, one shared password (APP_PASSWORD) and one fixed user; add real accounts before sharing this publicly.
const COOKIE = 'ie_session';
const DAYS = 30;

export type User = { id: string; email: string; name: string };

const OWNER = { id: 'owner', email: 'owner@local', name: 'Me' };
const digest = (v: string) => createHash('sha256').update(v).digest();
let fails = 0, lockedUntil = 0;

/** Checks the owner password; 5 wrong tries lock sign-in for a minute. */
export function checkOwnerPassword(password: string): 'ok' | 'wrong' | 'locked' | 'unconfigured' {
  const expected = process.env.APP_PASSWORD;
  if (!expected) return 'unconfigured';
  if (Date.now() < lockedUntil) return 'locked';
  if (timingSafeEqual(digest(password), digest(expected))) { fails = 0; return 'ok'; }
  if (++fails >= 5) { fails = 0; lockedUntil = Date.now() + 60_000; }
  return 'wrong';
}

export function ensureOwner(): string {
  db().prepare("INSERT OR IGNORE INTO users (id, email, name, password_hash, created_at) VALUES (?, ?, ?, 'unused', ?)").run(OWNER.id, OWNER.email, OWNER.name, now());
  return OWNER.id;
}

export async function currentUser(): Promise<User | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const row = db().prepare(`SELECT u.id, u.email, u.name FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token = ? AND s.expires_at > ?`).get(token, now()) as User | undefined;
  return row ?? null;
}

export async function requireUser(next = '/internships'): Promise<User> {
  const user = await currentUser();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent(next)}`);
  return user;
}

export async function startSession(userId: string) {
  const token = randomBytes(32).toString('base64url');
  const expires = new Date(Date.now() + DAYS * 86_400_000);
  db().prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(token, userId, expires.toISOString());
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' && !process.env.ALLOW_HTTP_COOKIES, path: '/', expires });
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) db().prepare('DELETE FROM sessions WHERE token = ?').run(token);
  jar.delete(COOKIE);
}
