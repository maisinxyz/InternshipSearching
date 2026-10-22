# Feed coverage and local background collection — 2026-10-20

- User clarified that finding more internships and keeping listings fresh is the
  priority. Added seven verified public employer presets: Apera AI, Later,
  Cohere, Super.com, Harvey, Geotab and Samsara. Setup retained all seven existing
  sources, names, settings and history. The local workspace now has 14 sources.
- Collected and verified 118 retained job records, with 113 visible technical
  roles and 18 Metro Vancouver matches (previous recorded baseline: 94 retained,
  91 visible, 13 Vancouver). These are current inventory/discovery counts, not
  claims that the employers published those roles today. Geotab and Super.com
  currently have no matching technical/student listings; monitoring is active.
- Activated `npm run feed:watch` against the local production server on port 3001. It dispatches authenticated due work every minute with the browser closed.
  Source intervals remain 5/15/60 minutes; leases/backoff/batches persist in SQLite.
  Observed multiple scheduler runs and recovery of the initial failed sources;
  final heartbeat healthy, all 14 source checks complete, no pending cursor/errors.
- Added local worker repository selection only under existing local opt-in;
  hosted mode retains credential requirements and bearer checks. Random local
  scheduler secret remains in ignored `.env.local`. No hosted deployment, remote
  migration, login service or outward notification was activated.
- Fixed nullable Ashby workplace values, dotted board identifiers, and bounded
  large public ATS responses (8 MB on exact API hosts, 3 MB for general imports).
  Preserved DNS pinning, private-network rejection, redirects and timeouts.
- Corrected the shared technical filter for spelled-out Machine Learning and
  Account Development sales titles. Adapter v4 forces a full recheck for prior
  ETags while preserving dates and user state; versions 1–3 remain readable.
  Reversibly hid only the two newly introduced Samsara sales roles. Refreshed
  Apera, Cohere and Samsara successfully with the corrected rules.
- Fixed local same-origin checks when Next normalizes an incoming loopback host;
  actual host/port must still match the origin. Missing, foreign and mismatched
  origins remain rejected; hosted validation is unchanged.
- Checks: final production build (including TypeScript), browsing/connector,
  direct-feed, local-access and account-source tests passed. Live pinned fetches
  passed for all 14 endpoints. Verified Jobs and APIs return 200, geographic feed
  counts, successful mutations from the 127.0.0.1 origin, retained hidden records,
  scheduler heartbeat and unauthorized scheduler GET/POST returning 401. Changed
  files formatted; `git diff --check` passed. Production server and worker left
  running on port 3001. Port 3000 belongs to another project and was untouched.
- Limits/checks omitted: no browser is available to automation, so visual,
  phone and keyboard acceptance remain unverified. No overnight/weekend pilot or
  publication-to-discovery latency measurement. The Mac, server and worker must
  stay running; sleep/shutdown stops collection. Automatic closed-role removal,
  universal employer coverage and hosted unattended operation remain pending.

# Internship board browsing checkpoint — 2026-10-20

- User requested continuing the app and recreating Intern Insider. Implemented
  the first browsing checkpoint using its public preview as a reference: compact
  list cards, list/grid controls, quick country/engineering/arrangement filters,
  visible save-search and clear-filter actions, and selected Saved/New controls.
- Reused existing canonical filters, saved searches, cards and detail Sheet.
  Multiple selections from advanced/saved searches remain visible in quick
  controls. Clear filters retains the chosen geographic view.
- Kept local persisted jobs, original dates/source wording, explicit unknowns,
  existing source integrations and application state. No new data collection,
  deployment, subscription access or AI capability was added. Original CSS is
  scoped to the live job board; synthetic preview presentation is unchanged.
- Recorded the public visual reference in `ui-components.md`; no third-party
  code or assets were adopted.
- Checks: direct TypeScript check and production build passed; browsing and
  direct-feed regression suites passed; changed TSX/CSS formatted;
  `git diff --check` passed. Build/startup initially paused without diagnostics
  and then completed (production compilation and dev startup about 3 minutes).
- Limits: Browser automation has no available browser in this session, so
  desktop/phone/keyboard visual acceptance is outstanding. This is a first
  browsing checkpoint, not feature or inventory parity with Intern Insider.
- Local startup diagnosis found port 3000 belongs to a different project
  (`vince-portfolio-preview-deps`, Next 15). Co-op Desk is running on port 3001;
  the other project was left running.

# Live local feed populated — 2026-10-18 (Vancouver time)

