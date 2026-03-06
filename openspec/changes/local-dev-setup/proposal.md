## Why

Local development currently requires `vercel dev` to run serverless functions against the Neon database, but several pieces are broken or incomplete: the old BFF lambda directory still exists in git history, uncommitted route changes (flat files + rewrites) haven't been deployed, the frontend components reference API endpoints that need verification end-to-end, and there's no documented workflow for "npm run dev → test → push → deploy". Without a reliable local dev loop, every change requires a push-and-pray deployment cycle.

## What Changes

- Commit and verify all pending infrastructure changes (flat-file API routes, removed BFF plugin, Vercel rewrites, updated configs)
- Ensure every API endpoint works locally via `vercel dev` against the Neon database
- Verify the frontend loads and can complete a full game flow locally (puzzle fetch → guess → result)
- Verify Vercel production deployment succeeds after push
- Add a `dev` script to root `package.json` for ergonomic local startup

## Capabilities

### New Capabilities
- `local-dev-workflow`: Documents and verifies the local development workflow — `npm run dev` starts `vercel dev`, all API routes work against Neon, frontend renders correctly

### Modified Capabilities
- `deployment`: Update deployment spec to reflect flat-file API routes with rewrites (replacing dynamic `[action].ts` routes) and add local dev requirements
- `mock-api`: Verify mock mode (`npm run dev:mock`) still works as a fallback when no database is available

## Impact

- `vercel.json` — rewrites for puzzle/leaderboard/profile routes
- `api/*.ts` — flat-file routes replacing directory-based dynamic routes
- `phoneguessr/modern.config.ts` — BFF plugin removed
- `phoneguessr/package.json` — packageManager field removed
- `package.json` (root) — dev script addition
- `.ralphy/config.yaml` — already updated with current architecture rules
