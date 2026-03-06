## MODIFIED Requirements

### Requirement: Vercel Hobby plan serverless function limit
The project SHALL NOT exceed 12 serverless functions in the `api/` directory, as enforced by the Vercel Hobby plan.

#### Constraint: Maximum 12 API files
- **GIVEN** each `.ts` file under `api/` becomes one Vercel serverless function
- **THEN** the total number of `.ts` files in `api/` (including nested directories) MUST be 12 or fewer

#### Guideline: Consolidate related endpoints using flat files with rewrites
- **WHEN** a new API endpoint is needed and the function count is at or near 12
- **THEN** related endpoints SHOULD be consolidated into a single flat `.ts` file with Vercel rewrites
- **Example:** `api/puzzle/today`, `api/puzzle/image`, `api/puzzle/yesterday` → `api/puzzle.ts` (action via query param + rewrite)
- **Example:** `api/profile/stats`, `api/profile/update` → `api/profile.ts` (routed via rewrite)

#### Pattern: Flat file with rewrite handler
- **WHEN** multiple endpoints share a URL prefix (e.g., `/api/puzzle/*`)
- **THEN** they SHALL be merged into one flat `.ts` file that reads the action from a query parameter
- Vercel rewrites SHALL map the original URL paths to query parameters on the flat file
- The file SHALL export separate HTTP method handlers (`GET`, `POST`) as needed
- Each action case SHALL contain the same logic as its original standalone file

### Requirement: Vercel rewrite ordering
The `vercel.json` rewrites array SHALL list API rewrites before the SPA catch-all.

#### Scenario: API rewrites take precedence
- **WHEN** a request matches both an API rewrite and the SPA catch-all
- **THEN** the API rewrite SHALL be matched first because it appears earlier in the array
- **AND** the SPA catch-all `/(.*) → /index.html` SHALL be the last entry

### Requirement: Production deployment verification
After pushing changes, the Vercel production deployment SHALL succeed without ESM or driver errors.

#### Scenario: Successful deployment
- **WHEN** changes are pushed to the main branch
- **THEN** the Vercel build completes without errors
- **AND** all API endpoints return correct responses in production
