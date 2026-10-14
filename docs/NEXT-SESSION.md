# Resume here — 2026-10-13

## User direction

The original Step 1 scope was expanded to the rest of PRD.md. The user authorized creating hosting and a Supabase project because none exists. They then requested stopping for the day. Do not treat the current work as complete or deployed.

## Current checkpoint

- Step 1 Jobs preview remains at `/preview`.
- Added initial implementations for owner authentication, Supabase SQL migration and repositories, search/filter schemas and server distance filtering, connector adapters, imports, Gemini provider, resume studio, applications, follow-ups and settings.
- Five private workspace destinations now have screens. `/` shows setup until server environment is configured.
- **Latest TypeScript check passed**: `node node_modules/typescript/bin/tsc --noEmit`, exit 0, after the final source edits.
- The earlier Step 1 production build passed. No production build or full UI/integration verification has been completed for the expanded implementation.
- No Supabase project, migrations, Auth owner, Gemini key, scheduler or production deployment has been configured.
- No commits were made. Most implementation files remain untracked; existing README was already modified before work began.

## Start tomorrow

1. Review this file, PRD.md, and the new source. First finish/review implementation gaps below; do not deploy this checkpoint as production-ready.
2. Complete owner setup and provisioning. Vercel CLI is installed but reported no credentials. `vercel whoami` failed on sandbox DNS and cache/auth directory permissions. The failed attempt did not authenticate or deploy. Retry using the proper escalation flow when resuming; user sign-in will be needed. Supabase has no connected tool/CLI. Browser account setup was not completed; do not create paid resources without agreement.
3. Configure `.env.local` from `.env.example`, apply `supabase/migrations/202610130001_private_workspace.sql`, create the owner Auth account, insert its UUID into `desk_owners`, disable public signup, and configure deployment secrets.
4. Import the user's actual master privately, review facts and rules, then validate the full workflows. Do not put resume content or secrets in Git.
5. Finish production configuration, security review, deployment and acceptance verification. Update README/architecture/progress to describe the actual implementation and limits.

## Known work still required

- `src/app/api/sync/` is empty: implement scheduler authentication and route, Vercel cron config, and deployment instructions. `.env.example` currently proposes a refresh-token scheduler credential; resolve refresh-token rotation/durable credential handling before adopting it. No cron exists yet.
- `docs/deployment.md` is referenced by setup UI but has not been written.
- Source sync uses 30-job batches, a 120-second lease and persisted cursors. Review request-duration limits, crash recovery, cursor stability when upstream lists change, and batch continuation. A page-open refresh currently processes up to three sources sequentially. It is not a complete unattended task runner yet.
- Complete ATS-specific URL import recognition. Current imports use JSON-LD/readable text and optional Gemini. Check source parsing, evidence support (quotes alone do not prove normalized values), HTML handling, posted dates and SSRF/IP handling. GitHub parser was inspected against the real candidate README fetched to `/private/tmp/desk-source-readme.md`; reuse terms were not established, so the UI requires review before enabling.
- Normalization currently defaults an unclassified role to software; replace with an honest unknown/other classification. Expand pay/term extraction for deterministic source ingestion. Review update merging and evidence/conflict behavior.
- Server search has 40-record cursor responses, but bootstrap loads all records and filtering scans all stored jobs. Improve query/payload scaling. Job load-more uses `perform`, whose reload can reset the feed to the first page; fix that interaction.
- Applied-state filters currently read stored user state, while submission is stored on Application. Derive applied state consistently on the server. Job cards already derive the indicator from Application in the client.
- Geographic radius uses a selected coordinate origin and conservative precision rules, but there is no geocoder/cache or workplace-coordinate correction UI yet. Corrections have a schema but no full workflow.
- Resume rendering supports marked editable sections or existing balanced `resumeItem` blocks. Review group integrity/empty lists, section context, fact version handling, preservation checks and static validation. Auto extraction only imports bullets; skills, dates, headings and links still need reviewed fact-bank coverage. Do not assert claim integrity for externally edited drafts without review.
- Application AI drafts need stronger required-fact validation and a complete edit/version/follow-up integration review. Optional private PDF upload is not wired, though private bucket policies exist.
- Restore endpoint validates schemas and calls a transactional merge RPC, but reference/owner remapping, immutable version collisions, payload size and restore verification need review. SQL has not run against a real database.
- Expensive-operation rate limiting, mutation revision conflicts, session expiry, cancellation and concurrency need end-to-end review.
- Format the newly added files and run the final build. No new automated tests were added or run in this continuation. Follow current user/developer testing instructions.
- Inspect all new UI on desktop/phone and keyboard. Latest new screens have not had visual QA. The earlier preview had desktop focus restoration and narrow-phone static layout review.

## Resume supplied in chat

The user pasted the complete master LaTeX in this conversation. It has **11 pt**, not the PRD's assumed 10 pt. Preserve the actual supplied layout. The pasted source has a trailing `@` in its mailto target; flag/correct only in a reviewed version. The master includes nested custom `resumeItem` commands, multiple experience/project sections and education. It has NOT been saved to disk or uploaded; the complete source remains in conversation history. If continuing in a new thread, ask for the `.tex` file rather than reconstructing it from a summary. Personal contact data was not added to repository files.

## Main implementation locations

- `src/domain/`: canonical jobs, workspace schemas, filters/distance, LaTeX helpers.
- `src/server/`: auth, repository, safe fetch, connectors, ingestion, imports, Gemini and resume orchestration.
- `src/app/api/desk/[...path]/route.ts`: authenticated API workflows.
- `src/features/workspace/`: private shell, Jobs, Sources, Resume, Applications, Settings.
- `src/features/jobs/`: original card/detail components and fixtures, reused by the private feed.
- `supabase/migrations/`: owner allowlist, RLS records/revision RPC, leases, private bucket and restore RPC.

## Suggested next prompt

“Continue from docs/NEXT-SESSION.md. Finish the listed implementation gaps, set up Supabase and hosting with my sign-in where needed, then complete the remaining PRD acceptance work. Preserve the supplied 11 pt master resume and keep personal data out of Git.”
