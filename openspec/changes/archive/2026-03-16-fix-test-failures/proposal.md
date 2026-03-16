## Why

Two pre-existing test failures block CI confidence: `puzzle.test.ts` crashes on database initialization in the test environment, and `state.test.ts` has stale assertions that don't match the current mock data shape. Fixing these restores a green test suite.

## What Changes

- Fix `src/lib/puzzle.test.ts`: mock or defer the `neon()` database connection so the module loads without `DATABASE_URL` in tests
- Fix `src/mock/state.test.ts`: update `getMockHint` test assertions for `year` and `price_tier` to expect actual mock phone values instead of `'Unknown'` (mock phones now have `releaseYear` and `priceTier` fields)

## Capabilities

### New Capabilities

_None — this is a bugfix to existing tests._

### Modified Capabilities

_None — no spec-level behavior changes, only test corrections._

## Impact

- `phoneguessr/src/lib/puzzle.test.ts` — test setup/mocking changes
- `phoneguessr/src/mock/state.test.ts` — assertion corrections
- `phoneguessr/src/db/index.ts` — may need lazy initialization or test-aware guard
- No API, dependency, or schema changes
