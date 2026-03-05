## Why

The current BFF endpoints require a running PostgreSQL database and Google OAuth credentials to function. Developers cannot run the game locally without this infrastructure, blocking frontend development and UI iteration. A mock API layer enables immediate local development with realistic data.

## What Changes

- Add mock implementations for all BFF endpoints that return static/in-memory data
- Replace database-dependent BFF lambdas with mock versions when `MOCK_API=true`
- Add placeholder phone images for development
- Create a `pnpm dev:mock` script that runs the app with mock data (no DB, no OAuth required)

## Capabilities

### New Capabilities
- `mock-api`: In-memory mock implementations of all API endpoints (puzzle, guess, phones, leaderboard, auth) with realistic sample data and stateful game logic

### Modified Capabilities

(None - mock layer sits alongside real endpoints, selected by environment variable)

## Impact

- **New files**: Mock endpoint implementations, placeholder images, dev script
- **No production code changes**: Mock layer is dev-only
- **Dependencies**: None (uses in-memory data structures)
