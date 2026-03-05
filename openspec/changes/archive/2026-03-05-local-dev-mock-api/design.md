## Context

PhoneGuessr's BFF endpoints currently depend on PostgreSQL (via Drizzle ORM) and Google OAuth. Local development requires a running database and OAuth credentials, which slows iteration on frontend/game UI work. We need a zero-dependency mock API that mimics the real endpoints with in-memory data.

## Goals / Non-Goals

**Goals:**
- Run the full game UI locally with `pnpm dev:mock` and zero infrastructure
- Provide realistic mock data (phones, puzzles, guesses, leaderboard entries)
- Maintain stateful game logic (guesses accumulate, game ends after 6)
- Make it trivial to switch between mock and real APIs

**Non-Goals:**
- Mocking at the database layer (we mock at the API response level)
- Persisting mock state across server restarts
- Supporting mock OAuth redirect flow (just auto-login as a fake user)

## Decisions

### 1. Replace BFF lambdas with mock versions via environment variable

**Choice**: When `MOCK_API=true`, the BFF lambda files import from a shared mock data module and return static/in-memory responses instead of hitting the database.

**Why**: Keeps mock code co-located with real code. No separate mock server process needed. The Modern.js dev server serves everything.

**Alternatives considered**:
- Separate Express mock server on a different port: Extra process, CORS issues, port management
- MSW (Mock Service Worker): Client-side only, doesn't mock BFF server-side calls
- SQLite in-memory DB: Still requires running Drizzle migrations, more complexity than needed

### 2. In-memory state for game session

**Choice**: A simple JavaScript Map keyed by date stores the current game state (guesses made, feedback). Resets on server restart.

**Why**: Sufficient for local dev. No persistence needed - just enough to play through a daily puzzle during a dev session.

### 3. SVG placeholder images instead of real photos

**Choice**: Generate simple colored SVG placeholders with the phone brand/model text. Stored as static files in `public/phones/`.

**Why**: Eliminates the stock photo sourcing blocker entirely for dev. Each phone gets a visually distinct placeholder. No external dependencies.

## Risks / Trade-offs

- **[Mock drift]** → Mock responses could diverge from real API shape over time. Mitigation: Mock data uses the same TypeScript types as real endpoints.
- **[Missing edge cases]** → Mocks won't surface DB-specific issues (constraints, race conditions). Mitigation: Acceptable - this is for UI dev, not integration testing.
