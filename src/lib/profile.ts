import 'server-only';
import type { User } from './auth';
import { db } from './db';
import { emptyProfile, profileSchema, type Profile } from './models';

export function getProfile(user: User): Profile {
  const row = db().prepare('SELECT data FROM profiles WHERE user_id = ?').get(user.id) as { data: string } | undefined;
  return row ? profileSchema.parse(JSON.parse(row.data)) : emptyProfile();
}
