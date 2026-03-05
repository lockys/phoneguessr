## 1. Phone Data Schema Expansion

- [ ] 1.1 Add releaseYear (integer), priceTier (enum: budget/mid-range/flagship), formFactor (enum: bar/flip/fold), and difficulty (enum: easy/medium/hard) columns to phones table in Drizzle schema
- [ ] 1.2 Create phone_facts table (id, phoneId FK, factText string, factType string, createdAt)
- [ ] 1.3 Generate and run database migration for new columns and table
- [ ] 1.4 Update seed script with metadata for all existing phones
- [ ] 1.5 Update MOCK_PHONES in mock/data.ts with releaseYear, priceTier, formFactor, difficulty fields

## 2. Streak System

- [ ] 2.1 Add streaks table (id, userId FK, currentStreak int, bestStreak int, lastPlayedDate date, milestone7 bool, milestone30 bool, milestone100 bool) or add columns to users table
- [ ] 2.2 Generate and run database migration for streak tracking
- [ ] 2.3 Implement GET /api/streak endpoint (both Vercel + BFF layers) with mock mode support
- [ ] 2.4 Update POST /api/result to recalculate and persist streak on game completion
- [ ] 2.5 Add mock streak data handler returning { currentStreak: 5, bestStreak: 12, milestones }
- [ ] 2.6 Build streak counter component in game header (flame icon + number)
- [ ] 2.7 Build streak section in Profile panel (current, best, milestone badges)
- [ ] 2.8 Build streak break notification for returning players
- [ ] 2.9 Add i18n keys for streak UI across all 5 locales

## 3. Hint System

- [ ] 3.1 Add hints table (id, userId FK, puzzleId FK, hintType enum, createdAt) to Drizzle schema
- [ ] 3.2 Generate and run database migration for hints table
- [ ] 3.3 Implement POST /api/hint endpoint (both layers) — validate hint type, check limit, return hint value + penalty
- [ ] 3.4 Add mock mode hint handler returning data from MOCK_PHONES
- [ ] 3.5 Build hint button row component (Brand/Year/Price Tier pills below autocomplete)
- [ ] 3.6 Add hint confirmation UI showing "+15s penalty" before reveal
- [ ] 3.7 Integrate hint penalty into score calculation (elapsed + guesses×10 + hints×15)
- [ ] 3.8 Persist hint state in localStorage for page refresh recovery
- [ ] 3.9 Add i18n keys for hint UI across all 5 locales

## 4. Proximity Feedback

- [ ] 4.1 Update POST /api/guess response to include proximity object { sameYear, sameTier, sameFormFactor }
- [ ] 4.2 Add proximity calculation logic comparing guess phone metadata with answer phone metadata
- [ ] 4.3 Handle graceful degradation when metadata is null on either phone
- [ ] 4.4 Update mock guess handler to compute proximity from MOCK_PHONES metadata
- [ ] 4.5 Build proximity badge pills ("Same Year", "Same Tier", "Same Style") in guess history rows
- [ ] 4.6 Add i18n keys for proximity badges across all 5 locales

## 5. Difficulty Tiers

- [ ] 5.1 Implement difficulty-aware daily puzzle selection: select from specific tier based on rotation schedule
- [ ] 5.2 Add rotation logic that prevents consecutive Hard puzzles and ensures weekly variety
- [ ] 5.3 Update GET /api/puzzle/today response to include difficulty field
- [ ] 5.4 Build difficulty badge component (colored circle + label) displayed near puzzle number
- [ ] 5.5 Add difficulty to result modal
- [ ] 5.6 Add i18n keys for difficulty labels across all 5 locales

## 6. Yesterday's Puzzle Reveal

- [ ] 6.1 Implement GET /api/puzzle/yesterday endpoint (both layers) returning phone data, facts, and community stats
- [ ] 6.2 Add community stats aggregation query (total players, win rate, avg guesses for yesterday's puzzle)
- [ ] 6.3 Add mock mode yesterday handler with sample MOCK_PHONES data
- [ ] 6.4 Build yesterday reveal UI section with phone image, name, facts list, and community stats
- [ ] 6.5 Add cache headers for 24-hour cacheability on yesterday endpoint
- [ ] 6.6 Add i18n keys for yesterday reveal across all 5 locales

## 7. Enhanced Share Card

- [ ] 7.1 Update share text generator to use colored square emojis (🟥🟨🟩) instead of ❌🟡✅
- [ ] 7.2 Add difficulty indicator (🟢/🟡/🔴 + label) to share text header
- [ ] 7.3 Add streak count (🔥N) to share text when streak >= 2
- [ ] 7.4 Add hint count (💡×N) and time (⏱️) to share text footer
- [ ] 7.5 Update ResultModal to show share card preview with new format
- [ ] 7.6 Update score breakdown in ResultModal to show hint penalty separately
- [ ] 7.7 Add i18n keys for share card enhancements across all 5 locales

## 8. Testing

- [ ] 8.1 Write tests for hint API endpoint (valid request, limit exceeded, duplicate type, mock mode)
- [ ] 8.2 Write tests for streak calculation (increment, reset on miss, reset on DNF, milestone tracking)
- [ ] 8.3 Write tests for proximity feedback computation (all match, no match, missing metadata)
- [ ] 8.4 Write tests for difficulty rotation logic (no consecutive hard, weekly variety)
- [ ] 8.5 Write tests for yesterday API endpoint (normal case, no yesterday, mock mode)
- [ ] 8.6 Write tests for updated score calculation with hint penalty
- [ ] 8.7 Write tests for share text generation with all new fields
