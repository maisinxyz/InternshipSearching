import type { Metadata } from 'next';
import { ProsePage } from '@/components/prose-page';

export const metadata: Metadata = { title: 'Privacy policy' };

export default function PrivacyPage() {
  return (
    <ProsePage title="Privacy policy" intro="Plain-language summary. Have it reviewed before any public launch.">
      <h2>What we store</h2>
      <ul>
        <li>Your account: name, email and a salted password hash</li>
        <li>What you create: saved jobs, searches, tracker entries, profile, contacts and documents</li>
        <li>A session cookie that keeps you signed in</li>
      </ul>
      <h2>AI features</h2>
      <p>When you click Generate, your profile and the selected job description are sent to Anthropic’s API to write the document. Nothing is sent unless you click Generate.</p>
      <h2>Email</h2>
      <p>If alert emails are enabled on this server, your email address and matching job titles are sent through the configured email provider.</p>
      <h2>Your control</h2>
      <p>You can edit or delete anything you’ve created at any time. To delete your account, contact the operator of this deployment.</p>
    </ProsePage>
  );
}
