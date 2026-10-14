# Co-op Desk

A fixture-only Jobs workspace for software, firmware and electrical internships. Step 1 of [the PRD](PRD.md): responsive feed, facts-first details, local search/filter controls and documented UI components.

## Run locally

Requires Node.js 22 or later and npm.

```sh
npm install
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). No keys or environment configuration are needed.

```sh
npm run typecheck
npm run format:check
npm run build
npm start
```

`npm run format` formats source and documentation. Run `npm start` after building; stop the development server first if it uses the same port.

## Preview

- Browse eight synthetic roles and open their detail sheets.
- Search titles, companies, locations and technologies; try the sidebar presets and Filters sheet.
- Save a role, view Saved or New since last visit, or toggle a sample applied indicator.
- Use **Preview state** at the bottom of the feed to inspect loading, empty and error examples.
- On a phone, use the menu for navigation. Details open full-screen.

All vacancies and wording are sample content. Employer names and locally bundled logos illustrate the UI. Original posting and application links are intentionally unavailable; employer careers links are separate. Bookmarks and applied indicators reset on reload. Refresh reloads samples only.

The app has no database, live sources, Gemini, authentication, resume generation or application tracking backend. This checkpoint is not a private production deployment.

See [architecture](docs/architecture.md), [component provenance](docs/ui-components.md), [build progress](docs/build-progress.md) and [third-party notices](THIRD_PARTY_NOTICES.md).
