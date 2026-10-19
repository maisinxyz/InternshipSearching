-- Run only after deployment and the additive scheduled_collection migration.
-- In Supabase Vault first create:
--   desk_sync_url: https://YOUR-DEPLOYMENT/api/sync
--   desk_cron_secret: the same 32+ character CRON_SECRET as the server
-- Never commit actual values. This script does not create or rotate credentials.
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

do $$
begin
 if not exists(select 1 from vault.decrypted_secrets where name='desk_sync_url' and decrypted_secret like 'https://%/api/sync')
 or not exists(select 1 from vault.decrypted_secrets where name='desk_cron_secret' and length(decrypted_secret)>=32) then
  raise exception 'Configure the deployment URL and matching scheduler secret in Vault first';
 end if;
end; $$;

select cron.schedule('desk-direct-feed', '* * * * *', $$
 select net.http_post(
   url := (select decrypted_secret from vault.decrypted_secrets where name='desk_sync_url'),
   headers := jsonb_build_object('Content-Type','application/json','Authorization',
     'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name='desk_cron_secret')),
   body := '{}'::jsonb,
   timeout_milliseconds := 60000
 );
$$);

-- Pause collection: select cron.unschedule('desk-direct-feed');
-- A successful HTTP dispatch is not proof of successful job collection.
-- Verify /api/sync health, source lastSync and the authenticated coverage screen.
