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

Current limits: workspace bootstrap still loads all record kinds, server filtering
scans stored jobs, sync uses partial batches without a scheduled runner, and the
migration/restore workflows have not been verified against a live project.
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
