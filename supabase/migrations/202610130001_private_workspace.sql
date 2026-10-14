-- Apply using the Supabase SQL editor or CLI, then insert your Auth UUID into desk_owners.
create table public.desk_owners (owner_id uuid primary key references auth.users(id) on delete cascade);
alter table public.desk_owners enable row level security;
revoke all on public.desk_owners from anon, authenticated;
create function public.desk_is_owner() returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.desk_owners where owner_id = auth.uid());
$$;
revoke all on function public.desk_is_owner() from public;
grant execute on function public.desk_is_owner() to authenticated;
create table public.desk_records (
 owner_id uuid not null references auth.users(id) on delete cascade,
 kind text not null check(kind in ('job','search','connector','fact','template','rules','draft','application','material','followup','profile','state','visit','sync','override')),
 id text not null check(length(id) between 1 and 200),
 data jsonb not null check(jsonb_typeof(data)='object'),
 revision bigint not null default 1,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 primary key(owner_id,kind,id)
);
create index desk_records_recent on public.desk_records(owner_id,kind,updated_at desc);
create index desk_job_sources on public.desk_records using gin (data jsonb_path_ops) where kind='job';
alter table public.desk_records enable row level security;
create policy owner_records on public.desk_records for all to authenticated using (owner_id=auth.uid() and public.desk_is_owner()) with check(owner_id=auth.uid() and public.desk_is_owner());
grant select,insert,update,delete on public.desk_records to authenticated;
revoke all on public.desk_records from anon;
create function public.desk_put(p_kind text,p_id text,p_data jsonb,p_revision bigint default 0) returns setof public.desk_records language plpgsql security invoker set search_path='' as $$
begin
 if p_revision=0 then
  return query insert into public.desk_records(owner_id,kind,id,data) values(auth.uid(),p_kind,p_id,p_data) returning *;
 else
  return query update public.desk_records set data=p_data,revision=revision+1,updated_at=now() where owner_id=auth.uid() and kind=p_kind and id=p_id and revision=p_revision returning *;
  if not found then raise exception 'Revision conflict' using errcode='40001'; end if;
 end if;
end; $$;
revoke all on function public.desk_put(text,text,jsonb,bigint) from public;
grant execute on function public.desk_put(text,text,jsonb,bigint) to authenticated;
-- Durable leases also bound concurrent syncs and expensive AI requests across instances.
create table public.desk_leases(owner_id uuid not null references auth.users(id),name text not null,until_at timestamptz not null,primary key(owner_id,name));
alter table public.desk_leases enable row level security;
create policy owner_leases on public.desk_leases for all to authenticated using(owner_id=auth.uid() and public.desk_is_owner()) with check(owner_id=auth.uid() and public.desk_is_owner());
grant select,insert,update,delete on public.desk_leases to authenticated;
create function public.desk_acquire(p_name text,p_seconds integer) returns boolean language plpgsql security invoker set search_path='' as $$
declare n integer;
begin
 insert into public.desk_leases values(auth.uid(),p_name,now()+make_interval(secs=>least(greatest(p_seconds,1),600))) on conflict(owner_id,name) do update set until_at=excluded.until_at where public.desk_leases.until_at<now();
 get diagnostics n = row_count; return n=1;
end; $$;
revoke all on function public.desk_acquire(text,integer) from public;
grant execute on function public.desk_acquire(text,integer) to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('desk-private','desk-private',false,5242880,array['application/pdf','text/plain','application/x-tex']) on conflict(id) do nothing;
create policy desk_private_files on storage.objects for all to authenticated using(bucket_id='desk-private' and (storage.foldername(name))[1]=auth.uid()::text and public.desk_is_owner()) with check(bucket_id='desk-private' and (storage.foldername(name))[1]=auth.uid()::text and public.desk_is_owner());
-- Merge restoration is transactional and does not delete records absent from the backup.
create function public.desk_restore(p_rows jsonb) returns void language plpgsql security invoker set search_path='' as $$
declare r jsonb;
begin
 if jsonb_array_length(p_rows)>10000 then raise exception 'Backup too large'; end if;
 for r in select * from jsonb_array_elements(p_rows) loop
 insert into public.desk_records(owner_id,kind,id,data,created_at) values(auth.uid(),r->>'kind',r->>'id',r->'data',(r->>'created_at')::timestamptz)
 on conflict(owner_id,kind,id) do update set data=excluded.data,revision=public.desk_records.revision+1,updated_at=now();
 end loop;
end; $$;
revoke all on function public.desk_restore(jsonb) from public;
grant execute on function public.desk_restore(jsonb) to authenticated;
