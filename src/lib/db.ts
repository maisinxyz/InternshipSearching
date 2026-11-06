import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

// shortcut: single-file SQLite via node:sqlite, upgrade to Postgres when hosting on serverless.
const SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS companies (
  slug TEXT PRIMARY KEY, name TEXT NOT NULL, domain TEXT, industry TEXT, size TEXT, logo TEXT
);
CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY, company_slug TEXT NOT NULL REFERENCES companies(slug), type TEXT NOT NULL, board TEXT NOT NULL,
  interval_min INTEGER NOT NULL DEFAULT 30, enabled INTEGER NOT NULL DEFAULT 1,
  last_run_at TEXT, last_status TEXT, last_error TEXT, last_count INTEGER
);
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY, source_id TEXT NOT NULL, company_slug TEXT NOT NULL REFERENCES companies(slug),
  title TEXT NOT NULL, url TEXT NOT NULL, locations TEXT NOT NULL, places TEXT NOT NULL,
  country TEXT, city TEXT, remote INTEGER NOT NULL DEFAULT 0, work_mode TEXT, employment_type TEXT,
  term TEXT, pay TEXT, pay_text TEXT, deadline TEXT,
  posted_at TEXT, first_seen_at TEXT NOT NULL, last_seen_at TEXT NOT NULL, closed_at TEXT,
  description TEXT NOT NULL, summary TEXT NOT NULL, skills TEXT NOT NULL, majors TEXT NOT NULL, qualifications TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS jobs_open ON jobs(closed_at, first_seen_at);
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL, password_hash TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS saved_jobs (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, job_id TEXT NOT NULL REFERENCES jobs(id),
  created_at TEXT NOT NULL, PRIMARY KEY (user_id, job_id)
);
CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, job_id TEXT REFERENCES jobs(id),
  company TEXT NOT NULL, title TEXT NOT NULL, url TEXT, stage TEXT NOT NULL, applied_on TEXT, notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS saved_searches (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, name TEXT NOT NULL,
  query TEXT NOT NULL, alerts TEXT NOT NULL DEFAULT 'daily', last_checked_at TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  saved_search_id TEXT REFERENCES saved_searches(id) ON DELETE CASCADE, job_id TEXT REFERENCES jobs(id),
  created_at TEXT NOT NULL, read_at TEXT, emailed_at TEXT, UNIQUE (saved_search_id, job_id)
);
CREATE TABLE IF NOT EXISTS profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, data TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, name TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '', company TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '',
  linkedin TEXT NOT NULL DEFAULT '', notes TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, kind TEXT NOT NULL,
  job_id TEXT REFERENCES jobs(id), title TEXT NOT NULL, content TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
`;

const globalDb = globalThis as unknown as { __ieDb?: DatabaseSync };

export function db(path = process.env.DATABASE_PATH || '.data/intern-external.sqlite'): DatabaseSync {
  if (globalDb.__ieDb) return globalDb.__ieDb;
  if (path !== ':memory:') mkdirSync(dirname(resolve(/*turbopackIgnore: true*/ path)), { recursive: true });
  const conn = new DatabaseSync(path);
  conn.exec('PRAGMA busy_timeout = 5000;');
  conn.exec(SCHEMA);
  // node:sqlite rows have a null prototype, which React refuses to pass to Client Components; return plain objects.
  const prepare = conn.prepare.bind(conn);
  conn.prepare = (sql: string) => {
    const st = prepare(sql);
    const all = st.all.bind(st) as (...a: SQLInputValue[]) => object[], get = st.get.bind(st) as (...a: SQLInputValue[]) => object | undefined;
    st.all = ((...args: SQLInputValue[]) => all(...args).map((r) => ({ ...r }))) as typeof st.all;
    st.get = ((...args: SQLInputValue[]) => { const r = get(...args); return r && { ...r }; }) as typeof st.get;
    return st;
  };
  globalDb.__ieDb = conn;
  return conn;
}

export function resetDbForTests() {
  globalDb.__ieDb?.close();
  globalDb.__ieDb = undefined;
}

export const now = () => new Date().toISOString();
export const id = () => crypto.randomUUID();
