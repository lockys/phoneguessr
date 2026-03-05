## 1. Mock Data Module

- [x] 1.1 Create `src/mock/data.ts` with in-memory phone dataset (20 phones with ids, brands, models)
- [x] 1.2 Create `src/mock/state.ts` with in-memory game state (daily puzzle, guess tracking per session)

## 2. Placeholder Images

- [x] 2.1 Create a script to generate SVG placeholder images for each phone in the mock dataset
- [x] 2.2 Run the script to generate SVGs in `public/phones/`

## 3. Mock BFF Endpoints

- [x] 3.1 Create mock `api/lambda/puzzle/today.ts` that returns fixed puzzle from mock data
- [x] 3.2 Create mock `api/lambda/phones.ts` that returns mock phone list
- [x] 3.3 Create mock `api/lambda/guess.ts` with in-memory feedback logic
- [x] 3.4 Create mock `api/lambda/result.ts` that accepts and returns success
- [x] 3.5 Create mock `api/lambda/auth/me.ts` returning fake user
- [x] 3.6 Create mock `api/lambda/auth/login.ts` that sets mock cookie and redirects
- [x] 3.7 Create mock `api/lambda/auth/logout.ts` that clears cookie and redirects
- [x] 3.8 Create mock `api/lambda/leaderboard/daily.ts` with sample entries
- [x] 3.9 Create mock `api/lambda/leaderboard/weekly.ts` with sample entries
- [x] 3.10 Create mock `api/lambda/leaderboard/monthly.ts` with sample entries
- [x] 3.11 Create mock `api/lambda/leaderboard/all-time.ts` with sample entries

## 4. Wiring

- [x] 4.1 Add conditional mock/real switching in each BFF endpoint based on `MOCK_API` env var
- [x] 4.2 Add `dev:mock` script to `package.json` (`MOCK_API=true modern dev`)
- [x] 4.3 Verify `pnpm dev:mock` starts and the game is playable end-to-end with mock data