- Added all seven employer/community presets to the shared local workspace and
  completed their initial collection, including all three Astera batches.
- Stored 94 real source records. Default views expose 91 tech/engineering roles:
  13 Metro Vancouver, 1 explicitly Canada-remote, 46 relocation-support and 27
  relocation-needs-review matches (views can overlap for multi-location roles).
- Three newly collected finance/business-development/marketing roles were hidden
  using reversible state records; original jobs and descriptions were retained.
  Tightened the technical-title collection rule so those titles do not re-enter.
- Corrected a GitHub multi-location role's unsupported remote-Canada inference.
  Mixed Canadian offices plus unspecified remote work now remains unknown.
- All seven sources report completed checks, no pending cursor and no errors.
  Jobs use source snapshots, not fixtures. Data is shared by ports 3000 and 3001.
- Checks: connector and direct-feed behavioral regressions passed, production
  build/typecheck passed, persisted-store counts asserted, Vancouver jobs endpoint
  returned 200 on both servers. Restarted the production server with the fixes.
- Limits: did not repeat visual/phone/keyboard review; user approved appearance.
  Community rows can lack full descriptions and publication dates. No continuous
  scheduler was activated; existing page-open/manual refresh remains available.
  Newly imported inventory is a baseline, not a claim of publication today.

# Temporary local access without sign-in — 2026-10-18

- User requested removing login for now. Enabled `LOCAL_OPEN_ACCESS=true` in the
  ignored local environment. Both local servers open Jobs and all workspace
  sections without a cookie; `/login` redirects to `/` and sign-out is hidden.
- Local mode uses a separate shared SQLite workspace under ignored `.local/`.
  Changes survive reloads and process restarts, and both servers share leases and
  revision checks. No Supabase permissions or existing remote records changed.
  Returning the flag to false restores the existing owner-login workflow.
- Explicit local opt-in is disabled on Vercel. Same-origin mutation checks and
  scheduler bearer authentication remain in place. Anyone who can access this
  local mode shares the same local workspace, as requested.
- Checks: direct TypeScript check and production build passed; local storage and
  auth tests passed; direct-feed regressions passed. Live HTTP checks on 3000 and
  3001 verified root/coverage/workspace/jobs access without credentials, login
  redirects, hidden sign-out and rejection of mutation requests without an origin.
- Limits: visual/phone/keyboard review not rerun due prior native automation
  stalls. This local store is separate from the existing Supabase data; hosted
  backup restore still requires private mode. Local mode requires Node 22 with
  built-in SQLite. Deployment and unattended collection remain deferred.

# Direct employer feed implemented locally — 2026-10-18

User approved implementation, then explicitly chose **finish locally; deploy
later**. No deployment, database migration, secrets or schedule were activated.

Delivered:

- Feed coverage replaces subscription/university account setup. The idempotent
  watchlist includes Tenstorrent, Astera Labs, Moment Energy, Kepler, Waabi,
  1Password and the existing licensed GitHub list. Prior imported jobs and source
  configurations remain intact. Pause/edit/remove controls retain user history.
- Added Ashby public collection and Greenhouse original-publication mapping.
  Ashby last-publication is retained separately; GitHub addition dates no longer
  become employer posting dates. Broad tech/student collection scope is explicit.
- Saved source batches survive changing upstream order and interrupted writes.
  Source leases, bounded runs, persisted retry times, Retry-After handling and
  baseline-import flags support frequent collection without false new-job badges.
- Added the bearer-protected scheduled endpoint, owner-pinned worker repository,
  additive service-role-only RPC migration, heartbeat health endpoint and Vault
  cron activation script. Manual collection does not require these new credentials.
- Added Metro Vancouver, BC-remote, relocation-support and needs-review views;
  separate posted/discovered freshness filters; source freshness status; explicit
  sponsorship/housing/relocation wording; and a relocation cost comparison.
  New-job notices let the user refresh without automatically reordering the feed.
- Updated PRD direction, architecture and deployment handoff. Retained legacy
  import compatibility and all existing provenance/licensing notices.

Checks completed:

- `node node_modules/typescript/bin/tsc --noEmit`: passed.
- `npm run build`: passed after final runtime changes (Next.js 16.4.0).
- `node tests/direct-feed.cjs`: passed, including visibility/republication,
  geography, benefit denials and mixed clauses, unknown currency, budget math,
  baseline freshness, unauthorized GET/POST, stable batch continuation,
  interrupted-write recovery, pause, duplicates, saved-state retention and backoff.
