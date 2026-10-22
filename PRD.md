# PRD — Personal Co-op & Internship Dashboard

## Feed expansion checkpoint — 2026-10-20

The user prioritized finding more internships and keeping listings fresh when
asking to recreate Intern Insider. Expand the reviewed public-employer watchlist
and activate a local background poller using the existing due-work, leases,
backoff, baseline and heartbeat contracts. Keep the existing local workspace and
source history. The browser may close; collection still requires the Mac, server
and worker to remain running. Hosted deployment remains deferred. Do not claim
Intern Insider's inventory, universal coverage or real-time publication latency.
Retain the completed compact browsing changes from the initial reference pass.

## Active checkpoint amendment — 2026-10-18

The user authorized implementing the direct employer feed researched in
[docs/direct-job-feed-research.md](docs/direct-job-feed-research.md), then explicitly
requested finishing locally and deploying later. This supersedes the
connection-first workflow and daily-only scheduling baseline below. The current
checkpoint adds public Greenhouse/Lever/Ashby collection, stable batches,
scheduler support, Vancouver/BC-remote/relocation views, source evidence and
an editable relocation comparison. Retain historical jobs and user state.
Subscription and SFU accounts are no longer part of feed setup. Actual unattended
collection, hosted database migration and a multi-day pilot remain deployment work.

Version: 1.0
Owner / primary user: Vince Ong
Working name: Co-op Desk
Planning date: October 13, 2026

Deliverable: A private web application that Vince can develop incrementally in VS Code with Codex and deploy to Vercel or another suitable host.

Default timezone: America/Vancouver.

## Build map

This document describes the complete product. It is not an instruction to implement everything in one pass.

Build one checkpoint at a time using the guide in Section 31.

| Module                             | Specification sections | Build checkpoints    |
| ---------------------------------- | ---------------------- | -------------------- |
| A. Scope and personal context      | 1–4                    | Reference throughout |
| B. Browsing, filtering, and design | 5–10                   | 1–3                  |
| C. Sources and ingestion           | 11–14                  | 4–6, 10              |
| D. AI and application preparation  | 15–18                  | 6–9                  |
| E. Tracking and follow-ups         | 19                     | 9–10                 |
| F. Architecture and reliability    | 20–25                  | 0, 2–6, 11           |
| G. Acceptance and delivery         | 26–30                  | Each checkpoint      |
| H. Incremental Codex build guide   | 31                     | 0–11                 |

# Module A — Product scope and context

## 1. Product vision

Build a personal website that collects relevant co-op and internship opportunities into one attractive, newest-first job feed.

Vince should be able to open the website daily, choose a saved search, review recent jobs, see important details immediately, tailor a one-page LaTeX resume, prepare application material, and record what he applied to.

The website is exclusively for personal use. Prioritize:

- Useful daily browsing.
- Precise, reusable filters.
- Polished existing UI components.
- Honest, source-grounded job details.
- Removable connectors.
- Reliable persistent storage.
- Simple application preparation.
- Maintainable architecture.

Discovery must work without AI. Gemini enhances extraction and application preparation, but an unavailable API must not prevent browsing existing jobs.

## 2. Approved scope and exclusions

### Approved features

1. Independently configurable source connectors.
2. Saved searches with precise filters.
3. Visual job feed ordered newest to oldest.
4. Job details with important facts shown first.
5. Practical geographic filtering.
6. Gemini-powered resume tailoring.
7. Complete LaTeX output for Overleaf.
8. Application preparation workspace.
9. Compact application tracker and follow-ups.
10. Quick manual imports from URLs or pasted descriptions.
11. Manual ChatGPT Plus handoff.
12. Private, independently deployable application.

### Explicit exclusions

- No personal fit scores or match percentages.
- No AI ranking that changes chronological order.
- No automatic rejection based on Vince’s resume or year of study.
- No alert digest.
- No source-health dashboard.
- No AI spending dashboard.
- No complicated recruiter CRM.
- No automatic email sending.
- No automatic application submission in the initial release.
- No required AI-generated PDF export.
- No required Overleaf API integration.
- No public accounts, billing, or social features.

Basic inline errors, connection states, bounded retries, and in-app follow-up reminders remain necessary.

Do not promise automatic access to a source before verifying its supported integration method.

## 3. Personal profile and resume context

Vince is a second-year SFU Mechatronic Systems Engineering student interested in:

- Software engineering.
- C++ development.
- Embedded systems.
- Firmware.
- Electrical and electronics engineering.
- Robotics.
- Controls.
- Hardware testing.
- Mechatronics.
- Industrial automation.

The resume reviewed for planning is `Vince_Ong_Resume_Final.tex`.

It lists:

- SFU B.A.Sc. in Mechatronic Systems Engineering.
- Expected graduation: June 2029.
- C, C++, Python, MATLAB, and Rust.
- ESP32, ARM, Raspberry Pi, ROS 2, Linux, EEPROM, and PID.
- Circuitry, PCB design, Altium, EAGLE, Fusion 360, and electronic test equipment.
- Git/GitHub, Docker, OpenCV, unit testing, and QA.
- SFU Racerbot firmware development involving F1TENTH, ROS 2, LiDAR safety systems, and simulation/hardware testing.
- Software engineering internship experience at Resilient Privacy.
- Online data analysis experience at TELUS Digital AI.
- Embedded Circadian Telemetry System project.
- Automatic Spice Dispenser project.
- Autonomous Ground Vehicle project.

These are resume-listed facts, not independently verified achievements.

During setup, Vince must review imported facts and confirm which may be used in generated applications. Existing metrics must remain unchanged unless Vince edits them.

Do not commit personal contact information, GPA, addresses, or actual application documents to a public repository.

### Unconfirmed preferences

Keep these editable:

- Target work terms.
- Four-, eight-, or twelve-month availability.
- Relocation willingness.
- Exact geographic origin.
- Work authorization.
- Minimum pay.
- SFU co-op eligibility.

Default to Canadian internship/co-op/student jobs.

Offer Surrey, BC, as the initial geographic preset. Request a postal code or map point before presenting precise origin-based distances.

Do not assume a particular work term.

## 4. Core workflows

### Daily browsing and application

