## 1. Root Dev Script

- [x] 1.1 Add `"dev": "vercel dev"` script to root `package.json`
- [x] 1.2 Verify `npm run dev` starts the dev server at localhost:3000

## 2. Verify All API Endpoints Locally

- [x] 2.1 Test `GET /api/phones` returns 120 phones
- [x] 2.2 Test `GET /api/puzzle/today` returns puzzle data with puzzleId and imageUrl
- [x] 2.3 Test `GET /api/puzzle/image` returns base64 image data
- [x] 2.4 Test `GET /api/puzzle/yesterday` returns data or 404
- [x] 2.5 Test `GET /api/leaderboard/daily` returns entries array
- [x] 2.6 Test `GET /api/auth/me` returns user or null
- [x] 2.7 Test `POST /api/guess` accepts a guess and returns feedback
- [x] 2.8 Test `POST /api/result` accepts a result and returns score
- [x] 2.9 Test `POST /api/hint` accepts a hint request and returns hint data
- [x] 2.10 Test `GET /api/profile/stats` returns stats or 401
- [x] 2.11 Test `POST /api/profile/update` returns success or 401

## 3. Verify Mock Mode

- [x] 3.1 Run `npm run dev:mock` in phoneguessr/ and confirm the dev server starts
- [x] 3.2 Verify mock game flow works (puzzle loads, guess submits, result shows)

## 4. Verify Frontend Game Flow

- [x] 4.1 Open localhost:3000 in browser — app loads without console errors
- [x] 4.2 Daily puzzle image renders from `/api/puzzle/image`
- [x] 4.3 Phone autocomplete populates from `/api/phones`

## 5. Commit and Deploy

- [ ] 5.1 Commit all pending changes (flat-file routes, rewrites, removed BFF, updated configs)
- [ ] 5.2 Push to GitHub and verify Vercel deployment succeeds
- [ ] 5.3 Test production API endpoints return correct responses
