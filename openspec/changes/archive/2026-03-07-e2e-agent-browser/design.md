## Context

PhoneGuessr has 21 specs with ~80+ defined scenarios but no E2E test coverage. The app runs as a Modern.js SPA with Vercel serverless functions. Mock mode (`npm run dev:mock`) provides a fully functional environment without database dependency, making it ideal for E2E testing.

`agent-browser` is a Vercel Labs CLI tool for AI-driven browser automation, built on Playwright. It uses semantic ref-based selectors (@e1, @e2) and compact snapshot output optimized for AI context efficiency.

## Goals / Non-Goals

**Goals:**
- Automated E2E test suite covering core spec scenarios
- Tests run against mock mode (no database, no Google OAuth needed)
- Traceability: each test references the spec it validates
- Simple shell script execution — no test framework dependency
- CI-ready with `npm run test:e2e`

**Non-Goals:**
- 100% spec scenario coverage in v1 (prioritize critical paths)
- Visual regression testing (screenshots for debugging only)
- Production environment testing (mock mode only)
- Performance benchmarking

## Decisions

### 1. Shell scripts over test framework
**Choice:** Each test is a standalone shell script using `agent-browser` CLI commands.

**Rationale:** agent-browser is CLI-first. Shell scripts keep tests simple, readable, and framework-free. No Vitest/Jest plumbing needed. A runner script orchestrates execution and reports pass/fail.

**Alternative:** Playwright test runner — heavier, duplicates agent-browser capabilities.

### 2. Test against mock mode
**Choice:** All E2E tests run against `npm run dev:mock` (port 8081 or next available).

**Rationale:** Mock mode has deterministic data (fixed puzzle, known phone list, fake auth). No database setup, no Google OAuth, no network flakiness. Tests are reproducible.

**Alternative:** Test against `vercel dev` with real DB — flaky, requires credentials, puzzle changes daily.

### 3. Test suite organization by spec area
**Choice:** Group tests by feature area matching spec names:
- `e2e/gameplay.sh` — game-play, scoring, reveal-animation specs
- `e2e/navigation.sh` — swipe-navigation, swipe-hints specs
- `e2e/auth.sh` — user-auth spec (mock mode: always logged in)
- `e2e/leaderboard.sh` — leaderboard spec
- `e2e/i18n.sh` — i18n-framework, language-selector specs
- `e2e/share.sh` — share-card spec

**Rationale:** Matches spec structure for traceability. Each script is small and focused.

### 4. Runner script with pass/fail reporting
**Choice:** `e2e/run.sh` starts mock server, runs all test scripts, reports results, kills server.

**Rationale:** Single entry point for CI. Manages server lifecycle. Reports which tests passed/failed with exit code.

## Risks / Trade-offs

- **agent-browser stability** → It's from Vercel Labs (experimental). Pin version in package.json.
- **Shell scripts less ergonomic than test framework** → Acceptable for the scope; can migrate later if needed.
- **Mock mode doesn't test real auth flow** → Production auth tested separately via manual or API tests.
- **Snapshot refs (@e1) may change between runs** → Use `snapshot -i` fresh before each interaction, don't hardcode refs.