1. Open the private dashboard.
2. Select a saved search.
3. Review the newest jobs.
4. Open a job.
5. Read responsibilities, technologies, pay, duration, term, and location.
6. Read the complete description if interested.
7. Tailor the resume.
8. Review generated content and changes.
9. Copy the complete LaTeX into Overleaf.
10. Compile and inspect the final resume.
11. Prepare additional answers or a cover letter.
12. Open the employer application page.
13. Submit through the employer’s website.
14. Mark the application Applied.

Opening an employer link must not mark an application submitted.

### Quick import

1. Click Add job.
2. Paste a job URL.
3. Retrieve accessible content.
4. Extract structured fields.
5. Show a concise preview.
6. Confirm and save.

If content is unavailable, offer pasted-description import in the same dialog.

### Disconnecting a subscription source

1. Open Sources.
2. Disable or disconnect Intern Insider.
3. Stop future collection.
4. Preserve existing jobs, notes, applications, and documents.
5. Continue using other sources without editing code.

# Module B — Browsing, filters, and visual design

## 5. Information architecture

Use five primary destinations:

| Destination  | Purpose                                          |
| ------------ | ------------------------------------------------ |
| Jobs         | Feed, saved searches, filters, job details       |
| Applications | Compact application history and follow-ups       |
| Sources      | Configure, refresh, pause, disconnect connectors |
| Resume       | Master template, approved facts, tailoring rules |
| Settings     | Profile, Gemini configuration, location, exports |

Saved searches should appear in the Jobs sidebar or equivalent navigation.

The application workspace belongs to an individual job and opens from Jobs or Applications.

## 6. Visual design

### Direction

Create a polished personal workspace:

- Neutral off-white background.
- Dark, readable text.
- Subtle borders.
- One restrained teal or blue accent.
- Comfortable typography and spacing.
- Real company logos.
- Clear information hierarchy.
- Content-rich cards with limited badges.
- Light theme initially; dark theme optional.

The first screen after login should contain jobs.

Avoid:

- Marketing landing pages.
- Oversized hero sections.
- Decorative AI imagery.
- Excessive gradients.
- Unnecessary animation.
- Dense walls of badges.

### Existing components

Use inspected components rather than inventing every UI element.

Suggested foundations:

- shadcn/ui for forms, dialogs, sheets, menus, tabs, tables, and tooltips.
- Suitable 21st.dev components for navigation, search, cards, or interactions.
- Lucide or another consistent icon library.
- A maintained code editor for LaTeX if useful.

Inspect each component for quality, authorship, accessibility, dependencies, and license. Catalog membership alone does not guarantee these.

Document selections in `docs/ui-components.md`:

- Original component URL.
- License.
- Dependencies.
- Modifications.
- Attribution requirements.

Use permitted component code. Do not copy marketplace demo images or preview assets.

Adapt components to one design system. Avoid incompatible visual styles.

The deployed site must not require a UI-service subscription at runtime.

### Desktop layout

- Narrow left sidebar.
- Main feed with saved-search title.
- Search bar and filter chips.
- Refresh control.
- One or two columns of generous cards.
- Job detail sheet or dedicated detail page.
- Preserve feed position when details close.

### Mobile layout

- Single-column feed.
- Compact navigation.
- Filters in a sheet.
- Full-screen job details.
- No horizontal scrolling.
- Accessible copy/download controls.

### Logos

Use source-provided or verified employer logos where available.

Requirements:

- Graceful fallback to company initials.
- Appropriate alt text.
- Stable sizing.
- No generated fake logos.
- No ambiguous name-only logo matching.
- No stock imagery added simply to fill space.

## 7. Job feed

### Card content

Show:

- Company logo and name.
- Exact title.
- Location or explicitly stated remote arrangement.
- Posted date when known.
- Clearly labeled discovery date otherwise.
- Salary, currency, and pay period when stated.
- Work term/start date.
- Duration.
- A few important technologies or disciplines.
- Source badges.
- Saved/applied state.
- Bookmark control.

Unknown optional values may be omitted on cards. Detail views should show `Not stated`.

### Chronological ordering

Default: newest to oldest.

Store separately:

- `source_posted_at`
- `source_updated_at`
- `first_seen_at`
- `last_seen_at`
- `content_changed_at`

Use a trustworthy original posting date when available; otherwise use first discovery.

Label the date basis.

Do not treat an ATS `updated_at` field as a publication date.

Use stable cursor pagination and a deterministic tie-breaker.

Date-only sources need a precision marker. Do not invent posting times.

### New since last visit

Store a previous-visit watermark.

- Newly discovered jobs after that watermark may be marked New.
- Initial bulk import is a baseline.
- Do not mark all old imported jobs as new.
- Scrolling or clicking a job must not reset the watermark.
- Capture the watermark at visit start.

Optional controls:

- New since last visit.
- Hide applied.
- Hide confirmed closed.

If jobs arrive while scrolling, show a small New jobs available control instead of moving the current position.

### Updates and duplicates

- Updates must not create new cards.
- Preserve original discovery date.
- Merge reliable duplicates while retaining every source.
- Do not merge distinct requisitions merely because titles match.
- Different work terms may represent different roles.

## 8. Job details: important facts first

Show before the full description:

1. Role and company.
2. What the role involves.
3. Technologies, tools, and engineering areas.
4. What the employer is looking for.
5. Pay.
6. Duration.
7. Start date, work term, or date range.
8. Location and work arrangement.
9. Deadline, if stated.

The first four items help Vince assess the opportunity himself. They are employer-grounded facts, not personal fit analysis.

Requirements:

- Preserve the title exactly.
- Support extracted highlights with evidence snippets.
- Allow inspection of original wording.
- Distinguish required and preferred qualifications.
- Preserve salary qualifications, currency, and interval.
- Preserve year-of-study and authorization requirements.
- Do not automatically exclude Vince.
- Display `Not stated` for missing important facts.
- Surface conflicting source values.
- Preserve original description headings and lists.
- Keep original posting and application links visible.

Actions:

- Save.
- Tailor resume.
- Prepare application.
- Open application.
- Mark applied.

Store user corrections separately so future syncs cannot overwrite them.

## 9. Saved searches

Allow users to:

- Create.
- Duplicate.
- Rename.
- Edit.
- Delete.
- Choose a default.

### Filters

