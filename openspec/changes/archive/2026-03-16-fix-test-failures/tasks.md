## 1. Fix puzzle.test.ts database crash

- [x] 1.1 Add `vi.mock('../db/index.js')` to `src/lib/puzzle.test.ts` before any imports that trigger database initialization
- [x] 1.2 Verify `puzzle.test.ts` tests run without crashing

## 2. Fix state.test.ts stale assertions

- [x] 2.1 Identify the mock phone used by `getMockHint` (the daily puzzle phone) and its `releaseYear` and `priceTier` values
- [x] 2.2 Update the `year` hint test assertion from `'Unknown'` to the actual `releaseYear` value
- [x] 2.3 Update the `price_tier` hint test assertion from `'Unknown'` to the actual `priceTier` value
- [x] 2.4 Verify both `state.test.ts` hint tests pass

## 3. Verify full suite

- [x] 3.1 Run `npx vitest run` and confirm 0 failures (390/390 pass)
