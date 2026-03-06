## Deployment Constraints

### Requirement: Vercel Hobby plan serverless function limit
The project SHALL NOT exceed 12 serverless functions in the `api/` directory, as enforced by the Vercel Hobby plan.

#### Constraint: Maximum 12 API files
- **GIVEN** each `.ts` file under `api/` becomes one Vercel serverless function
- **THEN** the total number of `.ts` files in `api/` (including nested directories) MUST be 12 or fewer

#### Guideline: Consolidate related endpoints using dynamic routes
- **WHEN** a new API endpoint is needed and the function count is at or near 12
- **THEN** related endpoints SHOULD be consolidated into a single `[action].ts` dynamic route file
- **Example:** `api/puzzle/today.ts`, `api/puzzle/image.ts`, `api/puzzle/yesterday.ts` → `api/puzzle/[action].ts`
- **Example:** `api/profile/stats.ts`, `api/profile/update.ts` → `api/profile/[action].ts`

#### Pattern: Dynamic route handler
- **WHEN** multiple endpoints share a URL prefix (e.g., `/api/puzzle/*`)
- **THEN** they SHALL be merged into one `[action].ts` file that switches on the URL path segment
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
| 7 | `api/leaderboard/[period].ts` | GET | Leaderboard by period |
| 8 | `api/phones.ts` | GET | Phone catalog |
| 9 | `api/profile/[action].ts` | GET, POST | Stats (GET) + update name (POST) |
| 10 | `api/puzzle/[action].ts` | GET | Today, image, yesterday |
| 11 | `api/result.ts` | POST | Submit game result |

**1 slot remaining.** If a new endpoint is needed, either use the remaining slot or consolidate existing auth endpoints into `api/auth/[action].ts` to free up 3 more slots.

### Requirement: Vercel function configuration
The `vercel.json` SHALL configure all API functions with access to the phoneguessr source and phone image assets.

#### Scenario: Functions can access phone images
- **GIVEN** the `vercel.json` includes `includeFiles: "phoneguessr/{src,config/public/phones}/**"`
- **WHEN** a serverless function reads phone data or images
- **THEN** the files are available in the function's filesystem

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
