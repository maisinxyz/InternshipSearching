# Intern External

An internship board modeled on Intern Insider's features and layout, with its own name, wordmark,
copy and data. Listings come straight from employers' public Greenhouse, Lever and Ashby boards.

## Run it

```bash
npm install
npm run collect        # first pass over every employer board → .data/intern-external.sqlite
npm run build && npm start   # http://127.0.0.1:3002
npm run worker         # keep running: re-checks due boards every minute (30-min cycle per board)
```

`.env.local` (see `.env.example`); `APP_PASSWORD` is required:

| Variable | Enables |
| --- | --- |
| `APP_PASSWORD` | The password that unlocks the app |
| `ANTHROPIC_API_KEY` (`ANTHROPIC_MODEL`, default `claude-opus-5-5`) | AI Resume / Cover builders |
| `RESEND_API_KEY` + `ALERT_FROM_EMAIL` (+ `APP_URL`) | Alert emails (otherwise in-app bell only) |
| `DATABASE_PATH` | SQLite location |

## What's here

| Area | Route |
| --- | --- |
| Landing (live stats, city counts, tools, FAQ) | `/` |
| Board: search + Location / Posted / Major / Company / Term / Company Size / More, Save Search, Clear Filters | `/internships` |
| Job detail with attributes, Apply, Save, Track, "Improve your chances" | `/internships/[id]` |
| SEO landing pages | `/internships/{location,role,company,term}/[slug]` |
| Saved Jobs · Job Tracker (kanban) · Saved Searches & Alerts | `/saved` `/tracker` `/searches` |
| AI Resume Builder · Cover Builder (edit + print to PDF) | `/resume-builder` `/cover-builder` |
| My Contacts · Profile | `/contacts` `/profile` |
| Features, Blog, Resources, FAQ, For Higher Ed, About, Companies, Data sources, Privacy, Terms | |

Code layout: `src/lib` (db, collectors, taxonomy, search, auth, actions, ai), `src/components`, `src/app`.
Add employers in `src/lib/sources.ts`, then `node --experimental-strip-types scripts/logos.ts` and `npm run collect`.

## Checks

`npm run typecheck`, `npm test` (taxonomy, collector normalization, filters), `npm run build`.

## Deliberate limits

- Single-owner mode: no accounts, one password set in `.env.local` as `APP_PASSWORD` (5 wrong tries lock sign-in for a minute). Add real accounts before sharing this publicly.
- Single-file SQLite; move to Postgres before serverless hosting.
- No recruiter email finder: there's no licensed data source, so contacts are entered by hand.
- Coverage is the employer list in `sources.ts` (about 60 boards), much smaller than Intern Insider's.
- Legal pages are plain-language placeholders and need review before a public launch.

The previous Co-op Desk app is preserved at git tag `coop-desk-archive`.
