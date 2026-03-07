## Why

The project has 21 OpenSpec specs defining requirements and scenarios but zero automated E2E tests to verify them. Manual testing doesn't scale — regressions slip through on every deploy. We need automated E2E coverage that exercises the real app through a browser, matching the scenarios already defined in specs.

## What Changes

- Install `agent-browser` as a dev dependency for AI-driven browser automation
- Create E2E test scripts covering the core gameplay loop, auth flow, navigation, leaderboard, i18n, and profile
- Tests run against `npm run dev:mock` (no database dependency) for CI reliability
- Test scripts are shell-based, using `agent-browser` CLI commands (open, snapshot, fill, click, screenshot)
- Each test maps to specific spec scenarios for traceability

## Capabilities

### New Capabilities
- `e2e-testing`: E2E test infrastructure and test suite using agent-browser, covering scenarios from existing specs

### Modified Capabilities
_None — existing specs define what to test, this change adds the test automation layer._

## Impact

- **New files**: `e2e/` directory with test scripts and a runner
- **Dependencies**: `agent-browser` added as devDependency
- **CI**: New `npm run test:e2e` script in `phoneguessr/package.json`
- **No production code changes** — tests only exercise existing behavior
