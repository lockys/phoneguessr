## Why

Authenticated users' game state (guesses, results) is already saved to the database via `POST /api/guess` and `POST /api/result`, but Game.tsx only reads from localStorage. This means authenticated users lose their in-progress game on page reload if localStorage is cleared, and the database is write-only for game state. The database should be the source of truth for authenticated users.

## What Changes

- Add a `GET /api/puzzle/state` endpoint that returns today's guesses and result for the authenticated user from the database
- Game.tsx loads state from the database for authenticated users instead of localStorage
- Game.tsx skips localStorage writes for authenticated users (database is the sole storage path)
- Anonymous users continue using localStorage as before (no behavior change)

## Capabilities

### New Capabilities
- `db-game-state`: Server-side game state retrieval for authenticated users — reading back guesses and results from the database to restore game state on page load

### Modified Capabilities
- `game-play`: Authenticated users now restore game state from database instead of localStorage on page load
- `user-auth`: Authenticated users' game persistence shifts from localStorage to database as primary storage

## Impact

- **API**: New `state` action added to `api/puzzle.ts` (uses existing `/api/puzzle/:action` rewrite)
- **Frontend**: `Game.tsx` initialization logic branches on auth state; `saveResult()` conditionally skips localStorage
- **Database**: Read queries added against existing `guesses` and `results` tables (no schema changes)
- **Mock mode**: Unaffected — continues using localStorage regardless of auth state
