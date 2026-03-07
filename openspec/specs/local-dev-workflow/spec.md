## ADDED Requirements

### Requirement: Local development server command
The project SHALL provide `npm run dev` at the repo root that starts the full local development environment.

#### Scenario: Starting local development
- **WHEN** a developer runs `npm run dev` from the repo root
- **THEN** `vercel dev` starts, serving both the Modern.js frontend and Vercel serverless functions
- **AND** the server is accessible at `http://localhost:3000`

#### Scenario: API routes resolve to serverless functions
- **WHEN** the dev server is running
- **THEN** all API routes (`/api/phones`, `/api/puzzle/today`, `/api/leaderboard/daily`, etc.) return JSON from serverless functions
- **AND** no API route returns the SPA HTML page

### Requirement: Environment variable loading
The local dev environment SHALL automatically load Neon database credentials from `.env.local`.

#### Scenario: Database connection in local dev
- **WHEN** `vercel dev` starts
- **THEN** it reads `DATABASE_URL` from `.env.local`
- **AND** serverless functions connect to the Neon database using the HTTP driver

#### Scenario: Missing environment file
- **WHEN** `.env.local` does not exist
- **THEN** API endpoints that require database access return appropriate error responses
- **AND** the frontend still loads (static assets do not depend on env vars)

### Requirement: Full game flow works locally
The local dev environment SHALL support a complete game session end-to-end.

#### Scenario: Complete game flow
- **WHEN** a developer opens `http://localhost:3000` in a browser
- **THEN** the app loads the daily puzzle via `/api/puzzle/today`
- **AND** the phone list loads via `/api/phones`
- **AND** submitting a guess via `/api/guess` returns feedback
- **AND** submitting a result via `/api/result` returns a score

#### Scenario: Puzzle image loads
- **WHEN** the frontend requests `/api/puzzle/image`
- **THEN** the serverless function reads the phone image from the local filesystem
- **AND** returns it as a base64 data URL