- Country.
- Province.
- City.
- Radius around a postal code or map point.
- On-site/hybrid/remote/unknown.
- Remote explicitly open to Canada.
- Multiple disciplines.
- Include/exclude keywords.
- Exact phrases.
- User-selected technologies.
- Internship/co-op/student.
- Optional new-grad jobs.
- Work term/start date.
- Duration.
- Minimum pay.
- Include unknown pay.
- Company.
- Source.
- Saved/applied/hidden/new state.

### Semantics

- OR within one dimension.
- AND across dimensions.
- Keyword modes: any, all, exact phrase.
- Explicit policies for unknown pay, term, and location.
- No assumption that unspecified remote jobs accept Canadian applicants.
- No implicit filters derived from resume eligibility.

### Editable starter searches

- Software/C++ internships — Canada.
- Embedded/firmware co-ops — Canada.
- Electrical/electronics co-ops — BC.
- Robotics/controls — Canada.
- Engineering internships — within 20 km of selected Surrey origin.

Disciplines may overlap:

- Software.
- Embedded.
- Firmware.
- Electrical.
- Electronics.
- Robotics.
- Controls.
- Hardware.
- Mechatronics.
- Mechanical.
- QA/test.
- Manufacturing/automation.

Use deterministic categorization first. Gemini may assist extraction, but labels must not become personal fit assessments.

## 10. Geographic filtering

Store every stated job location separately.

Retain the original employer location text.

Use coordinates and server-side distance calculations. PostGIS is an implementation option.

A multi-location role matches when at least one relevant workplace falls within the radius.

Rules:

- Label distance as straight-line distance.
- Store precision: exact address, postal-code approximation, or city centroid.
- Never present centroid distances as exact.
- Strict radius searches should exclude imprecise/unknown locations by default.
- Offer Include approximate locations.
- Treat remote eligibility separately from radius.
- Do not assume headquarters is the workplace.
- Cache geocoding.
- Geocode changed/new locations only.
- Keep the geocoding provider replaceable.

Maps and commute estimates are optional later additions.

# Module C — Sources and ingestion

## 11. Connector architecture

A connector consists of a trusted adapter and editable configuration.

Keep source parsing out of dashboard components.

Each connector contains:

- Stable type ID.
- Adapter version.
- Name and description.
- Icon.
- Supported capabilities.
- Configuration schema.
- Authentication mode.
- Source configuration.
- Enabled state.
- Optional subscription expiration.
- Last successful sync.
- Minimal inline status.
- Parser version.
- Resumable cursor.
- Normalization logic.

Support multiple instances, such as several repositories or employer boards.

Configuration belongs in the database.

Enabling, disabling, or editing an existing adapter must not require code changes.

Adding a new adapter may require a deployment. Do not imply arbitrary plugins can be installed without implementing an adapter.

Do not download and execute untrusted plugin code.

### Conceptual interface

- `validateConfig`
- `checkConnection`
- `listJobs`
- `getJobDetails`, where supported
- `normalize`
- `disconnect`

Capabilities should distinguish:

- Scheduled collection.
- URL import.
- Text import.
- Authenticated access.
- Full-description retrieval.
- Closure detection.

### States

- Connected.
- Import only.
- Paused.
- Needs sign-in.
- Unavailable.

Show honest capabilities and actionable inline errors.

Disconnect removes credentials and stops future work while preserving existing records.

Pause retains configuration.

Optional subscription expiry may pause collection automatically.

## 12. Initial sources

| Source              | Approach                                               | Limit                                        |
| ------------------- | ------------------------------------------------------ | -------------------------------------------- |
| GitHub repositories | Configurable content API adapter                       | Formats vary; descriptions may be incomplete |
| Greenhouse          | Public Job Board GET endpoints                         | Requires configured employer boards          |
| Lever               | Public postings endpoints                              | Requires configured employer sites           |
| SFU MyExperience    | Supported import first; investigate export/feed/access | Login and access rules require verification  |
| Intern Insider      | Optional supported feed/export integration             | No public API verified for this PRD          |
| Workday             | Individual public URL import where accessible          | Tenant-specific behavior varies              |
| LinkedIn            | URL plus pasted description initially                  | Automatic access not promised                |
| Other career sites  | Public URL/text import                                 | Some pages require login/rendering           |

Greenhouse and Lever are employer-specific sources, not global search engines. Maintain an editable list of employer boards.

### GitHub candidates

Inspect before enabling:

- `negarprh/Canadian-Tech-Internships-2027`
- `vanshb03/Summer2027-Internships`
- `speedyapply/2027-SWE-College-Jobs`

Verify current:

- Structure.
- Geographic coverage.
- Activity.
- Reuse terms.
- Application links.

Do not hard-code the year into the adapter.

Retain upstream identity or canonical employer links.

### Additional discovery candidates

- Direct Canadian engineering employers.
- Government student programs.
- BC utilities.
- Public-sector engineering employers.
- Electronics companies.
- Robotics companies.
- Industrial automation employers.
- Job Bank and student job boards.

Treat these as future adapters or manual import candidates until access is verified.

Do not claim complete Canadian internship coverage.

### Restricted sources

Deliver configurable MyExperience and Intern Insider entries with import fallback even if automatic collection is unresolved.

The UI must distinguish import-only from automatic collection.

A stored URL or login button is not a completed integration.

An optional local browser capture tool may be explored later:

- User initiated.
- Selected job content only.
- No exported session cookies.
- Source access rules verified.
- Hosted application works without it.

## 13. Synchronization

Required:

- Scheduled collection while the browser is closed.
- Manual Refresh.
- Debounced refresh-on-open when stale.
- Connector isolation.
- Persistent progress.
- Idempotent ingestion.
- Bounded retries and backoff.
- Cancellation checks after disconnect.

Do not run an unbounded crawl during page rendering.

Use:

- Conditional requests.
- Checkpoints.
- Deterministic parsers.
- Bounded detail retrieval.
- Lazy retrieval where appropriate.

### Closure

Mark closure only from reliable evidence:

- Explicit closure.
- Employer response.
- Complete authoritative listing under a documented absence policy.

A failed sync or disappearance from a community repository is not sufficient evidence.

### Hosting

Vercel Hobby currently supports daily cron execution.

Baseline:

- Daily scheduled sync.
- Manual refresh.
- Refresh-on-open.

