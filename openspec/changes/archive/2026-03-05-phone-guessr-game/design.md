## Context

PhoneGuessr is a greenfield daily guessing game built as a Modern.js application. Players identify phones from cropped stock photos, with progressive reveal on wrong guesses. The target audience is casual phone nerds - people who follow flagship releases but aren't deep into spec sheets. The project has no existing codebase.

Key constraints:
- Modern.js framework (React + BFF backend)
- PostgreSQL database
- Google OAuth for optional authentication
- PWA for mobile install
- ~100-150 curated flagship phones with stock press photos

## Goals / Non-Goals

**Goals:**
- Ship a playable daily phone guessing game with leaderboards
- Support anonymous play with optional auth for score recording
- Clean, mobile-first UI optimized for quick daily sessions
- Wordle-style social sharing to drive organic growth

**Non-Goals:**
- Native mobile apps (PWA only for v1)
- Real-time multiplayer or head-to-head modes
- User-generated content or community phone submissions
- Phone spec comparisons or educational content
- Monetization (ads, premium tiers)
- Past puzzle archive or replay

## Decisions

### 1. Modern.js with BFF over separate frontend/backend

**Choice**: Single Modern.js project with BFF layer for API endpoints.

**Why**: BFF provides type-safe frontend-to-backend function calls that auto-convert to HTTP requests. Eliminates the overhead of maintaining a separate API service, shared types package, and deployment pipeline. The game's API surface is small (~5 endpoints) and doesn't justify infrastructure complexity.

**Alternatives considered**:
- Separate Express/Fastify API: More flexibility but doubles deployment complexity for a simple game
- Serverless functions: Cold starts hurt the time-based scoring mechanic

### 2. Client-side crop masking over pre-computed crop images

**Choice**: Ship the full phone image and use CSS `clip-path` / `object-position` to progressively reveal regions.

**Why**: Eliminates the need to generate and store 6 crop variants per phone (600-900 images). Simpler content pipeline - just one high-quality photo per phone. The tradeoff is that the full image is visible in browser DevTools, but for a casual daily game, this is acceptable. Determined cheaters can always reverse-engineer the answer through other means.

**Alternatives considered**:
- Server-generated crops served per guess: Cheat-proof but 6x image storage, complex API, and added latency per guess
- Canvas-based reveal with encrypted image data: Over-engineered for a casual game

### 3. PostgreSQL over SQLite/Turso

**Choice**: PostgreSQL for all persistent data.

**Why**: Leaderboard queries (ranking, aggregation, time-window filtering) benefit from PostgreSQL's mature query planner and indexing. Weekly/monthly/all-time total-win rankings require efficient aggregation across large datasets as the user base grows. PostgreSQL also provides robust concurrent write handling for simultaneous guess submissions.

**Alternatives considered**:
- SQLite/Turso: Simpler to start but leaderboard aggregation queries at scale are a concern
- Redis for leaderboards + SQLite for data: Added operational complexity for marginal benefit at v1 scale

### 4. Deterministic daily puzzle selection

**Choice**: Use a seeded algorithm based on date (UTC) to select the daily puzzle from the phone pool. Store the mapping in a `daily_puzzles` table for auditability.

**Why**: Every player globally sees the same puzzle on the same day. UTC-based date avoids timezone confusion. Pre-computing and storing the mapping allows admin oversight and prevents the same phone appearing too frequently.

**Alternatives considered**:
- Random selection at midnight via cron: Race condition risk, harder to debug
- Manual curation: Doesn't scale, requires daily human attention

### 5. Time penalty scoring model

**Choice**: Final score = elapsed_seconds + (wrong_guesses × 10). DNF (6 wrong) = not ranked.

**Why**: Pure time rewards spam-guessing. The 10-second penalty per wrong guess makes accuracy matter while keeping time as the primary differentiator. 10 seconds is meaningful but not devastating - a player who knows the phone but takes a moment to think isn't unduly punished.

### 6. Auth-optional with anonymous play

**Choice**: No login required to play. Google OAuth only needed to save scores to leaderboard.

**Why**: Zero friction to try the game. The leaderboard acts as a natural incentive to sign in. Anonymous game state is stored in localStorage so the player can't replay the daily puzzle.

**Alternatives considered**:
- Auth required to play: Higher friction, lower conversion
- Anonymous leaderboard with nicknames: Abuse potential, no identity verification

## Risks / Trade-offs

- **[Client-side cheating]** → Full image in network tab. Mitigation: Acceptable for casual game. Could add server-side verification of guess timestamps in v2 if needed.
- **[Phone image sourcing]** → Stock press photos may have inconsistent quality/angles. Mitigation: Curate a consistent set upfront. Establish photo guidelines (back of phone, similar lighting/angle).
- **[Small phone pool exhaustion]** → 100-150 phones = ~4-5 months of unique daily puzzles. Mitigation: Phones can repeat after the pool is exhausted. Expand pool over time with new releases.
- **[Modern.js ecosystem]** → Smaller community than Next.js (5k vs 100k+ stars). Mitigation: Core needs (routing, BFF, SSR) are well-documented. Avoid relying on niche plugins.
- **[Cold start for leaderboards]** → Empty leaderboards on launch feel lonely. Mitigation: Show "Be the first to solve today's puzzle!" messaging. Weekly/all-time boards populate naturally.
