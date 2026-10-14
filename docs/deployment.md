# Private workspace setup

This checkpoint builds locally, but is not production-ready. Scheduled collection,
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

## Scheduling is not configured

There is no `/api/sync` scheduled route or cron configuration yet. Manual refresh
processes bounded batches and is not an unattended runner. Do not configure
`SUPABASE_SYNC_REFRESH_TOKEN`: storing a rotating owner refresh token in static
hosting configuration is not a durable scheduling credential strategy. Resolve
owner-scoped machine authentication, continuation, deadlines, and crash recovery
before enabling unattended collection. Never expose a privileged key to clients.

## Required launch checks

Run typecheck, production build and `npm run test:browsing`. Then verify owner
isolation, persistence, source pause/disconnect, repeat ingestion, URL/text import,
resume fact review, applications, and backup/restore against a disposable private
test dataset. Complete desktop, phone and keyboard review in the authenticated
workspace. Keep unresolved checks recorded in build progress.
