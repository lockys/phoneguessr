## ADDED Requirements

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

## MODIFIED Requirements

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
