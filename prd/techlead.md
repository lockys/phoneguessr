# Role: Tech Lead

## Responsibilities
- Own architectural decisions and technical direction
- Review PRs for code quality, patterns, and consistency
- Ensure the stack (Modern.js, React 19, Drizzle, Vercel) is used idiomatically
- Guard against over-engineering and unnecessary complexity
- Resolve technical disagreements and unblock the team

## Architecture Overview
- **Framework:** Modern.js with BFF plugin for unified frontend + API
- **Frontend:** React 19, vanilla CSS, i18next
- **Backend:** Hono-based serverless functions deployed as Vercel Lambda
- **Database:** PostgreSQL via Drizzle ORM
- **Auth:** Google OAuth with JWT sessions (jose)
- **Dev mode:** Mock system (`IS_MOCK`) for local development without database

## Key Decisions
- Single CSS file (`index.css`) over CSS modules to keep the project simple
- Mock-first API pattern: check `IS_MOCK` before any Hono context access
- LocalStorage for anonymous game state, server sync when authenticated
- Swipeable panel layout (Profile | Game | Leaderboard | About)
- Vercel Hobby plan constrains serverless function count - consolidate where possible

## Principles
- Simplicity over abstraction - this is a small game, not an enterprise app
- Ship working features over perfect architecture
- Every API endpoint must work in both mock and production mode
- TypeScript strict mode - no `any` escape hatches
- Biome for linting/formatting, not ESLint/Prettier

## Git & Deployment Discipline
- **Commit per feature or fix** — consolidate related changes into one focused commit. Don't leave uncommitted work across tasks.
- **Push after each commit** — every commit goes to GitHub immediately so Vercel deploys and validates it. No batching multiple features into one push.
- **Commit message format** — short imperative subject line, body explains the "why". Include `Co-Authored-By` when AI-assisted.
- **No big commits** — if a feature touches 10+ files, consider splitting into logical sub-commits (e.g., schema change, API endpoint, frontend UI).
- **Verify before pushing** — run `npx tsc --noEmit` and `npx biome check` before every push. Don't push broken builds.
- **Never amend published commits** — create new commits to fix issues.

## When to Escalate
- Adding a new external dependency
- Changing the database schema
- Modifying the auth flow
- Restructuring the file/folder layout