Frequent unattended collection requires an appropriate scheduler/plan and possibly a queue or worker.

Long crawling, browser rendering, and LaTeX compilation should not be assumed to fit ordinary web requests.

## 14. Manual imports

Accept:

- Public URL.
- Pasted description.
- Optional company/title override.

### Pipeline

1. Validate URL.
2. Recognize existing job or ATS format.
3. Retrieve accessible content server-side.
4. Prefer source API or JobPosting structured data.
5. Extract readable text.
6. Use Gemini where needed.
7. Validate structured output.
8. Attach evidence and provenance.
9. Show concise preview.
10. Save after confirmation.

Gemini must not invent a description from a URL.

Normal import should require a URL and one confirmation.

Request additional fields only when essential information is missing.

### Failure handling

For login walls, blocked pages, JavaScript-only pages, invalid output, or timeouts:

- Explain briefly.
- Offer pasted description.
- Preserve entered URL.
- Do not fabricate a complete posting.

Imported jobs receive normal feed, search, tailoring, and tracking features.

Targets:

- Normal public imports usually finish within 15 seconds.
- Show progress.
- Avoid indefinite spinners.
- Permit retry.
- Deduplicate repeated imports.

# Module D — AI and application preparation

## 15. Gemini integration

Use Gemini first.

Requirements:

- Server-side API key.
- Configurable supported model.
- Provider abstraction.
- Independent schema validation.
- Recoverable failures.
- No API key in browser code.

Separate operations:

- Job extraction.
- Resume fact import.
- Resume tailoring.
- Cover letter drafting.
- Application answers.
- Follow-up drafting.

Do not show unimplemented providers as functioning options.

### Invocation policy

Run AI:

- For new/changed imported descriptions.
- When Vince requests tailoring.
- When Vince requests application material.

Do not run AI:

- On every feed render.
- On every unchanged job.
- To tailor every collected job automatically.

### Output integrity

Use structured extraction.

Schema-valid output may still be factually wrong. Require evidence and honest unknown handling.

Handle:

- Missing key.
- Quota errors.
- Unsupported model.
- Invalid JSON.
- Timeouts.

Browsing must remain functional.

Review current provider data-handling terms during setup.

Minimize prompt data. Contact information can be inserted locally into the resume template.

Never send source credentials or API secrets to the model.

## 16. ChatGPT Plus handoff

ChatGPT subscription billing and API billing are separate.

Do not assume Plus provides API credits or programmatic website access.

Implement:

- Copy tailoring prompt.
- Download prompt as text.
- Open ChatGPT in another tab.
- Paste returned LaTeX into the workspace.
- Save as externally generated draft.

The prompt contains:

- Job description.
- Approved facts.
- Template instructions.
- Tailoring rules.

It may omit personal contact details.

Do not call this automatic sending.

Do not depend on:

- Scraping ChatGPT.
- Reverse-engineered endpoints.
- Session cookies.
- Login-bot bridges.

Future official integrations can be considered independently.

## 17. Resume tailoring

### Master assets

Store privately:

- Master `.tex`.
- Approved facts.
- Optional reference PDF.
- Preferred section order.
- Tailoring instructions.
- Formatting constraints.
- Version history.

Do not modify the master automatically.

Each draft references:

- Master template version.
- Facts version.
- Rules version.
- Job snapshot.

Support an experience bank containing additional approved material.

### Generation approach

Prefer:

1. Generate structured tailored content.
2. Render through the trusted LaTeX template.

Do not allow unrestricted rewriting of:

- Preamble.
- Geometry.
- Commands.
- Contact block.
- Packages.

### Deliverable

One complete standalone `.tex` document.

Controls:

- Copy complete LaTeX.
- Download `.tex`.
- Edit.
- View content changes.
- Restore version.
- Regenerate selected content where practical.

Overleaf is the intended final compilation workflow.

### Default rules

1. Exactly one page after compilation.
2. Preserve approved layout.
3. Maintain readable spacing.
4. Use the master’s 10 pt baseline unless changed by Vince.
5. Shorten lower-value content before reducing font or margins.
6. No decorative borders, photos, graphic skill meters, or unnecessary columns.
7. Emphasize relevant supported technologies.
8. Use employer keywords naturally.
9. No invented experience, skills, metrics, dates, or certifications.
10. No unsupported expertise claims.
11. Preserve approved names and numbers.
12. Correct spelling and grammar.
13. Keep Vince’s direct writing style.
14. Use concise action-led bullets.
15. Avoid filler and repeated keywords.
16. Normally zero or one short bold phrase per bullet.
17. Do not bold whole bullet sentences.
18. Preserve functioning links.
19. Escape LaTeX characters.
20. Do not introduce unfamiliar packages without review.
21. Check compiled text order.
22. Put unsupported requested keywords in the change summary, not the resume.
23. Version future user preferences.

Fact integrity is mandatory even when styling preferences change.

### Validation

Static checks:

- Complete document boundaries.
- Expected commands.
- Escaping.
- Balanced expected structures.
- Disallowed command/package changes.
- Unexpected contact/name/date changes.
- Unsupported claims.
- Excessive bolding.
- Obvious spelling problems.

### One-page verification

Only compilation verifies page count.

Word count does not establish that a document is one page.

Initial implementation:

- Return complete `.tex`.
- Show `Page count unverified — compile in Overleaf`.
- Allow Vince to record compilation result.

Optional local/worker validation:

- Disable shell escape.
- No network access.
- Bounded execution.
- Approved packages/files.
- Inspect page count and overflow.
- Shorten content through bounded iterations if necessary.
- Mark unsuitable results Needs revision.

A one-page result may still be crowded or clipped. Visual review remains necessary.

A temporary PDF may be used for validation without changing the `.tex`-first deliverable.

## 18. Application preparation

Per-job workspace:

- Job snapshot.
- Resume drafts.
- Optional cover letter.
- Application questions and answers.
- Required documents.
- Application URL.
- Brief notes.

Generate using approved facts.

Support employer word/character limits.

Ask Vince for unknown:

- Availability.
- Work authorization.
- Eligibility.
- Required factual answers.

Do not invent them.

Maintain an editable answer bank for recurring questions.

Do not automatically answer voluntary demographic questions.

