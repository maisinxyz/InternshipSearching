# Direct employer job feed — research and proposed checkpoint

Research date: 2026-10-18. This is a research deliverable, not a deployed collector.

## Product direction

Replace the subscription/university connection workflow with our own frequently
updated public employer feed. Intern Insider and SFU MyExperience cease to be
dependencies of discovery. Preserve historical imported jobs and user records
when retiring their setup UI. Keep adapters as internal implementation details;
the primary experience is Jobs, with coverage and freshness visible inline.

Target broad technology and engineering work: software, firmware, hardware,
electrical, mechanical, robotics, controls, manufacturing, test/QA, IT/cloud,
data/AI and technical product roles. Do not infer exclusions from the resume.
Working assumption pending user clarification: internships/co-ops, all work
terms; Metro Vancouver includes Surrey, Burnaby, Richmond and neighbouring
municipalities. Work authorization, exact availability and housing budget remain
unknown. This direction supersedes the earlier connection-first product proposal;
the implementation has not yet changed.

## Acquisition strategy

Poll employer boards directly. Use community repositories and search to discover
employers and overlooked links, then promote verified employer boards into the
monitored registry. Frequent polling of a slow aggregator cannot remove its delay.

| Source                                                                               | Useful data and method                                                                                                                                                                                  | Decision                                                                                                                                    |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| [Greenhouse public Job Board API](https://docs.greenhouse.io/job-board)              | Board listing, full descriptions with `content=true`, per-post details and pay transparency; documented unauthenticated GET access. Current docs expose `first_published` separately from `updated_at`. | Extend existing adapter; verify actual field presence per board.                                                                            |
| [Lever Postings API](https://github.com/lever/postings-api)                          | Employer-scoped published jobs, descriptions, categories, workplace and application links.                                                                                                              | Reuse existing adapter; do not invent publication dates where unavailable.                                                                  |
| [Ashby Job Postings API](https://developers.ashbyhq.com/docs/public-job-posting-api) | Employer-scoped descriptions, locations, optional compensation, `publishedAt`, `isListed`.                                                                                                              | Add next. `publishedAt` means last publication, not necessarily original publication. Keep unlisted jobs out of the discovered public feed. |
| Employer career pages                                                                | Public job pages, embedded JobPosting JSON-LD, sitemaps and documented feeds.                                                                                                                           | Add selected employer-specific adapters after access review; retain date semantics.                                                         |
| Workday, Eightfold, Avature and custom boards                                        | Important coverage beyond the three APIs. Public page behavior varies by employer.                                                                                                                      | Investigate per employer; no universal supported collection API was established in this research.                                           |

The practical meaning of “hidden jobs” is public roles that have not reached
LinkedIn, Google or a community list yet, plus separate early-career boards that
are easy to miss. For example, Astera has a dedicated `asteraearlycareer2027`
board and Tenstorrent has `tenstorrentuniversity`. Discover board identifiers
through employer links and public page embeds. Private drafts and internal-only
requisitions are outside this feed. A publicly reachable undocumented endpoint
still needs a stability/access review before becoming a production dependency.

## GitHub candidates

| Repository                                                                                                                  | Evidence reviewed                                                                                                                                                                                                | Intended use                                                                                         |
| --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| [SimplifyJobs/Summer2027-Internships](https://github.com/SimplifyJobs/Summer2027-Internships)                               | [Contributor documentation](https://github.com/SimplifyJobs/Summer2027-Internships/blob/dev/CONTRIBUTING.md) describes `.github/scripts/listings.json`, daily external imports, and `date_posted` as when added. | Broad tech/hardware employer discovery; do not label its addition timestamp as employer publication. |
| [vanshb03/Summer2027-Internships](https://github.com/vanshb03/Summer2027-Internships)                                       | Existing project collector; MIT reuse evidence recorded in `job-sources.md`; current repository opened during this research.                                                                                     | Retain as supplementary discovery, resolve to employer details.                                      |
| [seun-ipaye/frogg-canadian-internships](https://github.com/seun-ipaye/frogg-canadian-internships)                           | README claims 30-minute refresh, machine-readable `listings.json`, Canadian/Canada-remote coverage; includes both Simplify and direct careers sources.                                                           | Useful candidate/link discovery. Claimed cadence is not a measured freshness guarantee.              |
| [michelleokolie/canada-tech-internships-summer-2027](https://github.com/michelleokolie/canada-tech-internships-summer-2027) | Canada/remote list with off-season coverage.                                                                                                                                                                     | Additional employer discovery; cadence and reuse permission unverified.                              |

New repositories' bulk reuse rights were not established. Review applicable terms
and licenses before enabling imports. A code license does not automatically
license all underlying employer descriptions. Frogg marks source disappearances
as closed; our system must verify against the employer instead.

## Freshness and reliability proposal

| Work                                            | Proposed cadence                                              |
| ----------------------------------------------- | ------------------------------------------------------------- |
| High-priority employer public boards            | Every 5 minutes where permitted and operationally sustainable |
| Other enabled employer APIs                     | Every 15 minutes                                              |
| More expensive custom career pages              | Every 30–60 minutes, subject to source constraints            |
| Community repositories                          | Every 30–60 minutes using conditional requests                |
| Discover new employer boards and audit coverage | Daily                                                         |

Run continuously, including nights and weekends, independently of an open browser
or laptop. These are targets, not currently achieved service guarantees. With a
five-minute poll, ideal detection averages about 2.5 minutes after endpoint
visibility under uniformly timed arrivals; upstream caching, failures and queue
time add delay. No general public publication webhook was established, so do not
promise detection at the exact instant of publication or complete market coverage.

Use a persisted due-work table, source leases, bounded batches, retries with jitter
and `Retry-After`, idempotent ingestion and content hashes. Record a complete board
snapshot before processing a changing upstream list; the current numeric cursor
can skip entries if the list shifts between batches. Separate successful listing
checks from successful detail checks. Only changed descriptions need reparsing.
Keep raw source snapshots and evidence for normalized fields. AI extraction, if
used later, must not block discovery or fabricate unknowns.

Track original publication (when supported), last republication, first discovery,
source update, last successful check and description change separately. Baseline
imports are existing inventory, not newly posted jobs. Offer “posted in 24 hours”
separately from “discovered in 24 hours; posting date unknown.” Reposts retain
history. Close only with explicit evidence or repeated absence from complete,
successful authoritative snapshots; a failed fetch cannot close jobs.

An independent heartbeat monitor should detect a stopped scheduler. Mark a source
stale after two missed expected checks, surface the last success, and recover
automatically where possible. Propose operational failure notifications, distinct
from the PRD's excluded job digest; select a notification channel before enabling
outbound messages. A healthy feed can legitimately have zero new jobs in a day.

### Hosting choice

Start with [Supabase Cron](https://supabase.com/docs/guides/cron), already adjacent
to the existing database, dispatching bounded work to a deployed server endpoint.
[Supabase's scheduling guide](https://supabase.com/docs/guides/functions/schedule-functions)
documents `pg_cron`, HTTP dispatch and Vault. Authenticate dispatch with a dedicated
server secret, and use a narrowly scoped owner-bound database operation for the
worker. The existing repository relies on a browser user's JWT; that is not a
durable scheduler credential. Never expose privileged database credentials to the
client or accept caller-selected owners/URLs in the scheduler endpoint.

[Vercel Hobby cron](https://vercel.com/docs/cron-jobs/usage-and-pricing) is daily
and cannot satisfy the requested cadence. Vercel Pro supports minute intervals.
[Cloudflare Cron](https://developers.cloudflare.com/workers/configuration/cron-triggers/)
is an alternative scheduler if needed, rather than a required extra service.
[GitHub Actions schedules](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)
can be delayed or dropped, so should not be the primary freshness mechanism.

Illustrative capacity: 20 boards every 5 minutes plus 80 every 15 minutes means
13,440 listing requests/day before details, retries or repository checks. Measure
actual payloads, database writes and function usage during a small pilot; no
monthly price or free-tier sufficiency is established. Conditional GETs help
payload volume where supported but still involve requests.

## Geographic and opportunity rules

Create three transparent views, each newest-first:

1. Metro Vancouver: broad technical/engineering internships and co-ops.
2. Remote from BC: explicitly fully remote and eligible to work from BC/Canada.
   “Remote US” does not qualify; “North America” without eligibility detail needs
   review. Retain timezone, provincial and occasional travel restrictions.
3. Worth considering relocation: other Canadian/U.S. workplaces with stated
   sponsorship or relocation/housing support, plus evidence of financial or career
   value. Keep promising roles with missing support in a separate needs-confirmation
   view rather than pretending they meet the strict requirement.

Work authorization is a separate gate from relocation money. Store sponsorship,
relocation, housing, and remote eligibility independently as supported, unsupported,
conditional or not stated, with source wording and scope. Application questions
about needing sponsorship are not an offer to sponsor. Do not generalize one
company's benefit to every role. User citizenship/work permits remain unconfirmed.
For students studying abroad, the U.S. [BridgeUSA Intern program](https://j1visa.state.gov/intern-and-trainee-program-resource-page/)
is a route to investigate with an employer and designated sponsor; it is not
automatic eligibility. Do not assume Canadian residence permits U.S. employment.

### Is relocation justified?

Evaluate affordability and career value separately; show reasons and assumptions
rather than a personal fit percentage. A company name alone does not justify a
move, and “FAANG pipeline” is not a verifiable universal category.

For financial evaluation, estimate after-tax cash over the actual term plus
confirmed cash support, minus housing, utilities, food, transport, travel,
insurance and moving costs. Compare with the same calculation for staying local.
Track refundable deposits and up-front costs separately from expenses. Keep CAD
and USD distinct and record conversion date/rate when comparing. Exclude uncertain
bonuses/equity from rent-paying cash. Use the lower pay bound as the conservative
case, retaining the full employer range. Annualized intern salaries must be
prorated to the actual term; unknown hours stay unknown.

For rent, use available short-term studio/one-bedroom listings for the dates and
commute area, allowing a separate shared-housing scenario. CMHC distinguishes
[turnover rents from incumbent rents](https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/market-reports/rental-market-reports-major-centres);
neither a national average nor a long-term two-bedroom average is an adequate
quote for a furnished four-month apartment. No personal affordability conclusion
is possible yet without a budget, term and authorization.

Assess career value using technical ownership, mentorship, shipped work,
transferable systems/tools, established internship programs and documented
return-offer opportunities. Keep a user-editable priority-employer list, including
major tech and strong semiconductor/robotics employers; reputation is a preference,
not a guaranteed future job. Label outcomes “financially promising,” “career case;
budget tradeoff,” “needs confirmation,” or “does not meet stated conditions.”

## Concrete public examples found

These are research examples, not a claim that they were posted today. Pages can
close after review. Repository date labels were not independently verified.

| Employer / role                                                                                                    | Evidence                                                                                        | Interpretation                                                                                            |
| ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| [Astera Labs firmware spring co-op](https://job-boards.greenhouse.io/asteraearlycareer2027/jobs/4739544005)        | Vancouver; CAD 45–55/hour; at least four months; Canadian authorization required.               | Strong local board to monitor; retain prior co-op/RTOS requirements.                                      |
| [Moment Energy test engineering co-op](https://job-boards.greenhouse.io/momentenergy/jobs/4455115009)              | Surrey; battery systems, test benches and electronics.                                          | Adds clean energy and hands-on engineering coverage; pay not stated in reviewed text.                     |
| [Tenstorrent systems intern](https://job-boards.greenhouse.io/tenstorrentuniversity/jobs/5264407007)               | Vancouver/Toronto; firmware, validation, board design and packaging; export-control conditions. | Preserve separate workplace options and explicit eligibility wording.                                     |
| [Waabi safety methodologies co-op](https://jobs.lever.co/waabi/480d9d41-33d0-429a-8883-7f9ec305a30f)               | Toronto/Pittsburgh/San Francisco; CAD 41–53/hour or USD 40–52/hour; 40 hours/week.              | Interesting robotics career case, but sponsorship/relocation support not established; needs confirmation. |
| [Amazon automation intern](https://amazon.jobs/en/jobs/10501526/automation-engineer-intern-nationwide-summer-2027) | U.S. sites; conditional housing/relocation; expressly no sponsorship.                           | Relocation benefit cannot satisfy an unmet authorization requirement.                                     |
| [1Password data intern](https://jobs.ashbyhq.com/1password/412c1aac-13ce-4cc9-9c81-90a9a7a2ee48/)                  | Search-indexed employer text states remote Canada/U.S., Winter 2027.                            | Ashby remote coverage candidate; full current page was not readable through this research tool.           |

Additional expansion candidates discovered include AMD, EA, Motorola Solutions,
Workday, Amazon and Sanctuary AI. Some have custom platforms; source access and
current student-role coverage still need individual verification. AMD's indexed
Vancouver hardware co-op advertises CAD 51,000–70,000 annualized and 12/16 months,
but direct page retrieval failed in this research, so treat it as a lead.

## Proposed implementation order and acceptance

1. Replace connection-first onboarding with public feed coverage settings; preserve
   stored jobs, applications and provenance. Update PRD scope and UI together.
2. Fix stable snapshot/batch continuation and add verified Greenhouse publication
   mapping. Add Ashby and a small registry of reviewed employer boards.
3. Implement authenticated unattended dispatch and persistent due work. Deploy
   the worker with measured resource limits and failure monitoring.
4. Add BC-eligible remote and relocation evidence fields, transparent views and
   editable financial scenarios. Preserve user corrections across refreshes.
5. Pilot priority employers for seven days, then expand coverage. Require evidence
   of overnight/weekend runs, no unexplained gaps, and measured fetch/detection
   latency before calling the system frequent or reliable.

Tests must cover changed upstream ordering, duplicate runs, missed runs/recovery,
429/backoff, partial snapshots, stale source indicators, baseline imports,
republication, unknown dates, false closure, remote-US exclusion, sponsorship
negation/conditional support and preservation of stored user state. Synthetic
publication tests can measure detection; real-world publication latency is only
measurable when an authoritative timestamp is available.

## Research checks and limits

Read PRD, architecture, build progress and source documentation; inspected existing
collector date/cursor behavior; checked official API/scheduler docs and employer
pages. Public Greenhouse/Ashby JSON requests were not accessible through the web
research tool, so no new live API compatibility test is claimed. No app source,
database, account connections, scheduler or hosting changed. Typecheck/build and
browser acceptance were omitted because this change contains research docs only.
Next work requires source access verification, deployment and observed runtime
behavior; complete coverage and instant discovery remain unattainable guarantees.
