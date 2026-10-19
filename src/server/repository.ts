import 'server-only';
import {
  schemas,
  type Kind,
  type RecordRow,
  type WorkspaceData,
} from '@/domain/workspace';
import { config, DeskError, type Session } from './auth';
import { localStore } from './local-store';
export class Repository {
  constructor(
    public auth: Session,
    private worker = false,
  ) {}
  async request(path: string, init: RequestInit = {}) {
    if (this.auth.local)
      throw new DeskError('This operation requires the private database.', 409);
    const { url, key: publicKey } = config();
    const key = this.worker
      ? process.env.SUPABASE_SERVICE_ROLE_KEY!
      : publicKey;
    const r = await fetch(`${url}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: key,
        Authorization: `Bearer ${this.auth.token}`,
        'Content-Type': 'application/json',
        ...init.headers,
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok)
      throw new DeskError(
        r.status === 409
          ? 'This record changed in another window. Reload and try again.'
          : 'Private storage request failed. Check migrations and owner access.',
        r.status === 409 ? 409 : 503,
      );
    return r.status === 204 ? null : r.json();
  }
  async list<K extends Kind>(kind: K): Promise<RecordRow<K>[]> {
    if (this.auth.local) return localStore().list(kind);
    const rows: RecordRow<K>[] = [];
    for (let offset = 0; offset < 100000; offset += 1000) {
      const page = await this.request(
        `desk_records?owner_id=eq.${this.auth.owner}&kind=eq.${kind}&order=id&limit=1000&offset=${offset}`,
      );
      rows.push(
        ...page.map((r: RecordRow<K>) => ({
          ...r,
          data: schemas[kind].parse(r.data),
        })),
      );
      if (page.length < 1000) break;
    }
    return rows;
  }
  async get<K extends Kind>(kind: K, id: string): Promise<RecordRow<K> | null> {
    if (this.auth.local) return localStore().get(kind, id);
    const rows = await this.request(
      `desk_records?owner_id=eq.${this.auth.owner}&kind=eq.${kind}&id=eq.${encodeURIComponent(id)}&limit=1`,
    );
    return rows[0]
      ? { ...rows[0], data: schemas[kind].parse(rows[0].data) }
      : null;
  }
  async put<K extends Kind>(
    kind: K,
    id: string,
    input: unknown,
    revision = 0,
  ): Promise<RecordRow<K>> {
    const parsed = schemas[kind].safeParse(input);
    if (!parsed.success)
      throw new DeskError(
        `Invalid ${kind}: ${parsed.error.issues[0]?.path.join('.')} ${parsed.error.issues[0]?.message}`,
      );
    if (this.auth.local) {
      try {
        return localStore().put(
          kind,
          id,
          parsed.data,
          revision,
          this.auth.owner,
        );
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === 'LOCAL_REVISION_CONFLICT'
        )
          throw new DeskError(
            'This record changed. Reload and try again.',
            409,
          );
        throw error;
      }
    }
    const rows = await this.request(
      this.worker ? 'rpc/desk_worker_put' : 'rpc/desk_put',
      {
        method: 'POST',
        body: JSON.stringify({
          ...(this.worker ? { p_owner: this.auth.owner } : {}),
          p_kind: kind,
          p_id: id,
          p_data: parsed.data,
          p_revision: revision,
        }),
      },
    );
    if (!rows?.[0])
      throw new DeskError('Record changed; reload and retry.', 409);
    return rows[0];
  }
  async remove(kind: Kind, id: string) {
    if (this.auth.local) return localStore().remove(kind, id);
    await this.request(
      `desk_records?owner_id=eq.${this.auth.owner}&kind=eq.${kind}&id=eq.${encodeURIComponent(id)}`,
      { method: 'DELETE' },
    );
  }
  async acquire(name: string, seconds: number) {
    if (this.auth.local) return localStore().acquire(name, seconds);
    return this.request(
      this.worker ? 'rpc/desk_worker_acquire' : 'rpc/desk_acquire',
      {
        method: 'POST',
        body: JSON.stringify({
          ...(this.worker ? { p_owner: this.auth.owner } : {}),
          p_name: name,
          p_seconds: seconds,
        }),
      },
    ) as Promise<boolean>;
  }
  async all(): Promise<WorkspaceData> {
    const entries = await Promise.all(
      Object.keys(schemas).map(async (k) => [k, await this.list(k as Kind)]),
    );
    return Object.fromEntries(entries) as WorkspaceData;
  }
}