Initial assistance:

- Copy profile fields.
- Copy answers.
- Download resume source.
- Open application.
- Record submission manually.

Browser autofill is optional later scope.

Do not assume access to employer submission API credentials.

# Module E — Tracking and follow-ups

## 19. Compact application tracker

Use a simple table/list.

Suggested statuses:

- Saved.
- Preparing.
- Applied.
- Interview.
- Offer.
- Rejected.
- Withdrawn.

Store:

- Canonical job.
- Company/title snapshot.
- Status.
- Applied date.
- Application URL.
- Exact used resume/document versions.
- Notes.
- Optional user-entered contact.
- Follow-up date.
- Optional interview date.

Main list:

- Company.
- Role.
- Applied date.
- Status.
- Follow-up date.

Support search and status filters.

### Follow-ups

- In-app due indicator.
- Draft message.
- Copy message.
- Complete.
- Reschedule.
- Dismiss.

No automatic sending.

Do not fabricate recruiter contacts.

History survives:

- Source disconnect.
- Subscription expiry.
- Posting closure.
- Source deletion.
- Collection failure.

# Module F — Architecture and reliability

## 20. Recommended architecture

Verify current compatibility before choosing exact versions.

Suggested stack:

- Next.js.
- TypeScript.
- Tailwind CSS.
- shadcn/ui.
- Selected 21st.dev components.
- Supabase Postgres.
- Private storage.
- Owner-only authentication.
- Gemini server adapter.
- Zod or equivalent validation.
- PostGIS where available.
- Vercel.
- Optional worker/scheduler.

Deliver a normal repository Vince can deploy independently.

Do not depend on Sites-specific infrastructure.

### Responsibilities

- UI: browsing and review.
- Server layer: authenticated queries and mutations.
- Repositories: persistence.
- Connectors: source access and parsing.
- Ingestion: normalization, snapshots, deduplication.
- AI: extraction and content generation.
- Resume renderer: trusted template output.
- Task runner: collection progress and scheduling.
- Optional compiler: isolated validation.

Do not use serverless disk as the durable database.

Browser storage may hold transient preferences, not the only application history.

Document hosting-specific pieces so another platform can replace them.

## 21. Data model

All private records require owner scoping and timestamps.

| Entity            | Contents                                                   |
| ----------------- | ---------------------------------------------------------- |
| Profile           | Education, confirmed preferences, geographic origin        |
| ResumeFact        | Approved fact, tags, source, version, confirmation         |
| ResumeTemplate    | Trusted LaTeX shell and version                            |
| ResumeRuleSet     | Editable rules and version                                 |
| ConnectorInstance | Type, config, capabilities, state, credential reference    |
| SyncRun           | Progress, cursor, status, bounded errors                   |
| Company           | Name, verified domain, logo metadata                       |
| Job               | Canonical role, dates, status, highlights                  |
| JobLocation       | Original text, normalized location, coordinates, precision |
| JobSource         | Connector, upstream ID, URLs, source dates                 |
| JobSnapshot       | Text, sanitized HTML, hash, retrieval date                 |
| FieldEvidence     | Field, snapshot, evidence, extraction method               |
| JobOverride       | User correction and timestamp                              |
| SavedSearch       | Filter schema, version, default                            |
| UserJobState      | Saved/hidden/viewed                                        |
| VisitState        | Prior watermark and current visit start                    |
| ResumeDraft       | Inputs, `.tex`, edits, validation state                    |
| Application       | Status, applied date, snapshot, used drafts, notes         |
| ApplicationDraft  | Cover letter/answer content and version                    |
| FollowUp          | Date, contact, draft, completion                           |

Credentials are protected secret references or encrypted values, not ordinary readable configuration.

Job facts include nullable:

- Salary and currency.
- Pay interval.
- Duration.
- Start/term.
- Deadline.
- Work arrangement.

Retain source values and normalized values.

Unknown states, evidence, and date precision belong in the data model.

## 22. Data integrity and deduplication

Match in this order:

1. Connector/upstream identity.
2. Canonical employer URL.
3. Employer domain plus requisition ID.
4. Conservative composite match.

Strip known tracking parameters only.

Do not remove semantic job IDs.

Preserve distinct roles when uncertain.

Optional manual controls:

- Merge duplicates.
- Keep separate.

Use content hashes to avoid unnecessary extraction.

Version parsers and record reprocessing.

Prefer authoritative employer facts when justified.

Preserve source conflicts rather than silently replacing them.

Closed postings remain accessible from application history.

## 23. Suggested API boundaries

Authenticated endpoints may include:

- `GET /api/jobs`
- `GET /api/jobs/:id`
- `POST /api/imports`
- `GET /api/imports/:id`
- CRUD `/api/saved-searches`
- CRUD `/api/connectors`
- `POST /api/connectors/:id/sync`
- `POST /api/jobs/:id/resume-drafts`
- `PATCH /api/resume-drafts/:id`
- `GET /api/resume-drafts/:id/export`
- `POST /api/jobs/:id/application-drafts`
- CRUD `/api/applications`
- CRUD `/api/follow-ups`
- `GET/PATCH /api/profile`
- `POST /api/chat-handoff`
- Scheduler-only `POST /api/sync`

Every endpoint checks authorization.

Background operations use separate authentication.

Mutations use appropriate CSRF protection.

No endpoint accepts arbitrary executable plugin code.

## 24. Privacy and security

Required:

- Owner-only access.
- Private database policies.
- Private file storage.
- Server-only secrets.
- No sensitive prompt/content logging.
- Sanitized HTML.
- Escaped output.
- Source text treated as untrusted data.
- No model authority to send messages, execute code, or modify secrets.

URL imports:

- HTTP(S) only.
- Block loopback/private/link-local/internal destinations.
- Block metadata services.
- Recheck redirects and resolved addresses.
- Protect against DNS rebinding.
- Limit size, duration, content type, and redirects.
- Avoid unrestricted image-fetch proxies.

Operational controls:

- Rate-limit expensive operations.
- Bound retries.
- Restrict uploads.
- Remove disconnected credentials.
- Export data to JSON.
- Export applications to CSV.
- Document backups and restoration.
- Test restoration.

These controls do not require an extra monitoring dashboard.

## 25. Performance and accessibility

Engineering targets:

