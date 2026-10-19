# Latest direction — 2026-10-18

The user approved the direct employer feed and explicitly requested **finish
locally; deploy later**. See `docs/build-progress.md` for checks and
`docs/deployment.md` for activation. Do not resume SFU/Intern Insider connection
work. Public collectors, feed coverage, scheduling code and geographic/relocation
views are implemented locally. The additive SQL migration, server scheduler
secrets, cron activation, deployment and multi-day pilot remain pending.

# Latest continuation — 2026-10-14

See the current section of build-progress.md. Browsing fixes, original font-size
rules, a deployment guide, and focused regression checks are now implemented.
Typecheck and production build passed. Vercel CLI is authenticated. The user
created the Free Supabase project co-op-desk, ref `roeacpspffrjdanhfghr`, region
us-east-2. The initial migration was applied successfully through SQL Editor in a transaction.
Owner Auth exists and is allowlisted. Public signup is disabled.
Ignored .env.local is configured with project URL, public API key and owner UUID.
Database role tests passed for owner write/read, non-owner read/write isolation
and anonymous permissions; test writes were rolled back. Private bucket verified.
No deployment exists.

Source setup continuation: eight entries are configured. Tenstorrent/Greenhouse
imported four Canadian student roles; Kepler/Lever one; the MIT-licensed
Summer2027 GitHub table one. The other five entries are import-only. See
[job-sources.md](job-sources.md) and current build progress for changes/checks.
The GitHub pause/resume test is complete and the source is connected again.
Final checks used Google Chrome at the user's request. All three live sources
refreshed successfully, and the feed retained six distinct jobs. Kepler's detail
shows on-site, January 2027 and four months with its real Lever application link.
Use Chrome for further UI checks; the user is using Safari independently.

Account-source continuation: SFU and Intern Insider now have opt-in source import
controls and provider sign-in links. The user signed in directly on both sites.
SFU co-op posting access was verified, but no export/feed was found in inspected
screens. A selected SFU firmware role and the user-supplied employer posting from
Intern Insider were saved privately with source provenance. Intern Insider's
reviewed terms prohibit automated collection without permission, so only employer
URL import is implemented. Neither source has authenticated database syncing;
credentials/cookies are not exported to the app. See job-sources.md and the latest
build-progress section for checks and limits.

The runtime is responsive after stopping the stalled processes and restarting.
Explicit dynamic rendering was added to `/` and `/[section]` so a build made
before environment configuration cannot retain the setup screen. The updated
production build passed. A fresh production server on port 3001 returned a
307 login redirect at `/`, 200 at `/preview`, and 401 at the signed-out workspace
API; each response completed within 0.2 seconds. Development startup on port
3000 then completed in 357 ms and `/login` loaded in 216 ms.

Owner sign-in is verified in Safari at `http://localhost:3000/`. Created the four
Canadian starter searches through Settings and selected the firmware search.
After restarting the development server and reloading the browser, the owner
session remained valid and all four searches were still present. Authenticated
workspace, visit, search-write and job-query workflows completed successfully.

After completing source verification, the next step is job bookmarking/application
persistence and broader URL import acceptance. Eight private jobs are now stored
from three live collectors and two opt-in account-source import workflows.
Resume import, Gemini, scheduling, restore, full UI
acceptance and hosting deployment remain outstanding. Local dev runs on port
3000; the built production server is also running on port 3001.
Do not recreate the project or rerun the initial migration.

Resolved from the older notes: Load more no longer invokes perform/reload; applied
filters now use application history; new unclassified roles are unknown; deployment
instructions exist; default rules no longer force 10 pt. Existing stored rows/rules
are not rewritten. Other gaps below remain, including bootstrap scaling, scheduler,
source cursor stability, restore review, resume validation and full UI QA.

The older handoff below is retained for scope and outstanding details. Its claims
that no Supabase project exists and no production build ran are superseded above.

---

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
