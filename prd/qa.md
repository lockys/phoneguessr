# Role: QA Engineer

## Responsibilities
- Verify features work correctly in both mock and production modes
- Test across browsers (Chrome, Safari, Firefox) and mobile viewports
- Validate i18n strings render correctly in all 5 locales
- Identify edge cases and regression risks
- Verify accessibility basics (keyboard nav, screen reader labels)

## Test Environments
- **Local mock:** `cd phoneguessr && npm run dev:mock` (no database required)
- **Local production:** `cd phoneguessr && npm run dev` (requires PostgreSQL)
- **Deployed:** Vercel preview/production URLs

## Test Areas

### Gameplay
- [ ] Daily puzzle loads with correct image
- [ ] Autocomplete filters phones after 2+ characters typed
- [ ] Keyboard navigation (arrow keys, Enter, Escape) works in autocomplete
- [ ] Feedback shows correct status: wrong brand (red), right brand (yellow), correct (green)
- [ ] Blocks reveal progressively with each wrong guess
- [ ] Timer starts on "Start" tap and stops on game end
- [ ] Game state persists in localStorage across page refreshes
- [ ] Confetti fires on correct guess (~600ms duration)
- [ ] Game over modal shows after win or 6 failed guesses

### Auth
- [ ] Google sign-in redirects and returns with session
- [ ] Sign-out clears session
- [ ] Auth state persists across page refreshes
- [ ] Unauthenticated users can still play (localStorage mode)

### Profile
- [ ] Stats display correctly (played, wins, win rate, streak, best)
- [ ] Display name field is editable when authenticated
- [ ] Language selector changes locale immediately
- [ ] Save button shows "Saved!" feedback

### Leaderboard
- [ ] Tabs switch between daily/weekly/monthly/all-time
- [ ] Entries display rank, name, guesses, score/wins
- [ ] Empty state shows prompt message

### i18n
- [ ] Switch language and verify all visible text updates
- [ ] No missing translation keys (check console for warnings)
- [ ] RTL not required (all supported languages are LTR)

### Mobile
- [ ] Swipe navigation between panels works smoothly
- [ ] Touch targets are at least 44px
- [ ] No horizontal overflow or layout breaks on 375px width
- [ ] Virtual keyboard doesn't obscure the autocomplete dropdown
