# Co-op Desk

A private co-op and internship workspace with Jobs, Applications, Sources, Resume,
and Settings. The expanded [PRD](PRD.md) has initial implementations; integration
acceptance and deployment remain in progress. The public `/preview` route contains
the original synthetic browsing prototype.

## Run locally

Requires Node.js 22 or later and npm.

```sh
npm install
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). Owner-only access requires
Supabase configuration in the ignored `.env.local`; see
[deployment setup](docs/deployment.md). `/preview` works without private configuration.

The current local session runs on port **3001** because another project occupies 3000. For browser-independent collection, keep the server running and run
`npm run feed:watch` in another terminal. This requires the explicit local mode
and server-only scheduler secret described in
[local background collection](docs/deployment.md#local-background-collection).

```sh
npm run typecheck
npm run test:browsing
npm run format:check
npm run build
npm start
```

`npm run format` formats source and documentation. Run `npm start` after building; stop the development server first if it uses the same port.

## Synthetic preview

- Browse eight synthetic roles and open their detail sheets.
- Search titles, companies, locations and technologies; try the sidebar presets and Filters sheet.
- Save a role, view Saved or New since last visit, or toggle a sample applied indicator.
- Use **Preview state** at the bottom of the feed to inspect loading, empty and error examples.
- On a phone, use the menu for navigation. Details open full-screen.

All vacancies and wording are sample content. Employer names and locally bundled logos illustrate the UI. Original posting and application links are intentionally unavailable; employer careers links are separate. Bookmarks and applied indicators reset on reload. Refresh reloads samples only.

The private workspace includes Supabase repositories and owner authentication,
initial connector/import adapters, optional Gemini drafting, resume versioning,
applications, and follow-ups. Scheduled sync is not implemented. Live source,
resume, restore, and full UI acceptance checks remain open; this is not a verified
production deployment. Gemini and an actual master resume are not configured yet.

See [architecture](docs/architecture.md), [component provenance](docs/ui-components.md), [build progress](docs/build-progress.md) and [third-party notices](THIRD_PARTY_NOTICES.md).

Coding agents use project-level [Ponytail guidance](docs/ponytail.md) in
`AGENTS.md` to prefer the smallest complete change while retaining the project's
architecture and verification requirements.
