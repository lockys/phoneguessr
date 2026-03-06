# API Design: New Game Mechanics

**Date:** 2026-03-05
**Author:** Tech Lead
**Status:** Proposed

## Overview

Design the API surface for PhoneGuessr's v1 game mechanics expansion. This covers 3 new endpoints, modifications to 2 existing endpoints, and supporting schema changes.

## Current API Surface

```
GET  /api/auth/me              — session check
GET  /api/auth/login           — OAuth redirect
GET  /api/auth/callback        — OAuth callback
GET  /api/auth/logout          — clear session
GET  /api/puzzle/today         — daily puzzle data
GET  /api/puzzle/image         — base64 phone image
GET  /api/phones               — phone catalog
POST /api/guess                — submit guess
POST /api/result               — submit game result
GET  /api/profile/stats        — player stats
GET  /api/leaderboard/:period  — leaderboard data
```

## New Endpoints

### 1. POST /api/hint

Request a hint for the current puzzle. Requires authentication. Max 2 hints per puzzle.

**Request:**
```json
{ "puzzleId": 42, "hintType": "brand" | "year" | "price_tier" }
```

**Response (200):**
```json
{ "hint": "Samsung", "penalty": 15, "hintsUsed": 1, "hintsRemaining": 1 }
```

**Error responses:**
- `401` — not authenticated
- `400 { "error": "invalid_hint_type" }` — hintType not in allowed values
- `409 { "error": "max_hints_reached" }` — already used 2 hints this puzzle
- `409 { "error": "puzzle_completed" }` — puzzle already finished

**Design notes:**
- Penalty is recorded in the `hints` table, applied during score calculation in `POST /api/result`
- Score formula becomes: `score = elapsed_seconds + (wrong_guesses × 10) + (hints_used × 15)`
- Anonymous users can use hints client-side only (no server tracking)

### 2. GET /api/puzzle/yesterday

Returns yesterday's puzzle answer with phone details, fun facts, and community stats.

**Response (200):**
```json
{
  "phone": {
    "brand": "Samsung",
    "model": "Galaxy S24 Ultra",
    "imageUrl": "/api/puzzle/image?date=2026-03-04",
    "releaseYear": 2024,
    "priceTier": "flagship"
  },
  "facts": [
    "First Galaxy S series with a flat display since the S7",
    "Features a built-in S Pen with Bluetooth"
  ],
  "stats": {
    "totalPlayers": 142,
    "winRate": 0.73,
    "avgGuesses": 3.2
  }
}
```

**Error responses:**
- `404 { "error": "no_yesterday_puzzle" }` — no puzzle exists for yesterday (e.g., game just launched)

**Design notes:**
- Same response for all users (highly cacheable)
- No authentication required
- Stats aggregated from `results` table
- Facts come from `phone_facts` table (optional — empty array if none)

### 3. GET /api/streak

Returns the authenticated user's streak data and milestones.

**Response (200):**
```json
{
  "currentStreak": 7,
  "bestStreak": 14,
  "lastPlayedDate": "2026-03-05",
  "milestones": {
    "7day": true,
    "30day": false,
    "100day": false
  }
}
```

**Response (200, anonymous):**
```json
{ "currentStreak": 0, "bestStreak": 0, "lastPlayedDate": null, "milestones": { "7day": false, "30day": false, "100day": false } }
```

**Design notes:**
- Derived from `results` table — no separate streaks table
- Query: count consecutive days with a win result, walking backwards from today
- Best streak: maximum consecutive winning days ever
- Anonymous users get zeroed response (streaks tracked client-side via localStorage)
- A "day" is defined by UTC date, matching `dailyPuzzles.puzzleDate`

### 4. POST /api/profile/update

Update the authenticated user's display name.

**Request:**
```json
{ "displayName": "PhoneExpert99" }
```

**Response (200):**
```json
{ "success": true }
```

**Error responses:**
- `401` — not authenticated
- `400 { "error": "invalid_display_name" }` — empty, >50 chars, or contains HTML/script

**Design notes:**
- Sanitize: strip HTML tags, trim whitespace, enforce 1-50 character limit
- The frontend already calls this endpoint but no backend exists

## Modified Endpoints

### 5. POST /api/guess — Enhanced Feedback

Current response: `{ "feedback": "wrong_brand" | "right_brand" | "correct" }`

