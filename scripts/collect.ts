// Usage: npm run collect          (one pass over every source)
//        npm run worker           (keeps running; re-checks due sources every minute)
import { collectDue } from '../src/lib/collect.ts';
import { sendAlertEmails } from '../src/lib/alerts.ts';

const watch = process.argv.includes('--watch');
const log = (m: string) => console.log(`[${new Date().toLocaleTimeString()}] ${m}`);

async function pass(force: boolean) {
  const r = await collectDue(force, log);
  const emailed = await sendAlertEmails(log);
  log(`checked ${r.checked} sources, ${r.added} new internships, ${r.failed} failed, ${r.alerts} alert matches, ${emailed} emails`);
}

await pass(!watch);
if (watch) setInterval(() => pass(false).catch((e) => log(`pass failed: ${e}`)), 60_000);
