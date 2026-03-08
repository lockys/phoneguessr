# Role: Backend Engineer

## Responsibilities
- Design and implement API endpoints in `api/` (Vercel serverless functions)
- Manage database schema, migrations, and queries using Drizzle ORM + Neon PostgreSQL
- Handle authentication flow (Google OAuth, passkeys, session tokens via `jose`)
- Implement server-side image processing with `sharp`
- Keep serverless functions small to stay within Vercel Hobby plan limits

## Standards
- All endpoints use Web API Request/Response (no Hono, no BFF plugin)
- Use typed request/response shapes — no `any` types
- Database operations must be wrapped in try/catch with meaningful error responses
- Mock mode must return realistic data matching production shapes
- All imports use `.js` extensions for ESM compatibility
- Dynamic routes use flat files + Vercel rewrites in vercel.json

## Key Files
- `api/` — API endpoint handlers (root level, not phoneguessr/)
- `phoneguessr/src/db/` — Database schema, migrations, seed data
- `phoneguessr/src/mock/` — Mock data and state for local development
- `phoneguessr/src/lib/` — Shared utilities (auth, session, cookies)

## Review Checklist
- [x] Endpoint returns correct status codes (200, 400, 401, 403, 404, 500)
- [x] No sensitive data (tokens, secrets) leaked in responses
- [x] Database queries are parameterized (no SQL injection)
- [x] Mock mode handler returns same shape as production
- [x] Vercel rewrites configured for new routes

---

## Current Tasks

### Change: image-anti-cheat (Server-side progressive crops)

> OpenSpec: `openspec/changes/image-anti-cheat/`
> Read: proposal.md, design.md, specs/progressive-image-serving/spec.md

- [x] Add `sharp` as production dependency
- [x] Create `phoneguessr/src/lib/image-crop.ts` — `generateCrop(imagePath, level)` returns cropped base64 using centered crop from ZOOM_LEVELS `[4.17, 2.5, 1.79, 1.39, 1.14, 1.0]`
- [x] Define shared ZOOM_LEVELS constants file importable by server and client
- [x] Create `phoneguessr/src/lib/image-token.ts` — `signImageToken`/`verifyImageToken` using jose with `IMAGE_TOKEN_SECRET` env var, expires at midnight UTC
- [x] Modify `image` case in `api/puzzle.ts` to accept `level` query parameter (default: 0)
- [x] Authenticated users: query guesses table to validate level ≤ guessCount; check results table to allow any level after game end
- [x] Unauthenticated users: validate JWT token param; first request (no token) gets level 0
- [x] Call `generateCrop(imagePath, level)` to produce cropped base64
- [x] Include signed token in response for unauthenticated users
- [x] Update mock API to support `level` parameter (skip validation in mock mode)

### Change: passkey-auth (WebAuthn biometric login)

> OpenSpec: `openspec/changes/passkey-auth/`
> Read: proposal.md, design.md, specs/passkey-auth/spec.md

- [x] Install `@simplewebauthn/server` (v11+) in project root
- [x] Add env vars: `WEBAUTHN_RP_ID`, `WEBAUTHN_RP_NAME`, `WEBAUTHN_ORIGIN` with dev defaults
- [x] Create `phoneguessr/src/lib/webauthn.ts` — RP config helpers reading from env vars
- [x] Add `passkey_credentials` table to schema.ts (id, userId FK, credentialId text unique, publicKey text, counter integer, transports text, createdAt)
- [x] Run drizzle-kit generate and push migration
- [x] Create `phoneguessr/src/lib/challenge-store.ts` — in-memory Map with 60s TTL
- [x] Create `api/auth/passkey/register-options.ts` — GET, requires session, generates registration options, stores challenge
- [x] Create `api/auth/passkey/register.ts` — POST, requires session, verifies registration, upserts credential
- [x] Create `api/auth/passkey/login-options.ts` — POST, no auth, accepts optional email, generates auth options
- [x] Create `api/auth/passkey/login.ts` — POST, no auth, verifies assertion, updates counter, creates session via `createSessionToken()`
- [x] Add Vercel rewrites in vercel.json for `/api/auth/passkey/*` routes
- [x] Add mock routes for all 4 passkey endpoints in mock/middleware.ts

### Change: phone-image-collection (Expand phone catalog)

> OpenSpec: `openspec/changes/phone-image-collection/`
> Read: proposal.md, design.md, specs/phone-image-pipeline/spec.md

- [x] Install `cheerio` and `sharp` as dev dependencies
- [x] Create `phoneguessr/scripts/collect-images.ts` with CLI structure
- [x] Define brand config array mapping 130+ brands to GSMArena URL slugs
- [x] Implement HTTP fetch wrapper with 1-2s delay, User-Agent, retry logic
- [x] Implement brand listing page parser using cheerio (with pagination)
- [x] Implement phone detail page parser (image URL, release date, form factor)
- [x] Implement image download to staging directory with resumability
- [x] Implement sharp image processing: max 800px width, JPEG, <200KB, skip <200x200
- [x] File naming: lowercase kebab-case (+ → -plus, strip parens, collapse hyphens)
- [x] Per-brand model selection: top 2-5 by popularity, brand tier config
- [x] Extract metadata: releaseYear, priceTier, formFactor, difficulty
- [x] Generate phone-data.json entries, merge with existing 20 phones
- [x] Add `collect-images` npm script, `.staging/` to .gitignore
