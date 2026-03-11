## Context

PhoneGuessr has 19 test files with 244 tests, covering utility libraries (scoring, proximity, share, difficulty, streak), a few UI components (GuessHistory, GuessDistribution, ProfilePanel, Onboarding, YesterdayReveal, HintButtons, viewport-ui), mock infrastructure, and schema validation. However, the most critical code paths have zero test coverage:

- **Game.tsx** (270 lines) — the core game component handling state machine transitions, fetch orchestration, localStorage/DB restoration, guess submission, and result saving. Zero tests.
- **11 API endpoints** (api/*.ts, api/auth/*.ts) — puzzle, guess, result, phones, leaderboard, profile, hint, and 4 auth endpoints. Zero unit tests. The excluded `tests/api-endpoints.test.ts` tests against a live mock server (integration), not the handler functions directly.
- **Auth utilities** (auth.ts) — JWT session creation/verification, cookie options. Zero tests.
- **19 untested components** — AuthButton, Leaderboard, ResultModal, PhoneAutocomplete, SwipeContainer, CropReveal, BlockGrid, Confetti, Timer, PageIndicator, SwipeHints, LanguageSelector, AboutPanel.

The existing mock mode (`npm run dev:mock`) and E2E scripts (`e2e/*.sh` via agent-browser) cover happy paths but cannot catch regressions in individual functions.

## Goals / Non-Goals

**Goals:**
- 80%+ test coverage for Game.tsx, API endpoint handlers, and auth utilities
- 60%+ overall project test coverage
- Unit tests for all 11 API endpoints testing handler logic directly (mocked DB)
- Component tests for Game.tsx covering all state transitions and fetch orchestration
- Tests for untested high-value components: ResultModal, PhoneAutocomplete, AuthButton, Leaderboard
- Auth utility tests for JWT creation/verification and cookie serialization

**Non-Goals:**
- 100% coverage (diminishing returns on simple components like Confetti, PageIndicator)
- E2E test expansion (existing agent-browser scripts are sufficient for now)
- Visual regression testing
- Performance testing or load testing
- Testing third-party libraries (drizzle, jose, react-i18next)

## Decisions

### 1. Unit test API handlers by mocking `db` and auth functions
**Choice:** Mock `../phoneguessr/src/db/index.js` to provide a fake `db` object with chainable `.select().from().where()` patterns. Mock `verifySessionToken` to return test session data. Call the exported `GET`/`POST` handler functions directly with constructed `Request` objects.

**Alternative:** Use MSW (Mock Service Worker) to intercept HTTP — adds a dependency and tests the fetch layer rather than handler logic.

**Rationale:** The API handlers are Vercel serverless functions that export `GET`/`POST` accepting a `Request` and returning a `Response`. They can be imported and called directly in Vitest. Mocking `db` at the module level isolates business logic from the database driver. This is the lightest-weight approach with the most precise assertions.

### 2. Component tests use @testing-library/react with mocked fetch
**Choice:** Use the existing `vi.mock` pattern for `react-i18next` and `../lib/auth-context` (as seen in GuessHistory.test.tsx). Use `vi.stubGlobal('fetch', ...)` to mock fetch responses for API calls. No MSW.

**Alternative:** Install MSW for component tests.

**Rationale:** The codebase already has established mock patterns with `vi.mock` and `vi.stubGlobal`. Staying consistent reduces cognitive overhead. MSW adds a dependency and setup complexity that is not justified for the test volume.

### 3. Test organization: colocate component tests, API tests in tests/ directory
**Choice:** Component test files are colocated next to the component (e.g., `src/components/Game.test.tsx` alongside `Game.tsx`). API endpoint tests go in `phoneguessr/tests/` directory. Auth utility tests colocate at `src/lib/auth.test.ts`.

**Alternative:** All tests in a separate `__tests__/` directory.

**Rationale:** Follows the existing pattern — component tests like `GuessHistory.test.tsx` are already colocated. The `tests/` directory at phoneguessr root already contains the integration-style endpoint tests. Auth tests colocate with auth.ts for discoverability.

### 4. Remove excluded test files from vitest config, replace with proper unit tests
**Choice:** Keep `tests/api-endpoints.test.ts`, `tests/frontend-game-flow.test.ts`, and `tests/validation.test.ts` excluded from vitest (they require a running server). Create new proper unit test files that mock dependencies and run in jsdom/node environment.

**Alternative:** Fix the excluded files to work without a running server.

**Rationale:** The excluded files serve as integration tests against a live server. They have a different purpose than the unit tests we are adding. Keeping them excluded preserves their intent while new unit tests cover the same logic with mocked dependencies.

### 5. Prioritize by risk: Game.tsx > API endpoints > auth > components
**Choice:** Implement tests in this order:
1. Game.tsx — highest risk, most complex state management, zero coverage
2. API endpoint handlers — business logic, auth checks, DB queries
3. Auth utilities — session token creation/verification
4. High-value components — ResultModal, PhoneAutocomplete, AuthButton, Leaderboard

**Rationale:** Game.tsx is the component most likely to regress during feature development. API endpoints handle data integrity and authorization. Auth is security-critical but relatively simple. Remaining components are important but lower risk.

## Risks / Trade-offs

- **[Mocking drizzle query chains]** The `db.select().from().where().innerJoin()...` chain is verbose to mock. Mitigated by creating a reusable mock factory in a test helper file (`src/test/mock-db.ts`) that returns chainable objects with configurable return values.
- **[Game.tsx fetch orchestration]** Game.tsx has a complex useEffect that calls 3 APIs concurrently. Mocking all fetch calls requires careful ordering. Mitigated by creating a helper that maps URL patterns to mock responses.
- **[Test environment mismatch]** API handlers run in Node.js (Vercel Edge/Serverless), component tests run in jsdom. API handler tests should use `// @vitest-environment node` pragma. Mitigated by explicitly setting the environment per test file.
- **[Maintaining mock fidelity]** As the API evolves, mocks may drift from real implementations. Mitigated by keeping the integration tests (excluded files) as a safety net that can be run manually against the mock server.
