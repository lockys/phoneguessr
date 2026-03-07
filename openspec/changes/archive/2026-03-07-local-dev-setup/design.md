## Context

The project moved from a Modern.js BFF architecture (Hono-based lambdas in `phoneguessr/api/lambda/`) to Vercel serverless functions at the repo root (`api/*.ts`) with `@neondatabase/serverless` HTTP driver. During this migration:

- Dynamic routes (`[action].ts`) were replaced with flat files + Vercel rewrites because `vercel dev` doesn't resolve dynamic route parameters
- The BFF plugin was removed from `modern.config.ts`
- The old `phoneguessr/api/` directory was deleted
- Several changes remain uncommitted

Current working state: `vercel dev` runs at localhost:3000 with `/api/phones`, `/api/puzzle/today`, `/api/leaderboard/daily`, `/api/auth/me` all verified returning correct JSON from Neon.

## Goals / Non-Goals

**Goals:**
- Every API endpoint works locally via `vercel dev` against Neon
- Frontend renders and can complete a full game flow locally
- Mock mode (`npm run dev:mock`) works as database-free fallback
- Single `npm run dev` command starts local development
- Vercel production deployment succeeds after push
- All changes committed in a clean, reviewable state

**Non-Goals:**
- Local database (SQLite/Postgres) — we use Neon directly
- Docker or containerized dev environment
- CI/CD pipeline setup
- Hot-reload for serverless functions (Vercel dev limitation)

## Decisions

### 1. Flat files + rewrites over dynamic routes
**Choice:** `api/puzzle.ts` with rewrite `/api/puzzle/:action` → `/api/puzzle?action=:action`
**Why:** `vercel dev` doesn't resolve `[action].ts` dynamic parameters — Modern.js catches the request first and serves the SPA HTML. Flat files get exact-match routing from Vercel.
**Alternative:** Split into individual files per endpoint — rejected because it would exceed the 12-function Hobby plan limit (11 → 17 functions).

### 2. Root `package.json` dev script
**Choice:** Add `"dev": "vercel dev"` to root `package.json`
**Why:** Ergonomic — `npm run dev` is the universal convention. Previous attempt caused recursive invocation, but that was because the old script ran from inside phoneguessr/. Running from root with vercel.json's `devCommand` handling the framework is correct.

### 3. Commit strategy
**Choice:** Single commit with all infrastructure changes
**Why:** The changes are logically one unit — the migration from BFF/dynamic routes to flat files/rewrites. Splitting would leave intermediate broken states.

## Risks / Trade-offs

- **[Vercel Hobby limit]** Currently at 11/12 functions. Adding any new endpoint requires consolidation. → Mitigated by documenting the constraint and keeping the flat-file + rewrite pattern.
- **[Rewrite ordering]** API rewrites must come before the SPA catch-all `/(.*) → /index.html`. → Verified working. Order is enforced in vercel.json array.
- **[Mock mode may be stale]** The old BFF mock handlers referenced `phoneguessr/api/lambda/` patterns. → Need to verify mock mode still works after BFF removal.
- **[No hot-reload for API]** Changing an API file requires restarting `vercel dev`. → Acceptable for now; frontend hot-reloads via Modern.js.
