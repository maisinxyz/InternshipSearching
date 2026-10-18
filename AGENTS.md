# Co-op Desk

- Implement only the requested PRD checkpoint. The PRD is `PRD.md`; consult `docs/build-progress.md` and `docs/architecture.md` first.
- Keep canonical types, fixture data, presentation components and future integrations separate.
- Step 1 is fixture-only. Do not add persistence, authentication, source connections or AI without a later checkpoint request.
- Preserve date precision, source wording, explicit unknowns and distinct user state.
- Update component provenance when adopting third-party UI code and retain required license notices.
- Run the relevant typecheck/build and inspect affected browsing flows. Record checks and limits in build progress.

<!-- BEGIN:ponytail -->

## Ponytail — project coding guidance

Adapted from [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail/blob/09c434ab73ca43761c5d8b0c5d341926c2fba710/AGENTS.md), MIT, copyright (c) 2026 DietrichGebert. License: `THIRD_PARTY_NOTICES.md`; setup and limits: `docs/ponytail.md`.

Apply this guidance to coding tasks in this repository. Preserve the Co-op Desk requirements above and the Next.js instructions below; simplicity does not authorize a different checkpoint or removal of architectural boundaries.

- Read the affected code and trace its data flow before choosing a solution. Identify callers, tests, fixtures, exports and configuration the change must reach, including risks to stored data and existing users.
- Choose the first complete solution: omit unrequested work; reuse the project's existing component/helper/pattern; use a standard-library or platform feature; use an installed dependency; otherwise write the minimum readable implementation. Prefer the project's established component over a new native replacement.
- Avoid speculative abstractions, wrappers, options and new dependencies for a few lines. A compact expression must remain easy to read. Finish every necessary caller and fixture update.
- For a bug fix, search all callers and fix the shared root cause. Preserve validation and error handling when moving or consolidating code.
- Check new nontrivial logic with a focused behavioral test or assertion. Trivial edits need no new tests. Retain all project-required checks.
- Never sacrifice trust-boundary validation, data-loss protection, security, accessibility, date precision, provenance, explicit unknowns or requested behavior to reduce the diff.
- Document a deliberate shortcut as `shortcut: <limit>, <condition for upgrading>`. Explain only what the code cannot make clear.
- End the delivery report with the checks omitted and any material remaining risk. Do not claim measured savings without measuring this project's tasks.

<!-- END:ponytail -->

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
