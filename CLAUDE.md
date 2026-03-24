# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Run from the **repository root** for full-stack dev (frontend + API via Vercel):
```bash
npm run dev
```

Run from `phoneguessr/` for frontend-only dev with mocked API responses:
```bash
npm run dev:mock
```

All other commands run from `phoneguessr/`:
```bash
npm run test          # Run unit tests (Vitest)
npm run lint          # Biome lint + format check
npm run build         # Production build

# Run a single test file
npx vitest run src/components/Game.test.tsx

# Database
npm run db:generate   # Generate Drizzle migration from schema changes
npm run db:migrate    # Apply migrations
npm run db:push       # Push schema directly (dev only)
npm run db:seed       # Seed phone catalog from phone-data.json

# Phone image pipeline (run in order)
npx tsx scripts/fetch-wikimedia-images.ts --dry-run   # Preview Wikimedia images
npx tsx scripts/fetch-wikimedia-images.ts --overwrite  # Update manifest
npx tsx scripts/collect-images.ts                      # Download + process images
npx tsx scripts/validate-phone-data.ts                 # Validate phone-data.json
```

## Architecture

PhoneGuessr is a daily phone-guessing game (like GeoGuessr for smartphones). Players identify phones from progressively revealed cropped photos.

### Request flow

```
Browser → Vercel Edge
  → /api/*        → api/*.ts (serverless functions, Node 20)
  → /*            → phoneguessr/dist/ (React SPA, built by Modern.js/Rspack)
```

The `vercel.json` at root wires this together. URL rewrites strip action params (e.g. `/api/puzzle/:action` → `/api/puzzle?action=:action`).

### Backend (`api/`)

Each file is a Vercel serverless function. Key files:
- `puzzle.ts` — Daily puzzle logic, anti-cheat image serving (JWT-protected crop levels)
- `guess.ts` / `result.ts` — Game turn handling and result persistence
- `hint.ts` — Progressive hint system
- `phones.ts` — Phone catalog + autocomplete
- `profile.ts` — User stats, game history
- `leaderboard.ts` — Daily/weekly/monthly/all-time rankings
- `auth/` — Google OAuth callback, session cookies, WebAuthn passkey flows

Sessions use JWT cookies via `jose`. Auth helpers are in `phoneguessr/src/lib/auth.ts` and `phoneguessr/src/lib/cookies.ts`.

### Frontend (`phoneguessr/src/`)

React 19 SPA built with Modern.js (Rspack). Key structure:
- `routes/` — Page-level components (Modern.js file-based routing)
- `components/` — UI components; `Game.tsx` is the central game orchestrator
- `lib/` — Auth context, API client, game state utilities, streak logic
- `mock/` — Mock API middleware loaded when `MOCK_API=true` (mirrors real API shape)
- `locales/` — i18n JSON files (en, zh-TW, zh-CN, ja, ko) via i18next

Path alias: `@/*` maps to `src/*`.

### Database (`phoneguessr/src/db/`)

PostgreSQL via Neon (serverless), managed with Drizzle ORM. Schema file: `schema.ts`. Migration history in `drizzle/`. The `phones` table is populated from `phone-data.json` at seed time.

### Phone image pipeline (`phoneguessr/scripts/`)

Three-stage pipeline for the phone catalog:
1. `fetch-wikimedia-images.ts` — Queries Wikimedia Commons API for CC-licensed phone images, writes `press-kit-manifest.json`
2. `collect-images.ts` — Downloads manifest URLs, processes with Sharp (resize to 800px, JPEG <200KB), outputs to `config/public/phones/`
3. `generate-placeholders.ts` — Generates blur placeholders for loading states

`brand-config.ts` holds the canonical list of 130+ brands with their difficulty tiers. `validate-phone-data.ts` checks catalog integrity.

### Testing

Unit tests use Vitest + jsdom + `@testing-library/react`. Mock data lives in `src/mock/data.ts` and must stay in sync with `phone-data.json` (5 brands: Apple, Samsung, Google, OnePlus, Nothing).

E2E tests use `agent-browser` (browser automation) and run via `npm run test:e2e` from `phoneguessr/`.

For verifying UI changes or debugging visual issues, use the **Chrome DevTools MCP** (`mcp__chrome-devtools__*` tools). Start the dev server first (`npm run dev` or `npm run dev:mock`), then use `mcp__chrome-devtools__navigate_page`, `mcp__chrome-devtools__take_screenshot`, `mcp__chrome-devtools__get_console_message`, and `mcp__chrome-devtools__evaluate_script` to inspect the running app without leaving the session.

### Linting

Biome handles both formatting and linting. Single quotes, arrow parens as-needed, 80-char line width. Scripts directory is excluded from Biome checks. CI runs lint before tests.
