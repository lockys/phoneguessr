## 1. Test Infrastructure

- [ ] 1.1 Create `phoneguessr/src/test/mock-db.ts` — reusable mock factory for drizzle `db` object with chainable `.select().from().where().innerJoin().orderBy().limit()` patterns that return configurable data
- [ ] 1.2 Create `phoneguessr/src/test/mock-fetch.ts` — helper that maps URL patterns to mock JSON responses for use with `vi.stubGlobal('fetch', ...)`
- [ ] 1.3 Create `phoneguessr/src/test/mock-auth.ts` — helper to create test session tokens using `createSessionToken` and build `Request` objects with session cookies

## 2. Game.tsx Tests (Highest Priority)

- [ ] 2.1 Create `phoneguessr/src/components/Game.test.tsx` — mock `react-i18next`, `web-haptics/react`, `../lib/auth-context`, and global `fetch`. Test:
  - Loading state renders while APIs resolve
  - Ready state after puzzle + phones + image load (no saved state)
  - Start button click transitions to playing state with timer and autocomplete
  - Correct guess transitions to won state
  - 6 wrong guesses transitions to lost state
  - localStorage restoration for completed game
  - Database restoration for authenticated user via /api/puzzle/state
  - Database fetch failure falls back to localStorage
  - Onboarding shown for first-time users

## 3. API Endpoint Tests

- [ ] 3.1 Create `phoneguessr/tests/puzzle-handler.test.ts` — mock `db`, `getTodayPuzzle`, `getYesterdayPuzzle`, `verifySessionToken`, `fs`. Test all 5 puzzle actions (today, image, yesterday, state, invalid). Use `// @vitest-environment node` pragma.
- [ ] 3.2 Create `phoneguessr/tests/guess-handler.test.ts` — mock `db`, `verifySessionToken`. Test correct/right_brand/wrong_brand feedback, authenticated guess saving, 404 for invalid puzzle/phone.
- [ ] 3.3 Create `phoneguessr/tests/result-handler.test.ts` — mock `db`, `verifySessionToken`. Test 401 for unauthenticated, 409 for duplicate, score calculation, successful save.
- [ ] 3.4 Create `phoneguessr/tests/phones-handler.test.ts` — mock `db`. Test returns active phones with correct shape.
- [ ] 3.5 Create `phoneguessr/tests/leaderboard-handler.test.ts` — mock `db`. Test daily (ranked by score), weekly/monthly/all-time (ranked by wins), 400 for invalid period.
- [ ] 3.6 Create `phoneguessr/tests/profile-handler.test.ts` — mock `db`, `verifySessionToken`. Test 401 for unauthenticated, stats calculation (gamesPlayed, wins, winRate, streaks), display name update with validation.
- [ ] 3.7 Create `phoneguessr/tests/hint-handler.test.ts` — mock `db`, `verifySessionToken`. Test 401 for unauthenticated, 400 for invalid hint type, 409 for completed puzzle, 409 for max hints, successful hint return with brand/year/price_tier.

## 4. Auth Tests

- [ ] 4.1 Create `phoneguessr/src/lib/auth.test.ts` — test `createSessionToken` + `verifySessionToken` round-trip, rejection of tampered tokens, `getSessionCookieOptions` shape. Use `// @vitest-environment node` pragma.
- [ ] 4.2 Create `phoneguessr/src/lib/cookies.test.ts` — test `parseCookies` with multiple cookies, empty header, encoded values. Test `serializeCookie` with all option flags.
- [ ] 4.3 Create `phoneguessr/tests/auth-login-handler.test.ts` — test redirect to Google OAuth URL with correct query params.
- [ ] 4.4 Create `phoneguessr/tests/auth-callback-handler.test.ts` — mock global `fetch` (Google token + userinfo), mock `db`, mock `createSessionToken`. Test successful flow, missing code, token exchange failure.
- [ ] 4.5 Create `phoneguessr/tests/auth-me-handler.test.ts` — mock `verifySessionToken`. Test user returned for valid session, null for no/invalid session.
- [ ] 4.6 Create `phoneguessr/tests/auth-logout-handler.test.ts` — test cookie cleared with maxAge=0 and redirect to /.

## 5. Component Tests

- [ ] 5.1 Create `phoneguessr/src/components/ResultModal.test.tsx` — mock `react-i18next`, `../lib/auth-context`, `../lib/share`, `navigator.clipboard`. Test win/loss display, share button copies text, sign-in prompt for anonymous users, backdrop click closes, Escape key closes.
- [ ] 5.2 Create `phoneguessr/src/components/PhoneAutocomplete.test.tsx` — mock `react-i18next`. Test filtering with 2+ character query, dropdown display, keyboard navigation (ArrowDown/Up/Enter/Escape), selection callback.
- [ ] 5.3 Create `phoneguessr/src/components/AuthButton.test.tsx` — mock `react-i18next`, `../lib/auth-context`. Test signed-out state (sign-in button), signed-in state (avatar, name, sign-out), auth error from URL params.
- [ ] 5.4 Create `phoneguessr/src/components/Leaderboard.test.tsx` — mock `react-i18next`, global `fetch`. Test daily tab fetch and display, tab switching, loading state, empty state.

## 6. Vitest Config Update

- [ ] 6.1 Update `phoneguessr/vitest.config.ts` — add the new handler test files to the include list (or ensure they are not excluded), keep the 3 integration test files excluded. Add coverage configuration targeting 60% overall threshold.

## 7. Verification

- [ ] 7.1 Run `npm run test` — confirm all existing 244 tests still pass plus all new tests pass
- [ ] 7.2 Run `npx vitest --coverage` — confirm 80%+ coverage for Game.tsx, API handlers, and auth; 60%+ overall
- [ ] 7.3 Run `npm run build` — confirm clean compilation with no type errors
