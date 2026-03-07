## Context

Google OAuth is working with scope `openid profile email`. The callback (`api/auth/callback.ts`) fetches userinfo from Google and extracts `sub`, `name`, and `picture`, ignoring `email`. User game data (results, guesses, streaks, hints) exists in the database linked via `userId` foreign keys, but the profile panel only shows aggregate stats (games played, wins, win rate, streaks). No game history is surfaced.

## Goals / Non-Goals

**Goals:**
- Store email from Google OAuth in the users table
- Expose all user profile data (name, avatar, email) through auth endpoints and UI
- Add an API endpoint to fetch paginated game history for the authenticated user
- Display game history in the profile panel (date, puzzle number, result, guess count, score)

**Non-Goals:**
- Email verification or email-based login (Google handles this)
- Storing additional Google fields (locale, given_name, family_name) — not useful yet
- Game replay or detailed guess-by-guess history view
- Admin/moderation features

## Decisions

### 1. Add email column to users table
Add `email varchar(255) nullable unique` to the users table. Nullable because existing users won't have email until they re-authenticate. Use a drizzle migration.

**Alternative considered**: Separate user_profiles table — unnecessary complexity for a single field.

### 2. Game history API returns joined results + puzzle data
`GET /api/profile/history` returns results joined with daily_puzzles and phones tables, ordered by puzzle date descending. Paginated with limit/offset query params (default 20 per page).

**Alternative considered**: Separate endpoints for results and puzzles — would require multiple round-trips on the client.

### 3. Display history as a scrollable list in ProfilePanel
Add a "Game History" section below stats in the existing ProfilePanel component. Each row shows: date, puzzle number, result (win/loss icon), guess count, and score. Lazy-load more results on scroll.

**Alternative considered**: Separate history page/route — overkill for a single-panel mobile app with swipe navigation.

### 4. Email included in JWT and auth/me response
Add email to the JWT payload and `/api/auth/me` response so the frontend has it without extra API calls. JWT already includes displayName and avatarUrl.

## Risks / Trade-offs

- **Existing users have no email** → Email column is nullable. Email populates on next Google login. Profile shows "not available" if null.
- **JWT size increase** → Minimal (email adds ~30 bytes). Well within cookie limits.
- **Migration on production** → Adding a nullable column is non-breaking. No downtime needed.
