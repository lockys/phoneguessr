## Why

Google auth is now working, but we only store googleId, displayName, and avatarUrl. The OAuth scope already requests `openid profile email`, so email and other profile fields are available but discarded. Users also have game history (results, guesses, streaks, hints) in the database linked to their user ID, but none of this is surfaced in the profile UI. We need to capture all available Google profile data and display the user's game history.

## What Changes

- Capture email from Google OAuth userinfo response and store it in the users table
- Add `email` column to users table (nullable varchar, unique)
- Update the auth callback to extract and persist email alongside existing fields
- Include email in the JWT session payload and auth/me response
- Build a game history section in the profile panel showing past puzzle results
- Create an API endpoint to fetch user game history (results with puzzle details)
- Display user's Google profile data (avatar, name, email) in the profile panel

## Capabilities

### New Capabilities
- `user-game-history`: API endpoint and UI to display a user's past game results, including puzzle date, guess count, win/loss, score, and streak info

### Modified Capabilities

## Impact

- `api/auth/callback.ts` — extract email from Google userinfo
- `phoneguessr/src/db/schema.ts` — add email column to users table
- `phoneguessr/src/lib/auth.ts` — include email in JWT
- `api/auth/me.ts` — return email in user data
- `phoneguessr/src/lib/auth-context.tsx` — include email in User type
- `phoneguessr/src/components/ProfilePanel.tsx` — display email and game history
- New API endpoint: `api/profile/history.ts`
- Database migration for email column
