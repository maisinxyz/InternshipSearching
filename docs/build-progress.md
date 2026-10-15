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
