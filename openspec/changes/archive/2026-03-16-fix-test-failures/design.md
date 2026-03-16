## Context

The test suite has 2 pre-existing failures (2 test files, 2 failed assertions + 1 crash):

1. **`puzzle.test.ts`** crashes before any tests run because importing `src/lib/puzzle.ts` triggers `src/db/index.ts`, which calls `neon(process.env.DATABASE_URL!)` at module level. Without `DATABASE_URL` in the test environment, this throws.

2. **`state.test.ts`** has 2 failing assertions in `getMockHint`. The tests expect `'Unknown'` for `year` and `price_tier` hints, but the mock phone data now includes `releaseYear` and `priceTier` fields, so the actual values are returned instead.

## Goals / Non-Goals

**Goals:**
- All 382 tests pass (0 failures)
- No changes to production code behavior
- Tests accurately reflect current mock data shape

**Non-Goals:**
- Refactoring database initialization patterns project-wide
- Adding new test coverage
- Changing mock data structure

## Decisions

### 1. Mock `src/db/index.ts` in puzzle.test.ts

**Decision:** Add `vi.mock('../db/index.js')` to puzzle.test.ts to prevent the real database module from loading.

**Rationale:** This is the pattern already used by all other API handler tests in the project (e.g., hint-handler.test.ts, result-handler.test.ts). It's consistent and minimal.

**Alternative considered:** Making `neon()` lazy in `src/db/index.ts` — rejected because it would change production code for a test-only concern and could introduce subtle initialization ordering issues.

### 2. Update assertions in state.test.ts to match current data

**Decision:** Change the expected values from `'Unknown'` to the actual mock phone field values (`releaseYear`, `priceTier`).

**Rationale:** The mock phones were updated to include these fields when the hint system was built. The tests were written assuming the old mock data shape. The implementation is correct; the tests are stale.

## Risks / Trade-offs

- **Low risk**: Both changes are test-only. No production code is modified.
- **Coupling**: The state.test.ts fix couples assertions to specific mock phone data values. If mock data changes, tests break again. This is acceptable since mock data is stable test fixtures.
