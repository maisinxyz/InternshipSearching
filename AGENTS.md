# Co-op Desk

- Implement only the requested PRD checkpoint. The PRD is `PRD.md`; consult `docs/build-progress.md` and `docs/architecture.md` first.
- Keep canonical types, fixture data, presentation components and future integrations separate.
- Step 1 is fixture-only. Do not add persistence, authentication, source connections or AI without a later checkpoint request.
- Preserve date precision, source wording, explicit unknowns and distinct user state.
- Update component provenance when adopting third-party UI code and retain required license notices.
- Run the relevant typecheck/build and inspect affected browsing flows. Record checks and limits in build progress.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
