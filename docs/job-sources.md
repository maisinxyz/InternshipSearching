# Job source configuration

Reviewed and configured on 2026-10-14. Collection is manual or stale-on-open;
there is no unattended scheduler or deployment yet.

| Source                  | Configuration                                                         | Method                                                    | Initial imported jobs |
| ----------------------- | --------------------------------------------------------------------- | --------------------------------------------------------- | --------------------- |
| Tenstorrent             | Greenhouse `tenstorrentuniversity`                                    | Public GET API, full available descriptions               | 4                     |
| Kepler Communications   | Lever `kepler`, global region                                         | Public GET API, full available descriptions               | 1                     |
| Summer 2027 internships | GitHub `vanshb03/Summer2027-Internships`, `README.md`, default branch | Contents API, table summaries                             | 1                     |
| SFU MyExperience        | `myexperience`                                                        | Opt-in selected-posting text import; sign in at SFU       | —                     |
| Intern Insider          | `intern-insider`                                                      | Opt-in employer URL import; sign in at Intern Insider     | —                     |
| Workday                 | `workday`                                                             | Individual public URL/text import                         | —                     |
| LinkedIn                | `linkedin`                                                            | URL plus pasted description when retrieval is unavailable | —                     |
| Other career sites      | `manual`                                                              | Public URL or pasted description                          | —                     |

The three collectors explicitly collect Canadian workplaces and intern/co-op/student
titles. Unknown-country and unspecified-remote jobs are excluded by this collection
scope. These settings are visible and editable in Sources; they do not infer resume
eligibility. No work term is assumed. The sources cover a small subset of Canadian
opportunities, and source availability can change.

## Setup and refresh

Sources has a **Set up starter sources** action backed by an authenticated API.
Repeated setup retains existing equivalent configurations, names, and paused state.
New configurations live in Supabase and can be edited without changing adapters.
The reviewed presets are separate from parsing in `src/server/source-presets.ts`.

**Refresh batch** processes at most 30 selected listings. A 120-second source lease
bounds overlapping refreshes, so immediate repeat refresh may ask you to wait.
GitHub uses the repository's default branch unless a ref is supplied in configuration.
The adapter accepts HTML and Markdown application links. A yearless source date
remains unknown; discovery is labelled instead. Greenhouse `updated_at` remains an
update date, not a publication date. Employer multi-location strings are split and
their original workplace wording is retained; coordinates are unknown.

Adapter version 2 forces one full fetch for version-1 records before reusing ETags,
so parser changes are applied. Repeated ingestion retains job identity, snapshots
when unchanged, original discovery dates and separately stored user state. Broad
upstream list changes during multi-batch runs still need the continuation review
recorded in NEXT-SESSION. Source disappearance does not currently prove closure.

Final Chrome verification refreshed all three collectors and retained six distinct
jobs. GitHub is connected again after its pause/resume test; pausing preserved its
imported opportunity. Kepler's detail shows the source-stated on-site arrangement,
January 2027 term and four-month duration, with an unknown exact start date.

## Access and reuse evidence

- [Greenhouse Job Board API](https://docs.greenhouse.io/job-board.html) documents
  unauthenticated GET access. [Tenstorrent university board](https://job-boards.greenhouse.io/tenstorrentuniversity)
  and its public API were checked live.
- [Lever Postings API](https://github.com/lever/postings-api) documents public
  postings access. [Kepler board](https://jobs.lever.co/kepler) and its public API
  were checked live.
- [Summer2027-Internships](https://github.com/vanshb03/Summer2027-Internships)
  was inspected on its `dev` default branch. Its [MIT license](https://github.com/vanshb03/Summer2027-Internships/blob/dev/LICENSE.txt)
  is retained in preset configuration and every imported GitHub snapshot.
  Attribution wording is excluded from role classification.
- GitHub's license endpoint returned 404 for `negarprh/Canadian-Tech-Internships-2027`
  and `speedyapply/2027-SWE-College-Jobs`. Reuse permission was not established, so
  they were not enabled. This is not a finding that permission cannot be obtained.

Import-only entries are fallback configuration, not automatic integrations. No
subscription credentials, university session cookies or application submission
access were added. No source-specific access bypass or automatic email is used.

## Account source access — 2026-10-14

SFU and Intern Insider each have provider sign-in links, an explicit import opt-in,
pause/resume, optional expiry and disconnect. Opt-in defaults off for old and new
records. These controls do not claim an authenticated server connection: signing
in creates only the provider's normal Chrome session. Co-op Desk cannot detect it,
read its cookies, or synchronize the provider's private database.

- **SFU:** owner sign-in and access to co-op results were verified. The inspected
  result/detail screens expose saved-search email alerts and per-posting Print;
  no export/feed was found there. Import a selected description with its numeric
  job ID. Pasted labelled fields retain term, duration, location and arrangement
  with exact source evidence. Missing fields remain unknown. The numeric ID keeps
  different postings distinct even when SFU uses a shared session URL. SFU's
  application instructions must remain in the retained wording; importing does
  not submit an application or replace the university application step.
- **Intern Insider:** the [current terms](https://interninsider.me/terms), reviewed
  2026-10-14, prohibit automation/scraping and API access without permission.
  A paid account alone does not establish permission for an adapter. The flow
  opens the provider sign-in, then accepts a public employer posting URL selected
  by the user. It fetches that employer page and retains Intern Insider as the
  discovery source. It does not collect subscription content or contact credits.
  A sanctioned API/feed or provider permission is needed for automatic syncing.

The server rechecks opt-in, pause, expiry and source existence at preview and save.
Authentication URLs and common credential/session query parameters are rejected
as posting links. No credentials belong in connector JSON or exported backups.
`npm run test:account-sources` covers these boundaries, exact SFU evidence and
distinct/repeated job ingestion using synthetic posting text.

One selected SFU posting and one employer posting supplied from Intern Insider
were saved through Chrome. Both source opt-ins are enabled. Greenhouse employer
URLs use its public per-posting API and board metadata to identify title/company
reliably; other public sites retain the existing JSON-LD/readable-text fallback.
An employer link is not an Intern Insider API connection. Locations are preserved
as supplied, even when a manually selected posting is outside the collectors'
Canadian scope.
