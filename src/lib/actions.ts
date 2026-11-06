'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { checkOwnerPassword, currentUser, endSession, ensureOwner, requireUser, startSession } from './auth';
import { db, id, now } from './db';
import { getJob } from './jobs';
import { parseFilters, toQuery } from './search';
import { profileSchema, STAGES } from './models';

export type FormState = { error?: string; ok?: string } | undefined;
const safeNext = (v: FormDataEntryValue | null) => (typeof v === 'string' && v.startsWith('/') && !v.startsWith('//') ? v : '/internships');

// ---- Sign in (single owner) -------------------------------------------------
export async function signIn(_: FormState, form: FormData): Promise<FormState> {
  const result = checkOwnerPassword(String(form.get('password') ?? ''));
  if (result === 'unconfigured') return { error: 'Set APP_PASSWORD in .env.local and restart the server.' };
  if (result === 'locked') return { error: 'Too many attempts. Wait a minute and try again.' };
  if (result === 'wrong') return { error: 'Incorrect password.' };
  await startSession(ensureOwner());
  redirect(safeNext(form.get('next')));
}

export async function signOut() {
  await endSession();
  redirect('/');
}

// ---- Saved jobs -------------------------------------------------------------
export async function toggleSave(jobId: string): Promise<boolean> {
  const user = await requireUser(`/internships/${encodeURIComponent(jobId)}`);
  if (!getJob(jobId)) throw new Error('Job not found');
  const conn = db();
  const removed = conn.prepare('DELETE FROM saved_jobs WHERE user_id = ? AND job_id = ?').run(user.id, jobId).changes;
  if (!removed) conn.prepare('INSERT INTO saved_jobs (user_id, job_id, created_at) VALUES (?, ?, ?)').run(user.id, jobId, now());
  revalidatePath('/saved');
  return !removed;
}

// ---- Saved searches & alerts ------------------------------------------------
const alertsSchema = z.enum(['off', 'daily', 'instant']);

