## 1. Root Dev Script

- [ ] 1.1 Add `"dev": "vercel dev"` script to root `package.json`
- [ ] 1.2 Verify `npm run dev` starts the dev server at localhost:3000

## 2. Verify All API Endpoints Locally

- [ ] 2.1 Test `GET /api/phones` returns 120 phones
- [ ] 2.2 Test `GET /api/puzzle/today` returns puzzle data with puzzleId and imageUrl
- [ ] 2.3 Test `GET /api/puzzle/image` returns base64 image data
- [ ] 2.4 Test `GET /api/puzzle/yesterday` returns data or 404
- [ ] 2.5 Test `GET /api/leaderboard/daily` returns entries array
- [ ] 2.6 Test `GET /api/auth/me` returns user or null
- [ ] 2.7 Test `POST /api/guess` accepts a guess and returns feedback
- [ ] 2.8 Test `POST /api/result` accepts a result and returns score
- [ ] 2.9 Test `POST /api/hint` accepts a hint request and returns hint data
- [ ] 2.10 Test `GET /api/profile/stats` returns stats or 401
- [ ] 2.11 Test `POST /api/profile/update` returns success or 401

## 3. Verify Mock Mode

- [ ] 3.1 Run `npm run dev:mock` in phoneguessr/ and confirm the dev server starts
- [ ] 3.2 Verify mock game flow works (puzzle loads, guess submits, result shows)

## 4. Verify Frontend Game Flow

- [ ] 4.1 Open localhost:3000 in browser — app loads without console errors
- [ ] 4.2 Daily puzzle image renders from `/api/puzzle/image`
- [ ] 4.3 Phone autocomplete populates from `/api/phones`

## 5. Commit and Deploy

- [ ] 5.1 Commit all pending changes (flat-file routes, rewrites, removed BFF, updated configs)
- [ ] 5.2 Push to GitHub and verify Vercel deployment succeeds
- [ ] 5.3 Test production API endpoints return correct responses
