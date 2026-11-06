import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { PageHeader } from '@/components/page-header';
import { ContactForm, DeleteContact } from '@/components/contacts';

export const metadata: Metadata = { title: 'My Contacts' };

type Contact = { id: string; name: string; title: string; company: string; email: string; linkedin: string; notes: string };

export default async function ContactsPage() {
  const user = await requireUser('/contacts');
  const rows = db().prepare('SELECT * FROM contacts WHERE user_id = ? ORDER BY company, name').all(user.id) as Contact[];
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <PageHeader title="My Contacts" intro="Recruiters, alumni and referrals you’ve met. Only you can see this list." />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="card overflow-x-auto">
          {rows.length === 0 ? <p className="p-10 text-center text-muted">No contacts yet. Add the first one with the form.</p> : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
                <tr><th className="px-4 py-3 font-semibold">Name</th><th className="px-4 py-3 font-semibold">Company</th><th className="px-4 py-3 font-semibold">Contact</th><th className="px-4 py-3"><span className="sr-only">Actions</span></th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((c) => (
                  <tr key={c.id} className="align-top">
                    <td className="px-4 py-3"><div className="font-semibold">{c.name}</div><div className="text-muted">{c.title}</div>{c.notes && <div className="mt-1 max-w-xs text-xs text-muted">{c.notes}</div>}</td>
                    <td className="px-4 py-3">{c.company}</td>
                    <td className="px-4 py-3">
                      {c.email && <div><span className="select-all">{c.email}</span></div>}
                      {c.linkedin && <a href={c.linkedin.startsWith('http') ? c.linkedin : `https://${c.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">LinkedIn</a>}
                    </td>
                    <td className="px-4 py-3 text-right"><DeleteContact id={c.id} name={c.name} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <aside className="space-y-4">
          <ContactForm />
          <div className="rounded-2xl border border-dashed border-line p-4 text-sm text-muted">
            <p className="font-semibold text-ink">Recruiter finder: coming later</p>
            <p className="mt-1">Automatic recruiter email lookup needs a licensed contact-data provider. It isn’t connected, so contacts here are the ones you add yourself.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
