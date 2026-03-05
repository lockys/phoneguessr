## 1. Project Setup

- [x] 1.1 Initialize Modern.js project with TypeScript, React, and BFF support
- [x] 1.2 Configure PostgreSQL connection and ORM (Drizzle or Prisma)
- [x] 1.3 Set up PWA configuration (manifest, service worker)
- [x] 1.4 Configure project directory structure (routes, api, components, lib)

## 2. Database Schema

- [x] 2.1 Create `phones` table (id, brand, model, image_path, active, created_at)
- [x] 2.2 Create `daily_puzzles` table (id, phone_id, puzzle_date, puzzle_number, created_at)
- [x] 2.3 Create `users` table (id, google_id, display_name, avatar_url, created_at)
- [x] 2.4 Create `guesses` table (id, user_id, puzzle_id, phone_id, guess_number, feedback, created_at)
- [x] 2.5 Create `results` table (id, user_id, puzzle_id, score, guess_count, is_win, elapsed_seconds, created_at)
- [x] 2.6 Write database seed script with initial phone dataset (~20 phones for development)

## 3. Phone Data & Images

- [x] 3.1 Source and download stock press photos for initial phone set (~20 flagship phones)
- [x] 3.2 Establish image naming convention and storage directory (public/phones/)
- [x] 3.3 Create phone data seed file (JSON or SQL) with brand, model, and image path

## 4. Authentication

- [x] 4.1 Set up Google OAuth 2.0 credentials and environment config
- [x] 4.2 Implement OAuth login/callback BFF endpoints
- [x] 4.3 Implement session management with secure HTTP-only cookies
- [x] 4.4 Create auth context provider (React) for client-side auth state
- [x] 4.5 Build sign-in button and auth UI components

## 5. Daily Puzzle System

- [x] 5.1 Implement deterministic puzzle selection algorithm (UTC date-seeded)
- [x] 5.2 Create BFF endpoint: GET /api/puzzle/today (returns puzzle_number, image_path, puzzle_id)
- [x] 5.3 Implement puzzle rotation logic (cycle through all phones before repeating)
- [x] 5.4 Add puzzle generation on first request of the day (lazy creation)

## 6. Core Game UI

- [x] 6.1 Build game page layout (image area, guess input, guess history, timer)
- [x] 6.2 Implement progressive crop reveal with CSS clip-path (6 levels)
- [x] 6.3 Build autocomplete input component with phone search (min 2 chars, filtered results)
- [x] 6.4 Implement guess submission and feedback display (❌ wrong brand / 🟡 right brand / ✅ correct)
- [x] 6.5 Build timer component (starts on load, stops on completion)
- [x] 6.6 Implement game state machine (playing → won/lost → showing results)
- [x] 6.7 Build game-over screen (full image reveal, score, stats)

## 7. Guess & Scoring API

- [x] 7.1 Create BFF endpoint: POST /api/guess (validate guess, return feedback)
- [x] 7.2 Implement score calculation (elapsed_seconds + wrong_guesses × 10)
- [x] 7.3 Create BFF endpoint: POST /api/result (save final result for auth'd users)
- [x] 7.4 Implement single-play enforcement (server-side for auth'd, localStorage for anon)

## 8. Leaderboard

- [x] 8.1 Create BFF endpoint: GET /api/leaderboard/daily (ranked by score ascending)
- [x] 8.2 Create BFF endpoint: GET /api/leaderboard/weekly (ranked by total wins)
- [x] 8.3 Create BFF endpoint: GET /api/leaderboard/monthly (ranked by total wins)
- [x] 8.4 Create BFF endpoint: GET /api/leaderboard/all-time (ranked by total wins)
- [x] 8.5 Build leaderboard UI with tab navigation (daily/weekly/monthly/all-time)
- [x] 8.6 Display player rank, name, guess count, and score/wins

## 9. Share Card

- [x] 9.1 Implement share text generation (emoji grid, puzzle number, guess count)
- [x] 9.2 Build share button with clipboard copy and "Copied!" confirmation
- [x] 9.3 Show share button only after puzzle completion

## 10. Polish & Anonymous Flow

- [x] 10.1 Implement anonymous play with localStorage state persistence
- [x] 10.2 Add post-completion auth prompt for anonymous users
- [x] 10.3 Build "already played today" view for returning players
- [x] 10.4 Add mobile-responsive styling and PWA home screen experience
- [x] 10.5 Handle edge cases (network errors, invalid guesses, expired puzzles at midnight)
