# Temporary local open workspace — 2026-10-18

Local collection update (2026-10-20): `scripts/feed-watch.mjs` dispatches the
existing bearer-protected `/api/sync` endpoint every minute on loopback port 3001.
`workerRepository()` selects the local SQLite repository only under the existing
explicit local-access opt-in; hosted mode still requires its server credential.
No bearer secret reaches the client or a supplied remote URL. Due dates, source
and scheduler leases, bounded batches, retries and heartbeat records remain shared
with manual collection. Failed board runs make heartbeat health false. The worker
is a separate local process, not an installed login service or hosted scheduler.

Seven new reviewed presets cover Apera AI, Later, Cohere, Super.com, Harvey,
Geotab and Samsara. Ashby board identifiers accept dots without allowing paths,
queries or traversal. Nullable workplace type maps to unknown. Exact public ATS
API hosts accept bounded responses up to 8 MB; general imports retain 3 MB, with
unchanged DNS pinning, private-address rejection and redirect/deadline checks.

`LOCAL_OPEN_ACCESS=true` selects a shared local session and a SQLite-backed
repository in `.local/workspace.sqlite`. Both loopback servers share persisted
records, revision checks and leases. This does not use a privileged key or change
Supabase RLS; the original private workspace is separate. Vercel disables this
opt-in. Root/section pages and APIs use the same session switch; the login route
redirects to Jobs and the shell labels open local access. Disable the environment
flag to return to owner authentication. No deployment access change was made.

# Direct employer feed checkpoint — 2026-10-18

- `src/domain/collection.ts` owns validated listing contracts and source freshness;
  `opportunity.ts` owns evidence-based support extraction, geographic views and
  relocation arithmetic. The job schema keeps optional backward-compatible
  evidence, baseline and republication fields separate from original publication.
- `connectors.ts` collects Greenhouse, Lever, Ashby and GitHub. Each source saves
  a stable batch under its `sync` record before ingesting bounded chunks. Config
  changes invalidate that batch; failures retain progress and persist retry times.
- `scheduler.ts` and `/api/sync` provide owner-pinned scheduled work, bearer-secret
  validation, a persisted heartbeat and an authenticated monitor endpoint. Worker
  writes use service-role-only RPCs; normal browsing retains owner JWT/RLS access.
- Feed coverage replaces subscription/university setup. Old records and import
  compatibility remain. Jobs has explicit geographic/support and freshness views;
  periodic discovery notices do not reorder the current feed automatically.
- Deployment is deferred at the user's request. Apply the additive worker migration
  and activate Supabase Cron later using `docs/deployment.md`. No runtime cadence
  or deployed authorization verification is claimed by local tests.

# Current architecture — expanded implementation

The original Step 1 description below is historical. The current app includes
initial Steps 2–10 implementations, with provisioning and acceptance unfinished.

- `src/domain/` owns canonical job/workspace schemas, filtering, distance math,
  application-derived submission indicators, and LaTeX validation.
- `src/server/auth.ts` verifies the configured Supabase owner. The repository
  uses that user’s JWT against RLS-protected generic JSON records and revision RPCs.
- `src/server/connectors.ts`, `ingestion.ts`, and `imports.ts` keep external
  formats and normalization out of presentation components.
- `src/server/ai.ts` and `resume.ts` isolate Gemini and resume orchestration.
- `src/app/api/desk/[...path]/route.ts` exposes authenticated workflows.
- `src/features/workspace/` contains the five private destinations; reusable
  job cards/details and synthetic preview data remain under `src/features/jobs/`.
- `/preview` is public synthetic content. `/` displays setup until configured,
  then requires owner authentication. No actual resume is stored in the repo.

Application submission dates are authoritative for both filters and card badges;
legacy `state.applied_at` does not establish submission. Unclassified incoming
roles use `unknown`, rather than being assigned to software. Existing persisted
misclassifications are not silently rewritten. New resume rules preserve the
master’s original font size; historical rule versions remain unchanged.

Reviewed source presets are separate from adapter parsing in
`src/server/source-presets.ts`. Their authenticated setup workflow retains existing
source configuration. Source location classification lives in the domain layer;
collectors can explicitly select Canadian workplaces and student-role titles.
GitHub attribution is retained with snapshots and excluded from classification.
See [job-sources.md](job-sources.md) for configured boards and source limits.

