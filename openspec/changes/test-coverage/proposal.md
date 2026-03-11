## Why

Current test coverage is approximately 33% — Game.tsx (the core component) has zero tests, all 11 API endpoints have zero unit tests, and the auth flow is completely untested. This makes it risky to refactor or add features without regressions. Both unit tests and E2E tests need expansion.

## What Changes

- Add unit tests for Game.tsx covering state management, guess submission, and localStorage/DB restoration
- Add unit tests for all API endpoints (puzzle, guess, result, phones, leaderboard, profile, auth)
- Add unit tests for auth utilities (session token creation/verification, cookie handling)
- Add E2E tests for authenticated user flows (login, play game, view profile, leaderboard)
- Add E2E tests for the complete game lifecycle (start, guess, win/lose, share)
- Target: 80%+ test coverage for critical paths

## Capabilities

### New Capabilities
- `test-coverage`: Comprehensive unit and E2E test suite for all critical application paths

### Modified Capabilities
_(none — tests don't change behavior, only verify it)_

## Impact

- **Test files**: ~15-20 new test files across unit and E2E
- **Dependencies**: May need `msw` (Mock Service Worker) for API endpoint unit testing
- **CI**: Test suite runtime will increase but remains under 30 seconds for unit tests
- **Mock infrastructure**: Expanded mock setup for database, auth, and fetch calls