- Usable feed in approximately two seconds.
- Filter responses generally within 500 ms once available.
- Cursor pagination.
- Narrow-phone through desktop support.
- Keyboard access.
- Visible focus.
- Adequate contrast.
- Reduced-motion support.
- Preserved scroll and filters.
- Graceful missing images.
- Wrapped long titles.
- Nonblocking sync/AI work.

External source timings are not guaranteed.

# Module G — Delivery and acceptance

## 26. Acceptance criteria

### Browsing

- Default chronological ordering.
- Documented date precedence.
- Updates do not appear as new posts.
- Initial baseline behaves correctly.
- Cards show meaningful facts.
- Details show requested highlights first.
- Missing facts remain unknown.
- No personal fit scores.

### Filtering

- Saved searches persist.
- OR/AND semantics work.
- Radius uses selected origin.
- Approximate locations are identified.
- Remote eligibility is not guessed.

### Connectors

- GitHub, Greenhouse, and Lever ingest configured live sources.
- MyExperience/Intern Insider show honest capabilities.
- Import fallback works.
- Existing connector settings require no code edits.
- Disconnect preserves history.
- Failures remain isolated.
- Repeated imports do not duplicate reliable matches.

### Resume

- Gemini configured server-side.
- Approved facts only.
- Complete `.tex` export.
- Master preserved.
- Restrained keywords/bolding.
- Honest page-count status.
- ChatGPT handoff requires no OpenAI API key.
- Input versions retained.

### Applications and deployment

- Applied requires confirmation.
- Used resume remains accessible.
- Follow-up controls work.
- Unauthorized access blocked.
- No client-side secrets.
- Data survives redeployment.
- Scheduled collection works with browser closed.
- Component provenance documented.

## 27. Delivery phases

Use the detailed checkpoints in Section 31.

High-level sequence:

1. Scaffold and approved visual UI.
2. Private persistent data.
3. Search/geography.
4. One live connector.
5. Multiple sources and scheduled collection.
6. Gemini imports.
7. Master resume and facts.
8. Tailoring.
9. Application preparation/tracking.
10. Follow-ups and restricted sources.
11. Deployment and final verification.

Do not implement all phases together.

Future additions only if needed:

- Browser capture.
- Site-specific autofill.
- Isolated LaTeX compiler.
- Commute estimates.
- More adapters.
- More AI providers.

Do not introduce rejected scoring, alerts, spending dashboards, or CRM features.

## 28. Verification and repository deliverables

### Meaningful automated checks

- Search semantics.
- Radius boundaries.
- Unknown/approximate locations.
- Canada-only remote behavior.
- Date precedence.
- Visit watermark.
- Deduplication.
- Distinct requisitions.
- Parser fixtures.
- AI schema/evidence validation.
- Unsupported claims.
- LaTeX escaping/template preservation.
- Disconnect and failure recovery.
- Authorization.
- URL restrictions.
- Version retention.
- Follow-up updates.

### Manual checks

- Desktop/mobile UI.
- Real collection.
- Public and blocked URL imports.
- Multiple Overleaf compilations.
- One-page readability.
- Limited bolding.
- One complete application preparation.
- Redeploy persistence.
- Background execution.
- Export/restore.

### Repository deliverables

- Source and lockfile.
- PRD.
- README.
- Environment example with placeholders.
- Migrations.
- Sanitized fixtures.
- Connector guide.
- Capability matrix.
- AI prompt/schema documentation.
- UI provenance.
- Resume setup instructions.
- Scheduler/worker instructions.
- Export/restore guide.
- Known limitations.
- Acceptance checklist.
- Build-progress file.
- Architecture notes.
- AGENTS.md.

## 29. Defaults and unresolved choices

### Defaults

- Single private user.
- Canada-first.
- Surrey preset with editable precise origin.
- No assumed term or authorization.
- Gemini automation.
- Manual ChatGPT handoff.
- Overleaf compilation.
- Compact tracking.
- Public integrations before restricted integrations.
- Daily background refresh on baseline Vercel Hobby setup.

### Resolve during setup

- Terms and durations.
- Employers/repositories.
- Gemini key/model.
- Approved facts/template.
- Restricted-source access.
- Desired refresh frequency.
- Whether compiler worker is worthwhile.

Unresolved choices must not block the useful core product.

## 30. Research references

Recheck current documentation during implementation.

- OpenAI billing:
  https://help.openai.com/en/articles/9039756-managing-billing-for-chatgpt-and-the-api-platform
- Gemini structured outputs:
  https://ai.google.dev/gemini-api/docs/structured-output
- Gemini API terms:
  https://ai.google.dev/gemini-api/terms
- Greenhouse:
  https://docs.greenhouse.io/job-board.html
- Lever:
  https://github.com/lever/postings-api
- GitHub contents API:
  https://docs.github.com/en/rest/repos/contents
- SFU MyExperience:
  https://www.sfu.ca/wil/myexperience/
- Intern Insider:
  https://interninsider.me/
- Vercel cron limits:
  https://vercel.com/docs/cron-jobs/usage-and-pricing
- 21st.dev terms:
  https://docs.21st.dev/terms
- shadcn/ui:
  https://ui.shadcn.com/

# Module H — Vince’s incremental build guide

## 31. How to build this with Codex, step by step

This guide is for Vince. It is not a command to build the entire application.

Complete one checkpoint at a time.

### 31.1 Initial preparation

Create a Git repository.

Save this document as `docs/PRD.md`.

Keep real keys, resumes, contact information, and application exports out of Git.

Ask Codex to create:

- `docs/build-progress.md`
- `docs/architecture.md`
- `docs/ui-components.md`
- `AGENTS.md`

The progress file records:

- Completed checkpoint.
- Verification results.
- Known limitations.
- Next step.

Architecture notes record:

- Module responsibilities.
- Public interfaces.
- Data flow.
- Significant decisions.

Suggested AGENTS.md rules:

- Implement only the requested checkpoint.
- Read relevant PRD sections and progress notes.
- Inspect existing code before editing.
- Keep UI, repositories, connectors, AI, geography, and resume rendering separate.
- Do not change database schema, authentication, dependencies, or public contracts during cosmetic changes.
- Explain unavoidable structural changes and propose a small migration.
- Do not rewrite unrelated working modules.
- Run relevant checks.
- Report behavior changed, verification, and limitations.
- Update build-progress after completion.

