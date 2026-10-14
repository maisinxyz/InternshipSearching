import 'server-only';
import { schemas, type Kind, type RecordRow, type WorkspaceData } from '@/domain/workspace';
import { config, DeskError, type Session } from './auth';
export class Repository {
 constructor(public auth:Session){}
 async request(path:string,init:RequestInit={}){const {url,key}=config();const r=await fetch(`${url}/rest/v1/${path}`,{...init,headers:{apikey:key,Authorization:`Bearer ${this.auth.token}`,'Content-Type':'application/json',...init.headers},cache:'no-store',signal:AbortSignal.timeout(15000)});if(!r.ok)throw new DeskError(r.status===409?'This record changed in another window. Reload and try again.':'Private storage request failed. Check migrations and owner access.',r.status===409?409:503);return r.status===204?null:r.json();}
 async list<K extends Kind>(kind:K):Promise<RecordRow<K>[]>{const rows:RecordRow<K>[]=[];for(let offset=0;offset<100000;offset+=1000){const page=await this.request(`desk_records?owner_id=eq.${this.auth.owner}&kind=eq.${kind}&order=id&limit=1000&offset=${offset}`);rows.push(...page);if(page.length<1000)break;}return rows;}
 async get<K extends Kind>(kind:K,id:string):Promise<RecordRow<K>|null>{const rows=await this.request(`desk_records?owner_id=eq.${this.auth.owner}&kind=eq.${kind}&id=eq.${encodeURIComponent(id)}&limit=1`);return rows[0]||null;}
 async put<K extends Kind>(kind:K,id:string,input:unknown,revision=0):Promise<RecordRow<K>>{const parsed=schemas[kind].safeParse(input);if(!parsed.success)throw new DeskError(`Invalid ${kind}: ${parsed.error.issues[0]?.path.join('.')} ${parsed.error.issues[0]?.message}`);const rows=await this.request('rpc/desk_put',{method:'POST',body:JSON.stringify({p_kind:kind,p_id:id,p_data:parsed.data,p_revision:revision})});if(!rows?.[0])throw new DeskError('Record changed; reload and retry.',409);return rows[0];}
 async remove(kind:Kind,id:string){await this.request(`desk_records?owner_id=eq.${this.auth.owner}&kind=eq.${kind}&id=eq.${encodeURIComponent(id)}`,{method:'DELETE'});}
 async acquire(name:string,seconds:number){return this.request('rpc/desk_acquire',{method:'POST',body:JSON.stringify({p_name:name,p_seconds:seconds})}) as Promise<boolean>;}
 async all():Promise<WorkspaceData>{const entries=await Promise.all(Object.keys(schemas).map(async k=>[k,await this.list(k as Kind)]));return Object.fromEntries(entries) as WorkspaceData;}
}
