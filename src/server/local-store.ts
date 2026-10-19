import 'server-only';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { schemas, type Kind, type RecordRow } from '@/domain/workspace';

export class LocalStore {
  private db: DatabaseSync;
  constructor(directory: string) {
    mkdirSync(directory, { recursive: true, mode: 0o700 });
    this.db = new DatabaseSync(join(directory, 'workspace.sqlite'));
    this.db.exec(`PRAGMA busy_timeout=5000;
      CREATE TABLE IF NOT EXISTS records (
        kind TEXT NOT NULL, id TEXT NOT NULL, value TEXT NOT NULL,
        PRIMARY KEY(kind,id));
      CREATE TABLE IF NOT EXISTS leases (name TEXT PRIMARY KEY, until_ms INTEGER NOT NULL);`);
  }
  list<K extends Kind>(kind: K): RecordRow<K>[] {
    return this.db
      .prepare('SELECT value FROM records WHERE kind=? ORDER BY id')
      .all(kind)
      .map((r) => this.decode(kind, String(r.value)));
  }
  get<K extends Kind>(kind: K, id: string): RecordRow<K> | null {
    const row = this.db
      .prepare('SELECT value FROM records WHERE kind=? AND id=?')
      .get(kind, id);
    return row ? this.decode(kind, String(row.value)) : null;
  }
  private decode<K extends Kind>(kind: K, value: string): RecordRow<K> {
    const row = JSON.parse(value);
    return { ...row, data: schemas[kind].parse(row.data) };
  }
  put<K extends Kind>(
    kind: K,
    id: string,
    input: unknown,
    revision: number,
    owner: string,
  ): RecordRow<K> {
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const old = this.get(kind, id);
      if ((old?.revision || 0) !== revision)
        throw new Error('LOCAL_REVISION_CONFLICT');
      const now = new Date().toISOString();
      const row = {
        kind,
        id,
        owner_id: owner,
        data: schemas[kind].parse(input),
        revision: revision + 1,
        created_at: old?.created_at || now,
        updated_at: now,
      } as RecordRow<K>;
      this.db
        .prepare(
          'INSERT INTO records VALUES(?,?,?) ON CONFLICT(kind,id) DO UPDATE SET value=excluded.value',
        )
        .run(kind, id, JSON.stringify(row));
      this.db.exec('COMMIT');
      return row;
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  }
  remove(kind: Kind, id: string) {
    this.db.prepare('DELETE FROM records WHERE kind=? AND id=?').run(kind, id);
  }
  acquire(name: string, seconds: number) {
    const now = Date.now();
    return (
      this.db
        .prepare(
          'INSERT INTO leases VALUES(?,?) ON CONFLICT(name) DO UPDATE SET until_ms=excluded.until_ms WHERE leases.until_ms < ?',
        )
        .run(name, now + Math.min(600, Math.max(1, seconds)) * 1000, now)
        .changes === 1
    );
  }
  close() {
    this.db.close();
  }
}

let store: LocalStore | undefined;
export function localStore() {
  return (store ||= new LocalStore(join(process.cwd(), '.local')));
}