- Existing connector/browsing and account-source regressions: passed.
- `node tests/connectors.cjs --live`: all seven public endpoints succeeded;
  Ashby returned parseable listed jobs. No private jobs were written by these tests.
- Fresh production server on port 3001: `/api/sync` returned 401 without a secret;
  `/sources` returned 307 to `/login` for a signed-out request.
- Touched implementation files formatted with Prettier; `git diff --check` passed.

Limits / checks omitted:

- Chrome automation repeatedly took 11–13 minutes per native action/read and
  reported an intervening user change. Authenticated desktop, phone and keyboard
  acceptance could not be completed. No successful visual review is claimed.
- The additive migration and machine-role authorization tests were not run against
  hosted Supabase; the user deferred deployment. Actual nightly/weekend collection,
  external health monitoring and a seven-day freshness pilot remain unverified.
- No automatic closure detection, custom Workday crawler, universal employer
  coverage, inferred visa eligibility or automatic city-cost data is implemented.
  Recognized pay/support extraction is conservative; unknowns need review.
- Relocation scenarios use user-entered amounts in one currency and reset between
  jobs. They do not infer taxes, exchange rates, assistance or personal eligibility.
- shortcut: bootstrap and job filtering still read owner records in memory;
  move to indexed database queries when measured board volume makes this slow.
- Five-/fifteen-minute intervals are targets, not publication-latency guarantees.
  Existing saved searches retain their filters; choose the new geographic view to
  browse broadly instead of an older discipline-specific default.

# Direct employer feed research — 2026-10-18

- User changed direction from Intern Insider/MyExperience connections to a
  frequently refreshed public employer feed, focused on Vancouver, eligible
  fully remote roles and justified Canadian/U.S. relocation opportunities.
- Added [research and proposed checkpoint](direct-job-feed-research.md), covering
  employer APIs, GitHub discovery, scheduling, honest freshness, source failures,
  sponsorship/relocation evidence and affordability/career evaluation.
- Checked official provider documentation and public employer examples. New API
  endpoint retrieval was unavailable through the research tool; continuous
  cadence, coverage and deployment are not verified. User authorization and term
  preferences remain to be confirmed.
- Research-only change: app/database/source configuration unchanged. Typecheck,
  production build and browsing acceptance omitted because no runtime flow changed.

# Coding-agent guidance — 2026-10-18

- Added project-level Ponytail guidance in a marked root `AGENTS.md` section,
  adapted from DietrichGebert/ponytail commit
  `09c434ab73ca43761c5d8b0c5d341926c2fba710`. Preserved the existing Co-op Desk
  requirements and generated Next.js block; retained the upstream MIT notice.
- Added [setup, mechanics, use case and limitations](ponytail.md), linked from
  README. This is the upstream-supported rules-file path; the full plugin,
  commands, lifecycle hooks and global settings were not installed.
- Application source, dependencies and PRD checkpoint scope are unchanged.

Checks:

- `node node_modules/typescript/bin/tsc --noEmit`: passed.
- Prettier check of the changed Markdown guidance/docs (excluding the retained
  third-party license text): passed. `git diff --check`: passed.
- `npm run typecheck` and `npm run build` stalled after their npm headers and were
  interrupted. Direct TypeScript invocation passed; direct
  `node node_modules/next/dist/bin/next build` also stalled without diagnostics and
  was interrupted. No successful production build is claimed for this change.
- Diff review confirmed no application/dependency changes and preserved the
  generated Next.js instructions. No browsing flow is affected by this
  instruction/documentation-only change, so no browser acceptance was rerun.
- Fresh-session instruction loading and model-behavior/savings benchmarks were
  not verified. Start a fresh Codex thread to check instruction loading; this
  session's edits do not demonstrate that a fresh host has loaded the new rules.

# Current status — resumed 2026-10-14

Expanded PRD implementation remains in progress; it is not deployed or accepted.

## SFU and Intern Insider account-source work — 2026-10-14

- Added opt-in import controls and official provider sign-in links, with
  pause/resume, expiry and disconnect retaining imported history.
- SFU owner sign-in and co-op posting access verified in Chrome. Inspected
  results and a selected detail; Print and saved-search alerts are present,
  while no export/feed was found in the inspected screens.
- Added selected-text SFU parsing with numeric posting identity and source
  provenance; exact term/location/duration evidence is retained, with unknown
  publication/start dates. Shared SFU session URLs cannot merge different jobs.
