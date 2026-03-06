## Deployment Constraints

### Requirement: Vercel Hobby plan serverless function limit
The project SHALL NOT exceed 12 serverless functions in the `api/` directory, as enforced by the Vercel Hobby plan.

#### Constraint: Maximum 12 API files
- **GIVEN** each `.ts` file under `api/` becomes one Vercel serverless function
- **THEN** the total number of `.ts` files in `api/` (including nested directories) MUST be 12 or fewer

#### Guideline: Consolidate related endpoints using flat files with rewrites
- **WHEN** a new API endpoint is needed and the function count is at or near 12
- **THEN** related endpoints SHOULD be consolidated into a single flat `.ts` file with Vercel rewrites
- **Example:** `api/puzzle/today.ts`, `api/puzzle/image.ts`, `api/puzzle/yesterday.ts` → `api/puzzle.ts` (action via query param + rewrite)
- **Example:** `api/profile/stats.ts`, `api/profile/update.ts` → `api/profile.ts` (routed via rewrite)

#### Pattern: Flat file with rewrite handler
- **WHEN** multiple endpoints share a URL prefix (e.g., `/api/puzzle/*`)
- **THEN** they SHALL be merged into one flat `.ts` file that reads the action from a query parameter
- Vercel rewrites SHALL map the original URL paths to query parameters on the flat file
- The file SHALL export separate HTTP method handlers (`GET`, `POST`) as needed
- Each action case SHALL contain the same logic as its original standalone file

### Requirement: Current API endpoint inventory
The project currently uses **11 of 12** serverless function slots:

| # | File | Methods | Description |
|---|------|---------|-------------|
| 1 | `api/auth/callback.ts` | GET | OAuth callback |
| 2 | `api/auth/login.ts` | GET | OAuth redirect |
| 3 | `api/auth/logout.ts` | GET | Clear session |
| 4 | `api/auth/me.ts` | GET | Session check |
| 5 | `api/guess.ts` | POST | Submit guess |
| 6 | `api/hint.ts` | POST | Request hint |
| 7 | `api/leaderboard.ts` | GET | Leaderboard by period (period via query param + rewrite) |
| 8 | `api/phones.ts` | GET | Phone catalog |
| 9 | `api/profile.ts` | GET, POST | Stats (GET) + update name (POST), routed via rewrite |
| 10 | `api/puzzle.ts` | GET | Today, image, yesterday (action via query param + rewrite) |
| 11 | `api/result.ts` | POST | Submit game result |

**1 slot remaining.** If a new endpoint is needed, either use the remaining slot or consolidate existing auth endpoints into `api/auth/[action].ts` to free up 3 more slots.

### Requirement: Neon serverless database driver
The project SHALL use `@neondatabase/serverless` with `drizzle-orm/neon-http` for all database access in Vercel serverless functions.

#### Scenario: Database connection in serverless function
- **WHEN** a serverless function imports `db` from the database module
- **THEN** the connection SHALL use Neon's HTTP driver via `drizzle-orm/neon-http`
- **AND** the `DATABASE_URL` environment variable SHALL provide the connection string

#### Scenario: Environment variable configuration
- **WHEN** the serverless function starts
- **THEN** it SHALL read `DATABASE_URL` from the Vercel environment
- **AND** the URL SHALL point to a Neon pooled connection endpoint

### Requirement: Vercel function configuration
The `vercel.json` SHALL configure all API functions with access to the phoneguessr source and phone image assets.

#### Scenario: Functions can access phone images
- **GIVEN** the `vercel.json` includes `includeFiles: "phoneguessr/{src,config/public/phones}/**"`
- **WHEN** a serverless function reads phone data or images
- **THEN** the files are available in the function's filesystem

#### Scenario: Functions can resolve database dependencies
- **GIVEN** `@neondatabase/serverless` is listed in the root or phoneguessr `package.json`
- **WHEN** a serverless function imports the database module
- **THEN** the Neon HTTP driver SHALL be available without additional configuration

### Requirement: Build command
The Vercel build SHALL compile the Modern.js frontend and copy output files to the expected locations.

#### Scenario: Successful Vercel build
- **GIVEN** the build command is `cd phoneguessr && npm install && npm run build && cp dist/html/index/index.html dist/index.html && cp -r dist/public/* dist/`
- **WHEN** Vercel runs the build
- **THEN** the output directory `phoneguessr/dist` contains the SPA index.html and all static assets

### Requirement: SPA routing
All non-API routes SHALL be rewritten to `index.html` for client-side routing.

#### Scenario: Client-side navigation
- **GIVEN** the Vercel rewrites config includes `{ "source": "/(.*)", "destination": "/index.html" }`
- **WHEN** a user navigates to any non-API path
- **THEN** the SPA handles routing client-side
