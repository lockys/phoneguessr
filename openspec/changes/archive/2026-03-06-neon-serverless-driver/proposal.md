## Why

The Vercel serverless functions currently use `drizzle-orm/node-postgres` with the `pg` driver, which creates TCP connections to the database. This is problematic on Vercel's serverless environment: TCP connections are slow to establish, can't be reused across invocations, and trigger SSL deprecation warnings. Neon provides `@neondatabase/serverless` which uses HTTP for queries — ideal for short-lived serverless functions.

## What Changes

- Replace `drizzle-orm/node-postgres` with `drizzle-orm/neon-http` in the database connection module
- Use `@neondatabase/serverless` (already installed) as the underlying driver
- Remove the `pg` dependency from the root `package.json` (only needed for TCP connections)
- Remove the SSL mode workaround in `db/index.ts` (Neon HTTP doesn't use `sslmode` params)
- Ensure `.env.local` `DATABASE_URL` is loaded by all Vercel serverless functions

## Capabilities

### New Capabilities

_None — this is a driver swap, not a new capability._

### Modified Capabilities

- `deployment`: Database driver changes from TCP (`pg`) to HTTP (`@neondatabase/serverless`), affecting serverless function cold start performance and connection handling.

## Impact

- **Code**: `phoneguessr/src/db/index.ts` — driver import and connection setup
- **Dependencies**: Remove `pg` from root `package.json`; `@neondatabase/serverless` already in `phoneguessr/package.json`
- **API functions**: All 11 serverless functions that import `db` benefit automatically
- **Local dev**: `npm run dev:mock` is unaffected (mock mode doesn't use `db`); local non-mock dev can use the Neon HTTP driver with the same `DATABASE_URL`
