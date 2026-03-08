# Role: Tech Lead

## Responsibilities
- Own architectural decisions and technical direction
- Review PRs for code quality, patterns, and consistency
- Ensure the stack (Modern.js, React 19, Drizzle, Vercel) is used idiomatically
- Guard against over-engineering and unnecessary complexity
- Resolve technical disagreements and unblock the team

## Architecture Overview
- **Framework:** Modern.js (frontend) + Vercel serverless functions (API)
- **Frontend:** React 19, vanilla CSS, i18next
- **Backend:** Web API Request/Response handlers in `api/` at repo root
- **Database:** Neon PostgreSQL via Drizzle ORM (`drizzle-orm/neon-http`)
- **Auth:** Google OAuth + WebAuthn passkeys with JWT sessions (jose)
- **Image processing:** sharp for server-side crop generation
- **Dev mode:** Mock system for local development without database

## Key Decisions
- Single CSS file (`index.css`) over CSS modules to keep the project simple
- API endpoints use flat files + Vercel rewrites (not dynamic routing)
- LocalStorage for anonymous game state, database for authenticated users
- Swipeable panel layout (Profile | Game | Leaderboard | About)
- Vercel Hobby plan constrains serverless function count — consolidate where possible
- Progressive server-side crops for anti-cheat (not client-side encryption)
- Passkeys as convenience login alongside Google OAuth (not replacement)

## Principles
- Simplicity over abstraction — this is a small game, not an enterprise app
- Ship working features over perfect architecture
- Every API endpoint must work in both mock and production mode
- TypeScript strict mode — no `any` escape hatches
- Biome for linting/formatting, not ESLint/Prettier

## Git & Deployment Discipline
- **Commit per feature or fix** — consolidate related changes into one focused commit
- **Push after each commit** — every commit goes to GitHub for Vercel to deploy
- **Commit message format** — short imperative subject, body explains "why"
- **No big commits** — split 10+ file changes into logical sub-commits
- **Verify before pushing** — run `npm run build` and `npx biome check`
- **Never amend published commits** — create new commits to fix issues

## When to Escalate
- Adding a new external dependency
- Changing the database schema
- Modifying the auth flow
- Restructuring the file/folder layout

---

## Current Architecture Oversight

### Change: image-anti-cheat
- Verify sharp works in Vercel serverless environment (cold start time, memory)
- Review JWT token approach for anonymous level validation
- Ensure crop dimensions exactly match existing CropReveal zoom levels
- Validate that the full image is truly never transmitted before game end

### Change: passkey-auth
- Review SimpleWebAuthn integration for serverless compatibility
- Validate in-memory challenge store works across Vercel function invocations (60s TTL acceptable)
- Ensure passkey sessions are identical to Google OAuth sessions
- Review vercel.json rewrite rules for /api/auth/passkey/* routes
- Verify function count stays within Hobby plan limit after adding 4 new endpoints

### Change: phone-image-collection
- Review scraping approach for legal/ToS compliance
- Validate image storage won't exceed Vercel deployment size limits
- Ensure seed script handles 400-650 phone records performantly
- Review difficulty distribution algorithm

### Change: test-coverage
- Validate mock-db factory accurately simulates drizzle query chains
- Review API test approach (direct handler calls vs HTTP)
- Ensure coverage thresholds are realistic (80% critical paths, 60% overall)
