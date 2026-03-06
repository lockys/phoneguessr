## Context

PhoneGuessr is a daily phone guessing game with core gameplay shipped: progressive image reveal, autocomplete guessing, 6-guess limit, time-based scoring, leaderboards, and social sharing. The game has 20 phones from 5 brands.

The current retention loop is: open app → play puzzle → see score → leave. There's no reason to return beyond curiosity about tomorrow's puzzle. Successful daily games (Wordle, Connections) add streaks, strategic depth, richer feedback, and social hooks that create daily habits.

Current tech stack: React 19 frontend, Hono serverless API on Vercel, PostgreSQL via Drizzle ORM, Google OAuth, i18next for 5 locales.

## Goals / Non-Goals

**Goals:**
- Define 6 retention mechanics with clear user stories and acceptance criteria
- Ensure each mechanic integrates with existing scoring, sharing, and leaderboard systems
- Keep mechanics simple enough for v1 — no accounts required for core features
- Specs must be implementable by backend/frontend engineers without ambiguity

**Non-Goals:**
- Implementing any of these mechanics (this is spec-only)
- Monetization (no paid hints, premium tiers, or ads)
- Multiplayer or real-time features
- Achievement/badge system beyond streak milestones
- Phone catalog expansion (separate spec: phone-data-expansion)

## Decisions

### D1: Hint penalty is additive time, not guess penalty
**Decision**: Each hint adds 15 seconds to the player's elapsed time rather than consuming a guess slot.
**Rationale**: Consuming a guess slot would reduce the image reveal progression, making hints counterproductive. Time penalty maintains the strategic trade-off without affecting the 6-guess core loop. 15s is roughly the penalty of one wrong guess (10s) plus a 50% premium for the information advantage.
**Alternative rejected**: Flat score penalty (e.g., +20 points) — less intuitive since players think in time, not abstract points.

### D2: Max 2 hints per game, 3 distinct types
**Decision**: Players can use at most 2 of 3 available hint types (brand, release year, price tier) per game.
**Rationale**: 3 hints would trivialize most puzzles. 2 forces a strategic choice: which 2 pieces of information are most valuable for narrowing down the answer? This creates meaningful decision-making.
**Alternative rejected**: Unlimited hints with escalating penalty — removes the strategic constraint that makes hints interesting.

### D3: Streaks require winning, not just playing
**Decision**: A streak day counts only when the player wins (guesses correctly within 6 attempts). DNF breaks the streak.
**Rationale**: Streaks should represent skill, not just attendance. This aligns with Wordle where losing breaks your streak. It gives DNF emotional weight beyond just the leaderboard miss.
**Alternative rejected**: Play-based streaks (any attempt counts) — removes consequence of losing, weakens retention loop.

### D4: No streak grace period in v1
**Decision**: Missing a day breaks the streak immediately. No freeze or grace period.
**Rationale**: Loss aversion is the retention mechanism. Grace periods weaken it. Wordle doesn't have grace periods and has excellent retention. Can reconsider in v2 if player feedback demands it.

### D5: Difficulty is a phone property, not a game mode
**Decision**: Each phone has a difficulty tag (easy/medium/hard). The daily puzzle shows the difficulty level but all players get the same phone. No separate difficulty-based game modes.
**Rationale**: Splitting the player base across difficulty modes fragments the social experience (different puzzles = can't compare results). A single daily puzzle with a visible difficulty indicator preserves the shared experience while adding variety.
**Alternative rejected**: Separate easy/medium/hard daily puzzles — fragments leaderboards and social sharing.

### D6: Proximity feedback is additive, not replacing existing feedback
**Decision**: The existing wrong_brand/right_brand/correct feedback remains. Proximity signals (same year, same price tier, same form factor) appear as additional badges on wrong guesses.
**Rationale**: The three-tier feedback is simple and well-understood. Adding proximity as supplementary information enriches without complicating the core. Players who ignore proximity badges can still play normally.

### D7: Yesterday's reveal shows after today's game
**Decision**: Yesterday's phone and facts are visible in a dedicated section (accessible anytime), not as a pre-game gate.
**Rationale**: Gating today's game behind yesterday's reveal adds friction. Making it always-accessible creates a "browse and learn" behavior without blocking the primary action (playing today's puzzle).

### D8: Share card uses colored squares, not emoji icons
**Decision**: Share text uses 🟥 (wrong brand), 🟨 (right brand), 🟩 (correct) square emojis rather than ❌🟡✅.
**Rationale**: Square emojis render consistently across platforms and create a cleaner visual grid (like Wordle). The existing ❌🟡✅ are fine for in-game display but squares are better for sharing.

## Risks / Trade-offs

- **Phone metadata dependency** → Proximity feedback and difficulty tiers require releaseYear, priceTier, and formFactor on all phones. These don't exist yet. Mitigation: phone-data-expansion spec handles this; proximity feedback gracefully degrades when metadata is missing.
- **Streak tracking requires auth** → Anonymous players can't have server-side streaks. Mitigation: Use localStorage for anonymous streak tracking; server-side for authenticated users. Merge on first login.
- **Hint system adds API complexity** → New POST /api/hint endpoint with per-puzzle-per-user tracking. Mitigation: Keep hint state in the existing guesses/results flow rather than a separate table if possible.
- **Share card breaking change** → Changing from ❌🟡✅ to 🟥🟨🟩 changes existing share format. Mitigation: This is the right time since the game is pre-launch; no backwards compatibility needed.

## Open Questions

- Should yesterday's reveal include the phone's market price, or is that too commercially loaded?
- Should streak milestones unlock cosmetic rewards (profile borders, titles) or just badges?
- Should the difficulty indicator influence leaderboard ranking (e.g., hard puzzle scores weighted favorably)?
