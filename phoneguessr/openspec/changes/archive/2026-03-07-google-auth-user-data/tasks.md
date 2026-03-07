## 1. Database: Add email column

- [x] 1.1 Add `email` column (varchar 255, nullable, unique) to users table in `phoneguessr/src/db/schema.ts`
- [x] 1.2 Run `npm run db:generate` to create the migration
- [x] 1.3 Run `npm run db:push` to apply the migration to the database

## 2. Auth: Capture and expose email

- [x] 2.1 Update `api/auth/callback.ts` to extract `email` from Google userinfo and pass it to the user upsert query
- [x] 2.2 Update the user upsert SQL in callback to include email on both INSERT and UPDATE (ON CONFLICT)
- [x] 2.3 Update `phoneguessr/src/lib/auth.ts` to include `email` in the JWT payload (createSession and verifySession)
- [x] 2.4 Update `api/auth/me.ts` to return `email` in the user response
- [x] 2.5 Update `phoneguessr/src/lib/auth-context.tsx` User type to include `email: string | null`

## 3. API: Game history endpoint

- [x] 3.1 Create `api/profile/history.ts` — GET endpoint returning user's results joined with daily_puzzles and phones, ordered by puzzleDate desc
- [x] 3.2 Support `limit` and `offset` query params (default limit=20, offset=0) and return `total` count
- [x] 3.3 Return 401 for unauthenticated requests
- [x] 3.4 Add Vercel rewrite rule in `vercel.json` for `/api/profile/history`

## 4. UI: Authenticated user profile view

- [x] 4.1 Replace login button area with user profile card when authenticated: show avatar image, display name, and email
- [x] 4.2 Show avatar in AuthButton header area (replace plain text name with avatar + name)
- [x] 4.3 Display user email below display name in ProfilePanel (show "Not available" if null)
- [x] 4.4 Ensure login button is fully hidden when user is authenticated (already works in ProfilePanel and AuthButton — verify no other login buttons exist)
- [x] 4.5 Add game history section below stats with list of past results (date, puzzle #, win/loss, guesses, score)
- [x] 4.6 Add empty state message when user has no game history
- [x] 4.7 Implement infinite scroll / "load more" to fetch additional history pages
- [x] 4.8 Add CSS styles for the user profile card and game history list

## 5. Verification

- [ ] 5.1 Test auth flow: sign in with Google and verify email is stored and returned (manual — requires deployed env)
- [ ] 5.2 Test history API: verify paginated results with correct data shape (manual — requires deployed env)
- [ ] 5.3 Test profile UI: verify email display and game history rendering (manual — requires deployed env)
- [x] 5.4 Run `npm run lint` and `npm run test` to confirm no regressions