### 31.2 Module boundaries

Example structure:

| Area                        | Responsibility                     | Avoid                       |
| --------------------------- | ---------------------------------- | --------------------------- |
| `src/app`                   | Routes/layouts/server entry points | Source parsing              |
| `src/components/ui`         | Reusable UI components             | Database/API access         |
| `src/features/jobs`         | Feed/details/filters               | Raw upstream data           |
| `src/features/applications` | Tracker/workspace                  | Automatic submission        |
| `src/domain`                | Canonical types/schemas            | UI dependencies             |
| `src/server/repositories`   | Persistence                        | Rendering                   |
| `src/server/connectors`     | Source adapters                    | UI-specific data            |
| `src/server/ingestion`      | Normalize/deduplicate              | Provider-specific UI        |
| `src/server/ai`             | Provider adapters                  | Acting on job instructions  |
| `src/server/resume`         | Trusted rendering/validation       | Arbitrary execution         |
| `src/server/geo`            | Locations/radius                   | False precision             |
| `src/server/tasks`          | Sync/checkpoints                   | Unbounded page-request work |

Equivalent structures are acceptable.

Preserve boundaries rather than creating unnecessary abstractions.

Data flow:

1. Connector retrieves source data.
2. Normalization produces canonical data.
3. Ingestion deduplicates and persists.
4. Repositories serve application queries.
5. UI renders canonical records.

AI extraction also produces validated canonical data.

UI components must not directly depend on GitHub or ATS formats.

### 31.3 Checkpoint routine

For every step:

1. Start from a working Git checkpoint.
2. Name the exact step.
3. Give Codex relevant PRD sections.
4. Have it inspect existing code.
5. Implement that slice.
6. Run locally.
7. Inspect the product yourself.
8. Run relevant checks.
9. Review the Git diff.
10. Update progress notes.
11. Commit the working checkpoint.

Do not move on until the current slice works.

Fix an unsuitable browsing design before adding live sources.

Record source-access limitations rather than repeatedly rebuilding the app.

A checkpoint is a recoverable state, not a claim that the whole product is complete.

### 31.4 Build checkpoints

#### Step 0 — Repository and tools

Implement:

- Project scaffold.
- Compatible TypeScript/UI dependencies.
- Local commands.
- Documentation files.
- Formatting/typecheck/build scripts.
- Environment placeholders.
- Ignore rules.

Codex prompt:

> Read docs/PRD.md and initialize only Step 0. Set up the repository, local tooling, architecture notes, build-progress file, and AGENTS.md. Do not implement application features yet. Explain the selected stack and verify the starter runs and builds.

Check:

- Development server starts.
- README commands work.
- No secrets are tracked.
- No unnecessary infrastructure was added.

Checkpoint: clean working starter.

#### Step 1 — Visual feed and details

Implement:

- Navigation.
- Job cards.
- Filter/search visual controls.
- Facts-first details.
- Mobile layout.
- Loading/empty/error examples.
- Canonical schema.
- Representative fixtures.

Use real existing components with documented provenance.

Codex prompt:

> Implement only Step 1 using sections 5–8 and 21. Build the visual Jobs feed and detail view with canonical fixtures for software, firmware, and electrical roles. Inspect suitable existing UI components, including 21st.dev where accessible. Do not connect a database, live sources, or Gemini.

Check:

- Titles and company names are easy to scan.
- Important details appear first.
- Closing details preserves position.
- Missing logos look intentional.
- Long titles wrap.
- Unknown salary/term is honest.
- Desktop and phone layouts look good.
- Keyboard focus works.

Refine the design now.

Checkpoint: approved browsing UI.

#### Step 2 — Persistence and private access

Implement:

- Core database migrations.
- Owner authentication.
- Private storage.
- Ownership policies.
- Repositories.
- Persistent fixture queries.
- Development seed path.

Codex prompt:

> Implement only Step 2. Preserve the approved UI and canonical contract. Add persistent storage, owner-only access, migrations, and repositories. Seed sanitized development fixtures. Verify authorization and persistence after restart.

Check:

- Your account works.
- Signed-out/private browser access is blocked.
- API access is protected.
- Restart preserves jobs.
- Fresh migrations work.
- Fixtures are distinguishable from real jobs.

Checkpoint: private persistent dashboard.

#### Step 3 — Searches, dates, and geography

Implement:

- Real filters.
- Saved searches.
- Chronological pagination.
- Visit watermark.
- Geographic origin.
- Radius queries.
- Location precision.

Codex prompt:

> Implement only Step 3 using sections 7, 9, and 10. Add saved searches, stable newest-first order, new-since-last-visit behavior, and honest radius filtering. Use controlled locations to verify boundaries. Do not add fit scoring or live connectors.

Check:

- Save/reload a firmware search.
- Combine country, discipline, and technology.
- Test just inside/outside 20 km.
- Approximate locations are labeled.
- Unknown remote eligibility stays unknown.
- Updated jobs do not falsely become new.

Checkpoint: trustworthy filters.

#### Step 4 — One live connector

Implement:

- Registry.
- Source settings.
- One GitHub adapter.
- Parsing/normalization.
- Snapshots.
- Ingestion.
- Manual refresh.
- Disable/disconnect.
- Idempotency.

Codex prompt:

> Implement only Step 4 using sections 11–13. Connect one inspected GitHub internship repository through the connector contract. Route data through normalization and ingestion. Do not embed GitHub parsing in UI components. Preserve first_seen_at across refreshes.

Check:

- Real listing appears.
- Source link is correct.
- Repeated refresh does not duplicate it.
- Missing description is not fabricated.
- Disable stops collection.
- Disconnect preserves jobs.

Checkpoint: one real end-to-end source.

#### Step 5 — Employer boards and scheduling

Implement:

- Greenhouse.
- Lever.
- Configurable employer list.
- Cross-source deduplication.
- Failure isolation.
- Scheduled sync.

Codex prompt:

> Implement only Step 5. Add Greenhouse and Lever through the existing connector contract. Add conservative deduplication and bounded scheduled sync. Preserve provenance and current hosting limits. Do not promise hourly refresh on a daily-only scheduler.

Check:

