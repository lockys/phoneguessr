## 1. API Endpoint

- [x] 1.1 Add `case 'state'` to `api/puzzle.ts` — authenticate via session cookie, query guesses (joined with phones for brand+model) and results for today's puzzle, return structured response
- [x] 1.2 Verify endpoint returns correct responses: completed game, mid-game, no data, and unauthenticated

## 2. Game State Loading

- [x] 2.1 Modify `Game.tsx` useEffect to fetch `/api/puzzle/state` for authenticated users before falling back to localStorage
- [x] 2.2 Handle mid-game restoration (guesses exist, no result) by resuming in playing state with timer
- [x] 2.3 Handle DB fetch failure by falling through to localStorage check

## 3. Result Persistence

- [x] 3.1 Modify `saveResult()` in `Game.tsx` to skip localStorage write when user is authenticated and not in mock mode
- [x] 3.2 Ensure anonymous and mock mode users still write to localStorage

## 4. Verification

- [x] 4.1 Run `npm run build` — confirm clean compilation
- [x] 4.2 Run `npm run test` — confirm all tests pass
