'use client';
import { createContext,useContext,type ReactNode } from 'react';
import type { Kind,RecordRow,WorkspaceData } from '@/domain/workspace';
export async function api<T=unknown>(path:string,input?:unknown):Promise<T>{const r=await fetch('/api/desk/'+path,{method:input===undefined?'GET':'POST',headers:input===undefined?{}:{'Content-Type':'application/json'},body:input===undefined?undefined:JSON.stringify(input)});const value=await r.json();if(!r.ok)throw new Error(value.error||'Request failed.');return value;}
export function download(text:string,name:string,type='text/plain'){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();URL.revokeObjectURL(url);}
export const DeskContext=createContext<{data:WorkspaceData;reload:()=>Promise<void>;perform:(fn:()=>Promise<unknown>,message?:string)=>Promise<void>;busy:boolean}>({} as never);
export const useDesk=()=>useContext(DeskContext);
export function Field({label,children,hint}:{label:string;children:ReactNode;hint?:string}){return <label className="desk-field"><span>{label}</span>{children}{hint&&<small>{hint}</small>}</label>;}
export function Panel({title,children,description}:{title:string;children:ReactNode;description?:string}){return <section className="desk-panel"><h2>{title}</h2>{description&&<p className="desk-muted">{description}</p>}{children}</section>;}
export function Empty({children}:{children:ReactNode}){return <div className="desk-empty">{children}</div>;}
export function save<K extends Kind>(kind:K,data:RecordRow<K>['data'],row?:RecordRow<K>){return api<RecordRow<K>>('record/'+kind,{data,id:row?.id,revision:row?.revision||0});}