- Verified employer board collects real jobs.
- Reliable duplicates merge.
- Distinct requisitions remain separate.
- One failed source does not block others.
- Scheduled collection works with browser closed.

Checkpoint: multi-source daily feed.

#### Step 6 — Imports and Gemini extraction

Implement:

- Add job dialog.
- Secure fetch.
- ATS recognition.
- Text fallback.
- Gemini adapter.
- Evidence-backed extraction.
- Preview.
- Canonical save.

Codex prompt:

> Implement only Step 6 using sections 14, 15, and 24. Add URL/text import and server-side Gemini extraction. Retrieve real content before using the model. Validate output and retain evidence. Reuse ingestion. Do not add resume generation yet.

Check:

- Import public ATS URL.
- Test login-only URL.
- Paste description.
- Missing salary stays Not stated.
- Repeat import without duplicates.
- Missing key/quota errors are recoverable.
- Private-network URLs are blocked.
- Malicious job instructions are treated as data.

Checkpoint: reliable quick imports.

#### Step 7 — Resume source of truth

Implement:

- Private master template.
- Approved facts.
- Confirmation interface.
- Rule editor.
- Versions.

Codex prompt:

> Implement only Step 7 using sections 3 and 17. Add master LaTeX import, reviewed facts, and versioned rules. Preserve the source template. Do not generate tailored resumes until the fact bank and rendering contract work.

Check:

- Import real template privately.
- Verify names, dates, metrics, links, and skills.
- Edit/remove incorrect fact.
- Confirm versioning.
- Confirm private data is absent from Git/logs.

Checkpoint: trusted resume foundation.

#### Step 8 — Tailoring and ChatGPT handoff

Implement:

- Fact-grounded generation.
- Trusted rendering.
- Full LaTeX editor/copy/download.
- Diffs.
- Versions.
- Static checks.
- Page-count status.
- ChatGPT prompt export.
- Returned-code import.

Codex prompt:

> Implement only Step 8. Tailor approved facts to a selected job with Gemini and render through the trusted template. Return complete .tex and preserve constraints. Add manual ChatGPT handoff. Do not claim one-page verification without compilation.

Check:

- Tailor for software.
- Tailor for electrical/firmware.
- Compile in Overleaf.
- Inspect one-page layout.
- Check spacing, clipping, spelling, and bolding.
- Ensure no unsupported keyword becomes a skill.
- Confirm master unchanged.
- Try ChatGPT workflow.
- Restore earlier draft.

Checkpoint: usable resume tailoring.

#### Step 9 — Applications

Implement:

- Cover letters.
- Short answers.
- Limits.
- Required fact questions.
- Document checklist.
- Compact tracker.
- Used-version links.

Codex prompt:

> Implement only Step 9 using sections 18–19. Build the compact preparation workspace and tracker. Store exact job snapshots and resume versions. Keep submission manual. Opening an employer link must not mark Applied.

Check:

- Prepare one application.
- Test character-limited answer.
- Unknown authorization requires input.
- Mark Applied.
- Inspect used resume.
- Confirm history survives source removal.

Checkpoint: complete application workflow.

#### Step 10 — Follow-ups and restricted sources

Implement:

- Follow-up dates.
- Message drafts.
- MyExperience settings.
- Intern Insider settings.
- Verified access/import.
- Subscription pause.

Codex prompt:

> Implement only Step 10. Add simple follow-ups and message drafts without sending email. Investigate MyExperience and Intern Insider access. Implement supported methods and label import-only connections honestly. Preserve history after expiry.

Check:

- Set/reschedule/complete reminder.
- Contact details are not invented.
- Import from restricted sources through supported methods.
- Pause subscription source.
- Confirm saved history remains.
- UI does not imply unsupported automatic access.

Checkpoint: intended source set with honest capabilities.

#### Step 11 — Deploy and verify

Implement:

- Production configuration.
- Production authentication/storage.
- Scheduler.
- Export/restore.
- Responsive/accessibility polish.
- Acceptance review.

Codex prompt:

> Complete only Step 11. Prepare deployment and verify section 26. Recheck hosting limits, ownership policies, persistent data after redeployment, and source limitations. Do not add new features during launch polish.

Check:

- Desktop and phone.
- Private API access.
- Live refresh.
- Scheduled collection.
- Import.
- Resume generation.
- Application record.
- Export and restoration.
- Persistence after redeployment.

Checkpoint: daily-use private website.

### 31.5 Making changes safely

Every request should include:

1. Desired change.
2. Affected area.
3. Behavior to preserve.
4. Required checks.

#### Cosmetic change

> Make job cards more compact and increase logos slightly. Change presentation components and shared style tokens only. Preserve schema, filters, chronology, ingestion, and database. Check long titles, missing logos, and mobile layout.

#### Filter change

> Add an option to exclude unpaid roles. Update saved-search validation, query behavior, and UI together. Preserve old searches with a compatible default/migration. Check paid, unpaid, and unknown-pay roles. Do not rewrite connectors.

#### Resume preference change

> Emphasize embedded projects in tailoring. Update versioned rules and generation inputs. Preserve approved facts, template, and past drafts. Verify a new draft in Overleaf. Do not rewrite previous applications.

#### New source

> Add this source through the connector interface. Normalize into canonical jobs and reuse ingestion. Add parser fixtures and document limitations. Do not add source-specific logic to cards.

#### Architecture change

> Inspect callers and existing data first. Explain the migration, compatibility, and rollback. Change the smallest necessary contract and update affected checks. Keep unrelated modules intact.

Avoid vague prompts:

- Make everything better.
- Rewrite the app.
- Add all remaining features.

Request a specific visible outcome.

### 31.6 Recovery

- Review Git diffs.
- Commit small working checkpoints.
- Use separate branches for risky changes.
- Ask Codex to isolate regressions.
- Revert a bad development commit when appropriate.
- Database migrations require separate rollback planning.
- Code rollback does not necessarily roll back data.
- Back up production before destructive migrations.
- Never solve a cosmetic issue by rewriting connectors or persistence.

For a new Codex session, provide:

- `docs/PRD.md`
- `AGENTS.md`
- `docs/build-progress.md`

Then name the next checkpoint.

Continue from the existing implementation instead of rebuilding completed work.

Next step:
COnnect job sources
