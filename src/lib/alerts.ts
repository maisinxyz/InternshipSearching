// Emails new saved-search matches through Resend when RESEND_API_KEY is set.
// Without a key, alerts stay in-app (the notification bell) and nothing is marked emailed.
import { db, now } from './db.ts';

type Pending = { id: string; email: string; name: string; search: string; alerts: string; title: string; company: string; job_id: string };

export async function sendAlertEmails(log: (m: string) => void = () => {}): Promise<number> {
  const key = process.env.RESEND_API_KEY, from = process.env.ALERT_FROM_EMAIL;
  if (!key || !from) return 0;
  const conn = db();
  const rows = conn.prepare(`SELECT n.id, u.email, u.name, s.name AS search, s.alerts, j.title, c.name AS company, j.id AS job_id
    FROM notifications n JOIN users u ON u.id = n.user_id JOIN saved_searches s ON s.id = n.saved_search_id
    JOIN jobs j ON j.id = n.job_id JOIN companies c ON c.slug = j.company_slug
    WHERE n.emailed_at IS NULL AND s.alerts != 'off'`).all() as Pending[];
  // Daily alerts go out once the hour reaches 8 local time; instant alerts on every pass.
  const ready = rows.filter((r) => r.alerts === 'instant' || new Date().getHours() >= 8);
  const byUser = Map.groupBy(ready, (r) => r.email);
  const base = process.env.APP_URL || 'http://127.0.0.1:3002';
  let sent = 0;
  for (const [email, items] of byUser) {
    const lines = items.slice(0, 25).map((r) => `<li><a href="${base}/internships/${encodeURIComponent(r.job_id)}">${escape(r.title)}</a> at ${escape(r.company)} <small>(${escape(r.search)})</small></li>`);
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from, to: email, subject: `${items.length} new internship${items.length === 1 ? '' : 's'} match your alerts`, html: `<p>New on Intern External:</p><ul>${lines.join('')}</ul>` }),
    });
    if (!res.ok) { log(`alert email to user failed: HTTP ${res.status}`); continue; }
    const mark = conn.prepare('UPDATE notifications SET emailed_at = ? WHERE id = ?');
    for (const r of items) mark.run(now(), r.id);
    sent++;
  }
  return sent;
}

const escape = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
