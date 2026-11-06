'use client';
import { Trash2 } from 'lucide-react';
import { useActionState, useEffect, useRef, useTransition } from 'react';
import { addContact, deleteContact } from '@/lib/actions';

export function ContactForm() {
  const [state, action, pending] = useActionState(addContact, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state?.ok) ref.current?.reset(); }, [state]);
  const f = (name: string, label: string, type = 'text', required = false) => (
    <div><label className="label" htmlFor={`c-${name}`}>{label}</label><input id={`c-${name}`} name={name} type={type} required={required} className="field" /></div>
  );
  return (
    <form ref={ref} action={action} className="card space-y-3 p-5">
      <h2 className="font-display font-bold">Add a contact</h2>
      {f('name', 'Name', 'text', true)}{f('title', 'Title')}{f('company', 'Company')}{f('email', 'Email', 'email')}{f('linkedin', 'LinkedIn URL')}
      <div><label className="label" htmlFor="c-notes">Notes</label><textarea id="c-notes" name="notes" rows={2} className="field" /></div>
      <button className="btn-primary w-full" disabled={pending}>Add contact</button>
      {state?.ok && <p role="status" className="text-sm text-mint">{state.ok}</p>}
      {state?.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}

export function DeleteContact({ id, name }: { id: string; name: string }) {
  const [pending, start] = useTransition();
  return <button aria-label={`Delete ${name}`} disabled={pending} onClick={() => start(() => deleteContact(id))} className="rounded-full p-1.5 text-muted hover:bg-red-50 hover:text-red-600"><Trash2 className="size-4" /></button>;
}
