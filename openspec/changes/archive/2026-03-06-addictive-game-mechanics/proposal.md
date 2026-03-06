## Why

PhoneGuessr has solid core gameplay but lacks the retention hooks that make daily puzzle games (Wordle, Connections, Contexto) habit-forming. Players complete a puzzle and have no reason to return tomorrow beyond curiosity. Adding streak tracking, strategic hint usage, richer feedback, and social sharing mechanics will transform single-session players into daily returnees.

## What Changes

- Add a **hint system** with score penalty trade-off — players can reveal brand, release year, or price tier at the cost of added time penalty
- Add **streak tracking** with milestones (7-day, 30-day, 100-day) and visual badges — leverages loss aversion for daily retention
- Add **difficulty tiers** (easy/medium/hard) to the phone catalog — daily puzzles rotate difficulty, creating varied challenge
- Enrich **guess feedback** with proximity signals — same year, same price tier, same form factor — making wrong guesses informative
- Add **yesterday's answer reveal** with fun facts and community stats — creates a "learn something" loop
- Enhance **share card** with Wordle-style emoji grid, streak count, and time — drives viral social sharing

## Capabilities

### New Capabilities
- `hint-system`: Strategic hint purchasing during gameplay with score penalty trade-off
- `streak-tracking`: Daily play streak counter with milestone badges and break notifications
- `difficulty-tiers`: Phone difficulty classification (easy/medium/hard) with rotating daily difficulty
- `proximity-feedback`: Rich "almost" feedback showing how close a wrong guess was
- `yesterday-reveal`: Post-game reveal of yesterday's puzzle answer with fun facts and community stats

### Modified Capabilities
- `share-card`: Add emoji grid visualization, streak count, and difficulty indicator to share text
- `scoring`: Integrate hint penalty into score calculation
- `game-play`: Add hint button row to gameplay UI; show proximity feedback in guess history
- `phone-data`: Add metadata fields (releaseYear, priceTier, formFactor, difficulty) to phone schema

## Impact

- **Database**: New tables (streaks, hints, phone_facts) and columns on phones table
- **API**: New endpoints (POST /api/hint, GET /api/streak, GET /api/puzzle/yesterday)
- **Frontend**: New UI components (hint buttons, streak counter, yesterday panel, proximity badges)
- **Phone data**: All phones need metadata enrichment (releaseYear, priceTier, formFactor, difficulty)
- **Mock system**: MOCK_PHONES needs expanded metadata; new mock handlers for hint/streak/yesterday APIs
- **i18n**: New translation keys across all 5 locales (en, zh-TW, zh-CN, ja, ko)