**New response:**
```json
{
  "feedback": "wrong_brand",
  "details": {
    "sameYear": true,
    "samePriceTier": false,
    "sameFormFactor": true
  }
}
```

**Design notes:**
- `details` is only populated when feedback is `wrong_brand` or `right_brand`
- When feedback is `correct`, `details` is omitted (no need)
- Requires phone metadata columns (`releaseYear`, `priceTier`, `formFactor`)
- Backward compatible — existing clients can ignore `details`

### 6. GET /api/puzzle/today — Difficulty Indicator

Current response: `{ "puzzleId", "puzzleNumber", "puzzleDate", "imageUrl" }`

**New response adds:**
```json
{
  "puzzleId": 42,
  "puzzleNumber": 156,
  "puzzleDate": "2026-03-05",
  "imageUrl": "/api/puzzle/image",
  "difficulty": "medium"
}
```

**Design notes:**
- Difficulty comes from the phone's `difficulty` column
- Values: `"easy"`, `"medium"`, `"hard"`
- Daily rotation: Mon/Thu = easy, Tue/Fri = medium, Wed/Sat = hard, Sun = random
- Puzzle selection filters by difficulty for the day

### 7. POST /api/result — Hint Penalty Integration

Current score formula: `score = elapsed_seconds + (wrong_guesses × 10)`

**New formula:** `score = elapsed_seconds + (wrong_guesses × 10) + (hints_used × 15)`

**Design notes:**
- Query `hints` table for the user's hints on this puzzle
- Add penalty to score before persisting
- No change to request/response shape — penalty is applied server-side

## Schema Changes

### New columns on `phones` table:
```sql
ALTER TABLE phones ADD COLUMN release_year integer;
ALTER TABLE phones ADD COLUMN price_tier varchar(20);      -- 'budget' | 'mid' | 'flagship'
ALTER TABLE phones ADD COLUMN form_factor varchar(20);     -- 'bar' | 'flip' | 'fold'
ALTER TABLE phones ADD COLUMN difficulty varchar(20);      -- 'easy' | 'medium' | 'hard'
```

All nullable for backward compatibility with existing data.

### New `hints` table:
```sql
CREATE TABLE hints (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id),
  puzzle_id integer NOT NULL REFERENCES daily_puzzles(id),
  hint_type varchar(20) NOT NULL,    -- 'brand' | 'year' | 'price_tier'
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX hints_user_puzzle_type_idx ON hints(user_id, puzzle_id, hint_type);
```

### New `phone_facts` table:
```sql
CREATE TABLE phone_facts (
  id serial PRIMARY KEY,
  phone_id integer NOT NULL REFERENCES phones(id),
  fact_text text NOT NULL,
  fact_type varchar(50),             -- 'spec' | 'history' | 'trivia'
  created_at timestamp NOT NULL DEFAULT now()
);
```

## Mock Mode Behavior

Every endpoint must check `IS_MOCK` before `useHonoContext()`:

- **POST /api/hint**: Return mock hint data from `MOCK_PHONES` metadata
- **GET /api/puzzle/yesterday**: Return previous mock phone with hardcoded facts
- **GET /api/streak**: Return `{ currentStreak: 5, bestStreak: 12, ... }`
- **POST /api/profile/update**: Return `{ success: true }` (no-op)
- **POST /api/guess**: Add mock `details` based on `MOCK_PHONES` metadata
- **GET /api/puzzle/today**: Add mock `difficulty` field

## Share Card (No API Changes)

The share card emoji grid is generated entirely client-side from the guess history already in state/localStorage. No new API endpoint needed.

Format:
```
PhoneGuessr #156 4/6 🔥7

🟥🟥🟨🟩

phoneguessr.com
```

The streak count (🔥7) is appended from the streak data fetched via `GET /api/streak`.

## Caching Strategy

| Endpoint | Cache | TTL |
|----------|-------|-----|
| GET /api/puzzle/yesterday | CDN/edge | 24h (changes daily at UTC midnight) |
| GET /api/phones | CDN/edge | 1h (rarely changes) |
| GET /api/streak | None | Per-user, real-time |
| POST /api/hint | None | Mutating |

## Rate Limiting

Not implemented in v1. Vercel Hobby plan has built-in request limits. If abuse becomes an issue, add rate limiting to `POST /api/guess` and `POST /api/hint` (10 req/min per IP).
