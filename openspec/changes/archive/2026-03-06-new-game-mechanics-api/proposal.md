# New Game Mechanics API

## Summary

Add API endpoints and schema changes for PhoneGuessr's v1 game mechanics: hint system, streak tracking, yesterday's puzzle reveal, enhanced guess feedback, difficulty tiers, and profile updates.

## Motivation

The current API supports core gameplay (guess, result, leaderboard) but lacks the retention and depth mechanics needed for v1: hints add strategic depth, streaks drive daily engagement, yesterday's reveal creates a learning loop, and enhanced feedback makes wrong guesses more informative.

## Capabilities

### New
- **hint-system**: POST /api/hint — request hints with score penalty
- **streak-tracking**: GET /api/streak — streak data with milestones
- **yesterday-reveal**: GET /api/puzzle/yesterday — yesterday's answer + facts + stats
- **profile-update**: POST /api/profile/update — update display name
- **phone-metadata**: Extended phone schema for feedback details and difficulty

### Modified
- **enhanced-feedback**: POST /api/guess gains `details` field with attribute comparisons
- **difficulty-tiers**: GET /api/puzzle/today gains `difficulty` field

## Design Decisions

1. **No streaks table** — derive from results table to avoid sync issues
2. **Hint penalty at result time** — keeps scoring logic centralized
3. **Phone metadata as nullable columns** — backward compatible with existing data
4. **Share card is client-only** — no API changes needed
