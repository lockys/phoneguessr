## Why

PhoneGuessr fills the gap for a daily casual game targeting phone enthusiasts. The Wordle-style daily mechanic drives retention through habit formation, while time-based competitive scoring and leaderboards add social motivation. The phone identification concept is visually engaging and taps into a passionate niche audience of casual phone nerds who follow flagship releases.

## What Changes

- Add a daily phone guessing game with progressive image reveal (6 guesses, cropped photo expands on wrong answers)
- Add autocomplete-based guess input with brand/model feedback (wrong brand, right brand wrong model, correct)
- Add time-based scoring with wrong-guess penalties
- Add Google OAuth authentication (optional - anonymous play allowed, auth required for leaderboard)
- Add daily, weekly, monthly, and all-time leaderboards
- Add Wordle-style spoiler-free share cards
- Add PWA support for home screen installation
- Add curated phone dataset (~100-150 flagships from last 4-5 years with stock press photos)

## Capabilities

### New Capabilities
- `daily-puzzle`: Daily puzzle selection, one puzzle per day globally, random phone assignment, no past puzzle access
- `game-play`: Core game loop - progressive crop reveal, autocomplete guess input, brand/model feedback, timer, 6-guess limit
- `scoring`: Time-based scoring with wrong-guess time penalties, DNF handling for failed attempts
- `leaderboard`: Daily rankings by time score, weekly/monthly/all-time rankings by total wins, auth-gated recording
- `user-auth`: Google OAuth login, anonymous play support, user profile for leaderboard identity
- `share-card`: Wordle-style spoiler-free result sharing with emoji grid and game link
- `phone-data`: Curated phone dataset management - brands, models, stock press photos, autocomplete search

### Modified Capabilities

(None - greenfield project)

## Impact

- **New codebase**: Modern.js application with React frontend and BFF backend
- **Database**: PostgreSQL for users, puzzles, guesses, and leaderboard data
- **External dependencies**: Google OAuth API, stock phone press photos (sourced and stored)
- **Infrastructure**: Web server hosting, PostgreSQL instance, static asset storage for phone images
- **APIs**: BFF endpoints for puzzle fetching, guess submission, leaderboard queries, auth flow
