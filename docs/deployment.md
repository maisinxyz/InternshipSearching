## Temporary local access

The current ignored `.env.local` enables `LOCAL_OPEN_ACCESS=true`. Open either
loopback server without signing in. This uses a shared, persistent SQLite file
under ignored `.local/`, separate from the existing Supabase workspace. Node 22
with built-in SQLite is required. Everyone using this local mode shares records.
Set the flag to false and restart both servers to restore owner login. Keep it
false on hosted deployments; Vercel also explicitly disables the local bypass.
Hosted backup restoration remains a private-database operation.

# Private workspace setup

This checkpoint builds locally, but is not production-ready. Activation of scheduled collection,
restore safety, resume validation, and full integration acceptance remain open in
[NEXT-SESSION.md](NEXT-SESSION.md). Do not treat a successful build as acceptance.

## Database and owner

1. Create a Supabase project in the intended account. Confirm the plan before
   provisioning any paid resources.
2. Apply `supabase/migrations/202610130001_private_workspace.sql` to a fresh
   project through its SQL editor. This migration is not an idempotent upgrade.
3. Create one email/password Auth user and record its UUID privately. Disable
   public signups. Add the same UUID to the allowlist:

   ```sql
   insert into public.desk_owners (owner_id) values ('YOUR_AUTH_USER_UUID');
   ```

4. Copy `.env.example` to the ignored `.env.local`. Set `SUPABASE_URL`,
   `SUPABASE_ANON_KEY`, and `OWNER_ID`. These are server environment variables;
   do not introduce `NEXT_PUBLIC_` variants. Do not put passwords, keys, resumes,
   or backups into repository files or chat.
5. Run `npm run dev`, sign in, and confirm that a second, non-owner Auth user
   cannot read or mutate records. Verify row-level security with direct requests
   as well as the app. Check that signed-out requests fail.
6. Save a search, restart the app, and confirm persistence. Development fixtures
   can be enabled with `ALLOW_FIXTURE_SEED=true` outside production and imported
   through the authenticated `/api/desk/seed` POST workflow.

The owner UUID in the environment must match both the Auth account and
`desk_owners`. Requests use the owner's JWT and the public API key; the app does
not currently use a service-role key. Sessions currently require signing in again
when the access token expires.

## Hosting

Vercel CLI sign-in completed on 2026-10-14. The user also created the Free
Supabase project `co-op-desk` (us-east-2), with automatic table exposure disabled.
Its migration and allowlisted owner account are configured; public signup is
disabled. Database role isolation and private bucket checks passed. Local owner
sign-in and saved-search persistence across restart are verified. Job and
application persistence still need verification. No hosting deployment exists.
Once integration checks pass, configure the same environment
variables on the intended hosting project, build with `npm run build`, and verify
private access on its deployment URL. Never enable fixture seeding in production.

Without database configuration `/` displays setup. `/preview` intentionally
shows public synthetic fixtures; it must never contain private workspace data.

## Optional Gemini and resume setup

Set `GEMINI_API_KEY` and a supported `GEMINI_MODEL` on the server to enable
assisted extraction and drafting. Review provider data handling before using
private facts. Manual browsing/editing does not require an AI key.

Import the actual `.tex` master privately through Resume, preserve its original
11 pt layout, and review every extracted fact. The earlier chat attachment/source
is not available in this checkout. Existing saved rules are versioned and are
not rewritten when application defaults change; review any rule that says 10 pt.
Compile generated documents separately before asserting a one-page result.

## Activate the direct employer feed later

The user requested local completion on 2026-10-18. No deployment, privileged
credential setup, SQL migration or cron activation was performed for this change.
Manual authenticated collection works without a service-role key.

1. Apply `supabase/migrations/202610180001_scheduled_collection.sql` after the
   original migration. It adds service-role-only worker RPCs for an allowlisted
   owner and the job/connector/sync record kinds. Test anon and authenticated denial
   of these RPCs and rejection of a non-allowlisted owner before enabling cron.
2. Set server-only `SUPABASE_SERVICE_ROLE_KEY` and a random `CRON_SECRET` of at
   least 32 characters alongside the existing environment. The service role is
   privileged; keep it in server secret storage. The app pins the worker owner to
   `OWNER_ID`, never a request parameter. Do not use an owner refresh token.
3. Deploy and check that unauthenticated `/api/sync` requests return 401. Authorized
   POST runs due boards; authorized GET returns 200 only for a recent completed
   heartbeat without reported board errors, otherwise 503. Configure an independent
   uptime monitor for GET with the bearer header if unattended failure detection
   is needed. No outbound notification destination is configured by this app.
4. In Supabase Vault create `desk_sync_url` with the deployed HTTPS `/api/sync` URL
   and `desk_cron_secret` with the matching secret. Run
   `supabase/schedule-direct-feed.sql` to dispatch every minute. Existing leases
   prevent overlapping work; due times, batches and retries persist in the database.
5. Sign in, open Feed coverage, and choose **Set up employer watchlist**. Existing
   configurations and pause settings are retained. Review the collection scope of
   older boards: new presets enable broad technical/student titles, but setup does
   not overwrite older custom settings. Use **Check now** to verify each source.
6. Observe overnight/weekend operation for seven days. Verify last complete board
   checks, source failures, batch completion, retry recovery and heartbeat age.
   Five-/fifteen-minute intervals are targets, not proven publication latency.

The SQL migration is additive. To disable the schedule, run
`select cron.unschedule('desk-direct-feed');`; jobs and applications are retained.
To retire worker access, remove the server secrets and revoke worker RPC grants.
Do not remove database tables or rerun the initial migration.

Current limits: authoritative automatic closure is not implemented; failures never
close jobs. Only explicitly recognized pay/support wording is normalized. Remote
BC eligibility is conservative and still needs employer confirmation. Workday and
custom career pages remain manual imports. Complete market coverage, instant
publication detection and automatic affordability/visa determinations are not
claimed. Relocation scenario inputs are local UI state and reset between jobs.

## Required launch checks

Run typecheck, production build and `npm run test:browsing`. Then verify owner
isolation, persistence, source pause/disconnect, repeat ingestion, URL/text import,
resume fact review, applications, and backup/restore against a disposable private
test dataset. Complete desktop, phone and keyboard review in the authenticated
workspace. Keep unresolved checks recorded in build progress.
