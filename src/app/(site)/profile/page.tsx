import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth';
import { getProfile } from '@/lib/profile';
import { PageHeader } from '@/components/page-header';
import { ProfileEditor } from '@/components/profile-editor';

export const metadata: Metadata = { title: 'Profile' };

export default async function ProfilePage() {
  const user = await requireUser('/profile');
  const profile = getProfile(user);
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <PageHeader title="Your profile" intro="Write it once. The resume and cover builders only use what you put here." />
      <ProfileEditor initial={profile} />
    </div>
  );
}
