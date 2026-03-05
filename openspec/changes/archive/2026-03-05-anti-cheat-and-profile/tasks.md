## 1. Image Protection — Backend API

- [x] 1.1 Create `api/lambda/puzzle/image.ts` GET endpoint that reads today's puzzle image from disk, encodes as base64 data URL, and returns `{ imageData: "data:image/..." }`
- [x] 1.2 Update `api/lambda/puzzle/today.ts` to return `imageUrl: "/api/puzzle/image"` instead of `imagePath: phone.imagePath`
- [x] 1.3 Add mock image endpoint in `src/mock/state.ts` — read from `config/public/phones/`, convert to base64

## 2. Image Protection — Frontend

- [x] 2.1 Update Game.tsx to fetch image data from `imageUrl` endpoint and pass base64 data URL to CropReveal
- [x] 2.2 Update CropReveal.tsx to accept and render base64 data URL as image src
- [x] 2.3 Verify no phone name appears in network tab, DOM, or image src during gameplay

## 3. Profile Panel

- [x] 3.1 Create ProfilePanel component showing stats: games played, wins, win rate, current streak, best streak
- [x] 3.2 Add localStorage-based stats computation for anonymous users (scan all `phoneguessr_*` keys)
- [x] 3.3 Create `api/lambda/profile/stats.ts` GET endpoint for authenticated user stats (aggregate from results table)
- [x] 3.4 Add mock profile stats endpoint in mock state
- [x] 3.5 Add CSS for profile panel (stat cards layout, sign-in prompt)

## 4. About Panel

- [x] 4.1 Create AboutPanel component with game title, description, how-to-play rules, and author credits
- [x] 4.2 Add CSS for about panel (readable typography, section spacing)

## 5. SwipeContainer Integration

- [x] 5.1 Add ProfilePanel and AboutPanel to SwipeContainer in page.tsx — panel order: [Profile, Game, Leaderboard, About]
- [x] 5.2 Set default active panel to index 1 (Game) on load
- [x] 5.3 Update PANEL_NAMES in SwipeContainer to include all 4 panels

## 6. Verification

- [x] 6.1 Verify image loads correctly from base64 API in both mock and production modes
- [x] 6.2 Verify no phone identity leaks in network inspector or DOM
- [x] 6.3 Verify profile panel shows correct stats from localStorage
- [x] 6.4 Verify about panel renders with all content
- [x] 6.5 Verify 4-panel swipe navigation works with Game as default panel