- Intern Insider's reviewed terms prohibit automated collection/API access
  without permission. Added a provider sign-in plus public employer URL import
  flow; no automated subscription connection is claimed.
- Server checks opt-in, pause/expiry and source deletion at preview and save.
  Changing import fields invalidates the old preview.
- Added public Greenhouse per-posting API import because the supplied employer
  webpage did not reliably expose title/company to generic JSON-LD extraction.
  Board metadata supplies the employer name; timezone-offset update dates are
  normalized as update instants, never publication dates.
- Typecheck, account-source and connector regressions, live employer preview and
  production build passed. Chrome saved one selected SFU firmware posting and the
  employer posting supplied by the user with Intern Insider provenance. Tested
  SFU opt-out blocking new imports and restored it afterward. Both enabled opt-ins
  survived reload. The final feed contains eight opportunities, including both
  new imports with their respective source labels. SFU detail verified numeric
  job ID, location, on-site arrangement, term/duration and original portal link;
  exact start/publication dates remain unknown.

No passwords or provider sessions are collected by the application. Automatic
database synchronization remains unavailable for both account sources.

## Job source connectors — 2026-10-14

Configured eight source entries through the authenticated workspace. Tenstorrent
(Greenhouse), Kepler Communications (Lever), and the MIT-licensed
`vanshb03/Summer2027-Internships` GitHub list completed live syncs, importing
4 + 1 + 1 Canadian student roles. SFU MyExperience, Intern Insider, Workday,
LinkedIn, and Other career sites are explicitly import-only. No unattended
scheduler is configured. Details and access/reuse evidence: [job-sources.md](job-sources.md).

- Added an idempotent starter-source workflow; existing equivalent sources,
  custom names and paused settings are retained.
- Added explicit Canadian-workplace and student-title collection scopes with
  backward-compatible defaults for existing source records.
- Fixed GitHub HTML application links and default-branch retrieval; yearless
  dates remain unknown. Retained MIT attribution with listing snapshots without
  allowing its wording to classify the role.
- Fixed pinned DNS lookup for Node's multi-address callback, full province names,
  separate employer workplaces and Lever's `onsite` arrangement value.
- Retained title-stated month/year and duration facts with exact evidence; no
  start day is inferred. Adapter v2 invalidates old ETags once for parser updates.
- Typecheck, connector regressions and production builds have passed during
  this checkpoint. Live protected-fetch checks passed for all three public APIs.
- Safari confirmed six opportunities. GitHub repeat refresh returned unchanged;
  pausing disabled its refresh and retained all six jobs. Google Chrome then
  verified resume and successful refreshes of all three collectors, with six
  distinct opportunities remaining. An immediate repeated refresh correctly hit
  the source lease; the prior refresh completed successfully.
- Kepler's real detail and application link were inspected in Chrome: on-site,
  January 2027 and four months, with no invented start day. Corrected the shared
  detail caption so live snapshots are no longer described as authored samples;
  the synthetic preview retains its sample label.

Limits: GitHub imports table summaries rather than full descriptions. There is
no automatic closure detection; larger multi-batch runs still need continuation
review. Additional GitHub candidates without established reuse permission were
not enabled. No subscription or university credentials were stored.

## Continuation: browsing correctness and provisioning

- Fixed Load more so it appends without triggering the global workspace reload.
  Responses from obsolete filter requests are ignored, and overlapping job IDs
  are deduplicated. Other workspace mutations can still refresh the first page.
- Server filters and cards now derive submission from the same application history
  helper, ignoring legacy bookmark applied state.
- Incoming unclassified roles use an explicit unknown discipline instead of software.
  Existing stored classifications are not migrated automatically.
- Default resume rules preserve the original master font size, including 11 pt.
  Historical rule versions are not overwritten.
- Added deployment instructions and removed the unused, unsafe static refresh-token
  scheduler configuration suggestion. Scheduling is still unimplemented.
- Formatted touched implementation files; added `npm run test:browsing`.
- Vercel CLI sign-in completed. The user created the Free Supabase project
  `co-op-desk` (`roeacpspffrjdanhfghr`, us-east-2); dashboard reported Healthy.
  Automatic table exposure was disabled before creation.
- Stopped the stalled local Next.js processes. Added explicit dynamic rendering
  to root and section pages to prevent a pre-configuration build from retaining
  the setup screen after environment configuration.

### Checks

