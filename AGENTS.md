# Intern External

- Next.js 16 (App Router, Turbopack). Read `node_modules/next/dist/docs/` before using unfamiliar APIs; `middleware` is now `proxy`, and `params`/`searchParams`/`cookies()` are async.
- Mimic Intern Insider's features and layout only. Never copy its logo, copy, screenshots, testimonials, stats, code or listing data.
- `src/lib/collect.ts`, `taxonomy.ts`, `search.ts`, `sources.ts`, `db.ts` also run under plain Node (`scripts/collect.ts`): keep relative `.ts` imports and no `server-only`/`@/` in them.
- Preserve unknowns as null / "Not specified"; never guess term, pay or work mode. Keep "Posted" (employer date) vs "Found" (first seen) distinct.
- Single-owner mode: one fixed user (`owner`), password from `APP_PASSWORD`, everything under `(site)` is gated in its layout. Every server action must still call `requireUser` and scope queries by `user_id`.
- Run `npm run typecheck && npm test && npm run build` after changes.
