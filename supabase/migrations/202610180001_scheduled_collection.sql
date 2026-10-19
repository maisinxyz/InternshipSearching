-- Additive upgrade. Only the server's service role can invoke worker writes.
-- Existing owner RLS and browser RPCs are unchanged.
create or replace function public.desk_worker_put(p_owner uuid, p_kind text, p_id text, p_data jsonb, p_revision bigint default 0)
returns setof public.desk_records language plpgsql security invoker set search_path = '' as $$
begin
 if p_kind not in ('job','connector','sync') or not exists(select 1 from public.desk_owners where owner_id=p_owner) then
  raise exception 'Worker scope denied' using errcode='42501';
 end if;
 if p_revision=0 then
  return query insert into public.desk_records(owner_id,kind,id,data) values(p_owner,p_kind,p_id,p_data) returning *;
 else
  return query update public.desk_records set data=p_data, revision=revision+1, updated_at=now()
   where owner_id=p_owner and kind=p_kind and id=p_id and revision=p_revision returning *;
  if not found then raise exception 'Revision conflict' using errcode='40001'; end if;
 end if;
end; $$;
revoke all on function public.desk_worker_put(uuid,text,text,jsonb,bigint) from public, anon, authenticated;
grant execute on function public.desk_worker_put(uuid,text,text,jsonb,bigint) to service_role;

create or replace function public.desk_worker_acquire(p_owner uuid, p_name text, p_seconds integer)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare n integer;
begin
 if not exists(select 1 from public.desk_owners where owner_id=p_owner) or (p_name <> 'scheduler' and p_name not like 'sync:%') then
  raise exception 'Worker scope denied' using errcode='42501';
 end if;
 insert into public.desk_leases values(p_owner,p_name,now()+make_interval(secs=>least(greatest(p_seconds,1),600)))
 on conflict(owner_id,name) do update set until_at=excluded.until_at where public.desk_leases.until_at < now();
 get diagnostics n = row_count;
 return n=1;
end; $$;
revoke all on function public.desk_worker_acquire(uuid,text,integer) from public, anon, authenticated;
grant execute on function public.desk_worker_acquire(uuid,text,integer) to service_role;

-- Explicit service privileges; browser roles remain protected by existing RLS.
grant select on public.desk_owners to service_role;
grant select, insert, update on public.desk_records, public.desk_leases to service_role;