- `npm run typecheck`: passed.
- `npm run build`: passed after final source changes.
- `npm run test:browsing`: passed (unknown classification/software exclusion,
  application-based applied filters, unrelated/unsubmitted application isolation,
  original font-size rule).
- `git diff --check`: passed before final documentation edits.
- Safari `/preview`: verified eight fixture roles, firmware preset reducing to four,
  detail sheet source facts, and Escape dismissal. Private authenticated pagination
  and phone layout have not been verified in this continuation.
- Updated production build passed with `/` and `/[section]` rendered dynamically.
- Fresh production server: root returned 307 to login, preview returned 200, and
  signed-out workspace API returned 401; all within 0.2 seconds.
- Development server restarted in 357 ms; login loaded in 216 ms.
- Owner sign-in verified in Safari at localhost:3000. Authenticated workspace,
  visit, starter-search writes and job queries completed successfully.
- Created four Canadian starter searches through Settings and selected the
  firmware search. After a server restart (366 ms startup) and browser reload,
  the session remained valid and all four searches were still present.

### Still required

The migration was applied successfully through SQL Editor on 2026-10-14.
Owner Auth account is created and allowlisted; public signup is disabled.
Ignored local environment is configured with the public API key and owner UUID.
Database role checks passed for owner read/write, non-owner read/write isolation
and anonymous permission denial. The initial role-test writes were rolled back.
The workspace now contains four starter searches, visit state, eight source jobs,
eight source entries and one owner. Storage bucket is private. Local owner sign-in and saved-search
persistence are verified. No deployment, Gemini configuration or actual resume
import is claimed.
Earlier startup timeouts cleared after stopping the stalled processes and restarting.
The updated production build, signed-out routes, authenticated workspace and
saved-search persistence are verified. Job imports, live connectors, bookmarks,
applications, resume generation and restoration still need acceptance checks.
Production configuration/deployment still needs completion. Remaining
implementation gaps are tracked in NEXT-SESSION.

---

# Historical status — paused by user, 2026-10-13

Scope expanded beyond Step 1. Steps 2–10 now have initial code, but integrations and deployment are **not complete**. Latest TypeScript check passed after the expanded implementation. No new production build or integration verification has been completed. Resume at [NEXT-SESSION.md](NEXT-SESSION.md), which records setup blockers and known implementation gaps.

The Step 1 report below is historical and does not describe the current expanded architecture.

# Build progress

## Step 1 — Visual Jobs feed and details

Implemented from PRD sections 5–8 and 21, including the Step 1 checklist. The repository initially contained only the root PRD and README, so the minimum Next.js/TypeScript scaffold and local commands were added to make the requested UI runnable. The existing PRD stays at its original path.

### Delivered

- Five-destination navigation with later destinations disabled, responsive mobile navigation, and immutable browse presets.
- Content-rich, newest-first job cards with dates and their basis, company logos or intentional initials, technologies, pay, term, duration, source labels and sample saved/applied indicators.
- Working fixture search, discipline/province/term quick filters, arrangement and hide-applied options, saved and new views.
- Facts-first detail sheet, required/preferred qualifications, exact sample evidence excerpts, full original descriptions, explicit unknowns, retained conflicts and separate date provenance.
- Zod canonical contracts with owner scope, timestamps, source precision, snapshots, evidence, nullable facts, separate user state and correction schema.
- Eight synthetic roles covering software, firmware and electrical engineering, overlapping disciplines, missing pay/term/arrangement, long title, multiple sources, a duration conflict and an older updated posting.
- Local SVG brand assets, fallback on missing or failed logos, no external font dependency.
- Loading, empty and error examples selectable from the feed footer.
- Component, license and architecture documentation.

### Verification

In progress: typecheck, production build, formatting, and desktop/phone/keyboard review. Final results will replace this line.

### Limits

All job text and values are synthetic; this is not a source of real vacancies. Local UI state resets on reload. The frozen sample visit watermark demonstrates New without storing visit history. Refresh never contacts an upstream job source. Resume/preparation/application links are unavailable; employer careers links are clearly separate. Sample applied state is a visual demonstration, not an application record.

No database, authentication, live connector, AI integration, saved-search CRUD, geographic radius, durable history or ingestion exists. Those belong to later checkpoints. This step is ready for browsing-design review once the listed checks are complete; user approval has not been assumed.

### Next checkpoint

Review the browsing UI, then request Step 2 to add persistence and owner-only access while preserving the canonical contract and approved design. No later checkpoint has been started.
