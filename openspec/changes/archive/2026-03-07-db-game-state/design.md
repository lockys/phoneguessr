## Context

Game.tsx currently uses localStorage (`phoneguessr_YYYY-MM-DD`) as the sole source of truth for game state restoration. The database already receives writes via `POST /api/guess` (each guess) and `POST /api/result` (final outcome) for authenticated users, but no read path exists. This creates a write-only database for game state — data goes in but is never read back by the game component.

The `api/puzzle.ts` handler already uses a `switch(action)` pattern with a Vercel rewrite (`/api/puzzle/:action` → `?action=:action`), making it trivial to add a new `state` action without new routing config.

## Goals / Non-Goals

**Goals:**
- Database becomes the source of truth for authenticated users' game state
- Authenticated users can restore in-progress or completed games from the database on reload
- Anonymous users retain full functionality via localStorage (zero behavior change)

**Non-Goals:**
- Migrating existing localStorage data to the database
- Changing the database schema (all needed tables/columns already exist)
- Modifying mock mode behavior (stays on localStorage)
- Adding offline support or sync conflict resolution

## Decisions

### Extend existing puzzle API instead of new endpoint file
**Choice:** Add `case 'state'` to `api/puzzle.ts` switch statement
**Alternative:** Create `api/puzzle/state.ts` as a separate file
**Rationale:** The existing `/api/puzzle/:action` rewrite pattern in `vercel.json` already routes to `api/puzzle.ts`. Adding a case to the switch is simpler, requires no config changes, and follows the established pattern.

### Join guesses with phones table for name reconstruction
**Choice:** `SELECT phones.brand, phones.model` via `INNER JOIN` on `guesses.phoneId`
**Rationale:** The `guesses` table stores `phoneId`, not the display name. Joining with `phones` reconstructs the `"Brand Model"` format that `Game.tsx` expects. This avoids denormalizing phone names into the guesses table.

### Skip localStorage entirely for authenticated users (not dual-write)
**Choice:** Authenticated users write to DB only; anonymous users write to localStorage only
**Alternative:** Write to both localStorage and DB for authenticated users
**Rationale:** Dual-write creates inconsistency risk and makes it unclear which is the source of truth. Clean separation: DB path for authed, localStorage path for anon.

## Risks / Trade-offs

- **[Network latency on load]** → DB fetch adds a round-trip before game state renders. Mitigated by running the fetch concurrently with puzzle/phone data fetches, and the existing loading state already handles the async gap.
- **[Auth state race condition]** → `user` from `useAuth()` may not be populated when the initial useEffect runs. Mitigated by including `user` awareness in the initialization logic — if `user` is null, falls through to localStorage immediately.
- **[DB fetch failure]** → Network error or 401 on `/api/puzzle/state` falls back to localStorage check, ensuring the game remains playable even if the DB read fails.
- **[Mid-game state]** → If a user has guesses but no result (closed browser mid-game), the endpoint returns guesses without win/loss status. Game.tsx resumes in `playing` state with the timer running.