export async function saveSearch(_: FormState, form: FormData): Promise<FormState> {
  const query = toQuery(parseFilters(new URLSearchParams(String(form.get('query') ?? ''))));
  const user = await requireUser(`/internships?${query}`);
  const name = String(form.get('name') ?? '').trim().slice(0, 80) || 'My search';
  const alerts = alertsSchema.catch('daily').parse(form.get('alerts'));
  const at = now();
  db().prepare('INSERT INTO saved_searches (id, user_id, name, query, alerts, last_checked_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id(), user.id, name, query, alerts, at, at);
  revalidatePath('/searches');
  return { ok: alerts === 'off' ? 'Search saved.' : 'Search saved. We’ll alert you about new matches.' };
}

export async function updateSearchAlerts(searchId: string, alerts: string) {
  const user = await requireUser('/searches');
  db().prepare('UPDATE saved_searches SET alerts = ? WHERE id = ? AND user_id = ?').run(alertsSchema.parse(alerts), searchId, user.id);
  revalidatePath('/searches');
}

export async function deleteSearch(searchId: string) {
  const user = await requireUser('/searches');
  db().prepare('DELETE FROM saved_searches WHERE id = ? AND user_id = ?').run(searchId, user.id);
  revalidatePath('/searches');
}

export async function markNotificationsRead() {
  const user = await currentUser();
  if (!user) return;
  db().prepare('UPDATE notifications SET read_at = ? WHERE user_id = ? AND read_at IS NULL').run(now(), user.id);
  revalidatePath('/', 'layout');
}

// ---- Job tracker ------------------------------------------------------------
export async function trackJob(jobId: string) {
  const user = await requireUser(`/internships/${encodeURIComponent(jobId)}`);
  const job = getJob(jobId);
  if (!job) throw new Error('Job not found');
  const conn = db();
  const existing = conn.prepare('SELECT id FROM applications WHERE user_id = ? AND job_id = ?').get(user.id, jobId);
  if (!existing) {
    const at = now();
    conn.prepare('INSERT INTO applications (id, user_id, job_id, company, title, url, stage, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id(), user.id, jobId, job.company_name, job.title, job.url, 'saved', at, at);
  }
  revalidatePath('/tracker');
  redirect('/tracker');
}

const manualSchema = z.object({ company: z.string().trim().min(1).max(120), title: z.string().trim().min(1).max(200), url: z.string().trim().max(500), stage: z.enum(STAGES) });

export async function addApplication(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser('/tracker');
  const parsed = manualSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: 'Add a company and a role title.' };
  const at = now();
  db().prepare('INSERT INTO applications (id, user_id, company, title, url, stage, applied_on, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id(), user.id, parsed.data.company, parsed.data.title, parsed.data.url || null, parsed.data.stage, parsed.data.stage === 'saved' ? null : at.slice(0, 10), at, at);
  revalidatePath('/tracker');
  return { ok: 'Added.' };
}

export async function moveApplication(appId: string, stage: string) {
  const user = await requireUser('/tracker');
  const s = z.enum(STAGES).parse(stage);
  // Moving past "saved" for the first time records the applied date (date-only).
  db().prepare(`UPDATE applications SET stage = ?, updated_at = ?, applied_on = COALESCE(applied_on, CASE WHEN ? != 'saved' THEN ? END)
    WHERE id = ? AND user_id = ?`).run(s, now(), s, now().slice(0, 10), appId, user.id);
  revalidatePath('/tracker');
}

export async function updateApplication(appId: string, patch: { notes?: string; applied_on?: string | null }) {
  const user = await requireUser('/tracker');
  const p = z.object({ notes: z.string().max(5000).optional(), applied_on: z.iso.date().nullable().optional() }).parse(patch);
  const row = db().prepare('SELECT notes, applied_on FROM applications WHERE id = ? AND user_id = ?').get(appId, user.id) as { notes: string; applied_on: string | null } | undefined;
  if (!row) return;
  db().prepare('UPDATE applications SET notes = ?, applied_on = ?, updated_at = ? WHERE id = ?')
    .run(p.notes ?? row.notes, p.applied_on === undefined ? row.applied_on : p.applied_on, now(), appId);
  revalidatePath('/tracker');
}

export async function deleteApplication(appId: string) {
  const user = await requireUser('/tracker');
  db().prepare('DELETE FROM applications WHERE id = ? AND user_id = ?').run(appId, user.id);
  revalidatePath('/tracker');
}

// ---- Profile ----------------------------------------------------------------
export async function saveProfile(data: unknown): Promise<FormState> {
  const user = await requireUser('/profile');
  const parsed = profileSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  db().prepare(`INSERT INTO profiles (user_id, data, updated_at) VALUES (?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`).run(user.id, JSON.stringify(parsed.data), now());
  revalidatePath('/profile');
  return { ok: 'Profile saved.' };
}

// ---- Contacts ---------------------------------------------------------------
const contactSchema = z.object({
  name: z.string().trim().min(1, 'Add a name').max(120), title: z.string().trim().max(120), company: z.string().trim().max(120),
  email: z.union([z.literal(''), z.email('Enter a valid email')]), linkedin: z.string().trim().max(300), notes: z.string().max(2000),
});

export async function addContact(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser('/contacts');
  const parsed = contactSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const c = parsed.data;
  db().prepare('INSERT INTO contacts (id, user_id, name, title, company, email, linkedin, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id(), user.id, c.name, c.title, c.company, c.email, c.linkedin, c.notes, now());
  revalidatePath('/contacts');
  return { ok: 'Contact added.' };
}

export async function deleteContact(contactId: string) {
  const user = await requireUser('/contacts');
  db().prepare('DELETE FROM contacts WHERE id = ? AND user_id = ?').run(contactId, user.id);
  revalidatePath('/contacts');
}

// ---- AI documents -----------------------------------------------------------
export async function generateDocument(kind: 'resume' | 'cover', jobId: string | null): Promise<{ id?: string; error?: string }> {
  const user = await requireUser(kind === 'resume' ? '/resume-builder' : '/cover-builder');
  const { generate } = await import('./ai');
  try {
    const row = db().prepare('SELECT data FROM profiles WHERE user_id = ?').get(user.id) as { data: string } | undefined;
    const profile = row ? profileSchema.parse(JSON.parse(row.data)) : null;
    if (!profile || !profile.fullName) return { error: 'Fill in your profile first. The builders only use what you’ve written there.' };
    const job = jobId ? getJob(jobId) : null;
    if (kind === 'cover' && !job) return { error: 'Pick a job for the cover letter.' };
    const content = await generate(kind, profile, job);
    const docId = id(), at = now();
    const title = `${kind === 'resume' ? 'Resume' : 'Cover letter'}${job ? `: ${job.company_name}, ${job.title}` : ''}`;
    db().prepare('INSERT INTO documents (id, user_id, kind, job_id, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(docId, user.id, kind, job?.id ?? null, title.slice(0, 200), content, at, at);
    revalidatePath(kind === 'resume' ? '/resume-builder' : '/cover-builder');
    return { id: docId };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function saveDocument(docId: string, content: string): Promise<FormState> {
  const user = await requireUser('/resume-builder');
  db().prepare('UPDATE documents SET content = ?, updated_at = ? WHERE id = ? AND user_id = ?').run(content.slice(0, 50_000), now(), docId, user.id);
  return { ok: 'Saved.' };
}

export async function deleteDocument(docId: string, kind: string) {
  const user = await requireUser('/resume-builder');
  db().prepare('DELETE FROM documents WHERE id = ? AND user_id = ?').run(docId, user.id);
  revalidatePath(kind === 'resume' ? '/resume-builder' : '/cover-builder');
}