`src/domain/account-sources.ts` describes account-source access and import opt-in
rules. `src/server/myexperience-import.ts` parses only selected pasted SFU job
fields; it does not access accounts. Import preview binds provenance to a stored
connector, and both preview/save recheck opt-in, pause, expiry and disconnect.
Provider authentication stays in the user's browser, outside the app. Intern
Insider uses employer URL import because automated subscription access is not
authorized by the reviewed provider terms. These are import workflows, not
authenticated database connectors.

Current limits: workspace bootstrap still loads all record kinds, server filtering
scans stored jobs, the new scheduled runner is not deployed, and
restore acceptance remains outstanding. The initial migration and owner RLS were
verified against the configured Supabase project.
See [deployment.md](deployment.md) and [NEXT-SESSION.md](NEXT-SESSION.md).

---

# Co-op Desk: Step 1

The scope is PRD sections 5–8 and 21, plus the Step 1 checklist in section 31.4. The original PRD remains at the repository root. This is a normal, independently runnable Next.js application.

## Boundaries

| Area                                 | Responsibility                                                                                  |
| ------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `src/app`                            | App Router entry points, metadata, shared design tokens and responsive styles                   |
| `src/domain/job.ts`                  | Zod canonical schemas and inferred TypeScript types; no UI or provider dependencies             |
| `src/features/jobs/data/fixtures.ts` | Synthetic role content, canonical records, initial sample user state and frozen visit watermark |
| `src/features/jobs/presentation.ts`  | Date basis, precision-aware labels, deterministic ordering, money and location labels           |
| `src/features/jobs/components`       | Jobs feed, local search/filter controls, cards and facts-first details                          |
| `src/components/ui`                  | Reusable Radix-backed sheet and company logo with initials fallback                             |

Data flows from authored fixture specs through Zod parsing into canonical jobs, then into feed/card/detail components. Cards never inspect an ATS payload. Related source, snapshot, location and evidence records are embedded in this read model; stable IDs preserve relationships for future persistence.

## Contract

All modeled records have `id`, `owner_id`, `created_at`, and `updated_at`. Job dates are distinct: `source_posted_at`, `source_updated_at`, `first_seen_at`, `last_seen_at`, and `content_changed_at`. Source date precision is either `day` or `instant`; a missing date is `null`. No publication time is fabricated. Source posting dates are used only when marked trustworthy; otherwise the feed uses first discovery. Sort keys use known dates, with a deterministic date-only bucket within a day and job ID as tie-breaker. Updates never reorder old postings as new discoveries.

Nullable salary, duration, term, start, deadline and arrangement facts remain explicit unknowns. Salary retains currency, interval, original wording and qualifications. Location retains the supplied text; fixture coordinates are unknown. No distances are presented. Remote eligibility is an independent nullable field.

Each job carries its sources and original snapshot sections, plus field evidence pointing to exact wording in a snapshot. Descriptions render through React text nodes, not raw HTML. A conflict retains each original source value. Corrections have a separate `JobOverride` schema; there is no editing or synchronization in this checkpoint.

`UserJobState` and `VisitState` are separate from job facts. Bookmarks, viewed state and the applied indicator are in-memory demonstrations. Reloading resets them. The visit watermark is frozen for the sample visit; viewing, scrolling and refreshing do not advance it. The initial baseline is not marked new. There is no durable history or authentication.

## UI decisions

The default view opens directly to Jobs. The five primary destinations are represented; later destinations are visibly disabled. Browse presets are immutable shortcuts, not saved-search CRUD. Search, province, discipline, term, arrangement, hide-applied and bookmark/new tabs operate on local fixtures. All terms and all Canadian provinces are initially included; no availability or precise origin is assumed.

The detail sheet leaves the feed mounted, locks background scrolling, and restores keyboard focus to the originating card without scrolling it into a different position. Mobile details fill the viewport. Navigation and filters use the same sheet primitive. Radix handles modal semantics, focus containment, Escape and outside dismissal. The footer lets reviewers inspect loading, empty and error examples.

The design uses off-white `#F6F8F7`, white `#FFFFFF`, ink `#233B34`, borders `#E1E8E4`, teal `#19796D` and soft teal `#EAF3EF`. Avenir Next headings fall back to Segoe UI; the body uses the system UI stack. Fonts, logos and icons require no third-party request at runtime. Compact practical fact rows and explicit date labels give the engineering roles their visual structure.

No database, API route, connector, ingestion pipeline, live job source, AI provider, resume tool, or application workspace is implemented. The application link is unavailable for synthetic vacancies; employer careers links are clearly labeled and never mark a job applied. It is a UI prototype, not a private production deployment.
