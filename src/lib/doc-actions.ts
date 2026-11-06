'use server';
import { requireUser } from './auth';
import { db, id, now } from './db';
import { getProfile } from './profile';

export async function createBlankDocument(kind: 'resume' | 'cover'): Promise<string> {
  const user = await requireUser(kind === 'resume' ? '/resume-builder' : '/cover-builder');
  const p = getProfile(user);
  const entry = (e: { title: string; org: string; location: string; start: string; end: string; bullets: string[] }) =>
    `**${e.title}**, ${e.org}${e.location ? ` | ${e.location}` : ''}${e.start ? ` | ${e.start}–${e.end || 'Present'}` : ''}\n${e.bullets.filter(Boolean).map((b) => `- ${b}`).join('\n')}`;
  const section = (label: string, items: Parameters<typeof entry>[0][]) => (items.length ? `\n## ${label}\n${items.map(entry).join('\n\n')}\n` : '');
  const content = kind === 'resume'
    ? `# ${p.fullName}\n${[p.email, p.phone, p.location, p.links].filter(Boolean).join(' | ')}\n${section('Education', p.education)}${section('Experience', p.experience)}${section('Projects', p.projects)}${p.skills ? `\n## Skills\n${p.skills}\n` : ''}${section('Activities', p.activities)}${section('Volunteer', p.volunteer)}`
    : `Dear Hiring Team,\n\n\n\nSincerely,\n${p.fullName}`;
  const docId = id(), at = now();
  db().prepare('INSERT INTO documents (id, user_id, kind, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(docId, user.id, kind, kind === 'resume' ? 'Resume (from profile)' : 'Cover letter draft', content, at, at);
  return docId;
}
