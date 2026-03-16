# Role: QA Engineer

## Responsibilities
- Write unit tests and E2E tests for all features
- Verify features work correctly in both mock and production modes
- Test across browsers (Chrome, Safari, Firefox) and mobile viewports
- Validate i18n strings render correctly in all 5 locales
- Identify edge cases and regression risks

## Test Environments
- **Local mock:** `cd phoneguessr && npm run dev:mock` (no database required)
- **Local production:** `vercel dev` (requires Neon PostgreSQL)
- **Deployed:** Vercel preview/production URLs

## Key Files
- `phoneguessr/vitest.config.ts` — Test configuration
- `phoneguessr/src/test/` — Test setup and helpers
- `phoneguessr/src/components/*.test.tsx` — Component tests
- `phoneguessr/tests/` — API handler tests
- `e2e/` — E2E test scripts (agent-browser)

---

## Current Tasks

### Change: test-coverage (Comprehensive test suite)

> OpenSpec: `openspec/changes/test-coverage/`
> Read: proposal.md, design.md, specs/test-coverage/spec.md

Test infrastructure:
- [x] Create `phoneguessr/src/test/mock-db.ts` — reusable drizzle db mock factory with chainable `.select().from().where().innerJoin().orderBy().limit()`
- [x] Create `phoneguessr/src/test/mock-fetch.ts` — URL pattern → JSON response mapper for `vi.stubGlobal('fetch')`
- [x] Create `phoneguessr/src/test/mock-auth.ts` — helper to create test session tokens and build Request objects with cookies

Game.tsx tests (HIGHEST PRIORITY):
- [x] Create `phoneguessr/src/components/Game.test.tsx` — loading state, ready state, start → playing, correct guess → won, 6 wrong → lost, localStorage restoration, DB restoration for authed user, DB fallback to localStorage, onboarding for first-time users

API endpoint tests:
- [x] `phoneguessr/tests/puzzle-handler.test.ts` — all 5 puzzle actions (today, image, yesterday, state, invalid). Use `// @vitest-environment node`
- [x] `phoneguessr/tests/guess-handler.test.ts` — correct/right_brand/wrong_brand feedback, auth saving, 404s
- [x] `phoneguessr/tests/result-handler.test.ts` — 401, 409 duplicate, score calculation, successful save
- [x] `phoneguessr/tests/phones-handler.test.ts` — returns active phones with correct shape
- [x] `phoneguessr/tests/leaderboard-handler.test.ts` — daily by score, weekly/monthly/all-time by wins, 400 invalid
- [x] `phoneguessr/tests/profile-handler.test.ts` — 401, stats calculation, display name validation
- [x] `phoneguessr/tests/hint-handler.test.ts` — 401, 400 invalid type, 409 completed, 409 max hints, success

Auth tests:
- [x] `phoneguessr/src/lib/auth.test.ts` — token round-trip, tampered rejection, cookie options
- [x] `phoneguessr/src/lib/cookies.test.ts` — parseCookies, serializeCookie with all flags
- [x] `phoneguessr/tests/auth-login-handler.test.ts` — redirect to Google with correct params
- [x] `phoneguessr/tests/auth-callback-handler.test.ts` — success flow, missing code, token exchange failure
- [x] `phoneguessr/tests/auth-me-handler.test.ts` — valid session returns user, invalid returns null
- [x] `phoneguessr/tests/auth-logout-handler.test.ts` — cookie cleared, redirect to /

Component tests:
- [x] `ResultModal.test.tsx` — win/loss display, share button, sign-in prompt, close handlers
- [x] `PhoneAutocomplete.test.tsx` — filtering, dropdown, keyboard nav (ArrowDown/Up/Enter/Escape)
- [x] `AuthButton.test.tsx` — signed-out/in states, auth error from URL
- [x] `Leaderboard.test.tsx` — daily fetch/display, tab switching, loading/empty states

Config and verification:
- [x] Update `vitest.config.ts` — add coverage config targeting 60% overall
- [x] Run `npm run test` — all 244 existing + new tests pass
- [x] Run `npx vitest --coverage` — 80%+ for Game.tsx, API, auth; 60%+ overall

### Change: image-anti-cheat (Verification)

> OpenSpec: `openspec/changes/image-anti-cheat/`
> Read: design.md, tasks.md

- [x] Write unit tests for `generateCrop` (dimensions at each level, level 5 = full image)
- [x] Write unit tests for image token sign/verify (valid, expired, tampered)
- [x] Verify network tab shows only cropped region at each guess level
- [x] Verify requesting higher level than guesses returns 403
- [x] Verify JWT token flow for unauthenticated users
- [x] Verify full image only served after game completion
- [x] Verify crop dimensions match expected zoom levels visually
- [x] Verify reveal animation works correctly
- [x] Verify mock mode progressive crops work

### Change: passkey-auth (Verification)

> OpenSpec: `openspec/changes/passkey-auth/`
> Read: tasks.md

- [x] Test e2e: Google sign-in → register passkey → verify credential in DB
- [ ] Test e2e: sign out → sign in with passkey → verify session created
- [ ] Test error cases: expired challenge, invalid assertion, unauthenticated registration
- [ ] Test WebAuthn feature detection (passkey UI hidden on unsupported browsers)
- [x] Test mock API mode for all passkey endpoints
- [x] Verify existing Google OAuth flow unaffected

### Change: phone-image-collection (Validation)

> OpenSpec: `openspec/changes/phone-image-collection/`
> Read: specs/phone-data/spec.md

- [ ] Create validation script (`phoneguessr/scripts/validate-phone-data.ts`)
- [ ] Validate 100+ distinct brands in final dataset
- [ ] Validate difficulty distribution (20% easy, 25% medium, 30% hard)
- [ ] Validate image integrity (valid JPEG, non-empty, <200KB)
- [ ] Validate backward compatibility (original 20 phones unchanged)
- [ ] Run seed script against database
- [ ] Run full end-to-end: scrape → process → validate → seed

---

## Existing QA Checklist

### Gameplay
- [x] Daily puzzle loads with correct image
- [x] Autocomplete filters phones after 2+ characters typed
- [x] Keyboard navigation works in autocomplete
- [x] Feedback shows correct status (wrong brand, right brand, correct)
- [x] Timer starts on "Start" and stops on game end
- [x] Game state persists across page refreshes
- [x] Confetti fires on correct guess
- [x] Game over modal shows after win or 6 failed guesses

### Auth
- [x] Google sign-in redirects and returns with session
- [ ] Passkey sign-in works with biometric prompt *(BLOCKED: no frontend passkey UI implemented)*
- [x] Sign-out clears session
- [x] Auth state persists across page refreshes
- [x] Unauthenticated users can still play (localStorage mode)

### Mobile
- [x] Swipe navigation between panels works smoothly
- [ ] Touch targets are at least 44px *(FAIL: sign-out 33px, save 36px, close 28px, leaderboard tabs 33px height)*
- [x] No horizontal overflow on 375px width
- [ ] Virtual keyboard doesn't obscure autocomplete dropdown *(cannot verify without real device)*
