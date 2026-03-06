## Context

The Vercel serverless functions use `drizzle-orm/node-postgres` with the `pg` library for database access. This creates TCP connections on every cold start, triggers SSL deprecation warnings, and is suboptimal for Vercel's short-lived execution model. The `@neondatabase/serverless` package is already installed and the `.env.local` contains Neon connection strings from `vercel env pull`.

## Goals / Non-Goals

**Goals:**
- Switch database driver from `pg` (TCP) to `@neondatabase/serverless` (HTTP)
- Use `drizzle-orm/neon-http` adapter for best serverless performance
- Remove the SSL mode workaround hack
- Ensure all 11 API functions work with the new driver

**Non-Goals:**
- Changing the database schema or migration tooling
- Adding connection pooling logic (Neon's HTTP driver is stateless)
- Modifying the mock mode (it doesn't use the database)

## Decisions

### 1. Use `drizzle-orm/neon-http` over `drizzle-orm/neon-serverless`

**Choice:** `neon-http` (HTTP-based queries)
**Over:** `neon-serverless` (WebSocket-based)

Rationale: HTTP requests are stateless and ideal for Vercel serverless. WebSocket connections add unnecessary overhead for single-query function invocations. The `neon-http` adapter uses Neon's SQL-over-HTTP API which has the lowest latency for serverless.

### 2. Use pooled connection URL (`DATABASE_URL`)

The `.env.local` provides both pooled (`DATABASE_URL`) and unpooled (`DATABASE_URL_UNPOOLED`) URLs. The pooled URL routes through Neon's connection pooler, which is the recommended default for serverless workloads.

### 3. Keep `pg` in root `package.json` for now

The root `package.json` lists `pg` as a dependency. Drizzle Kit (used for migrations via `db:push`, `db:generate`) may still need `pg` for TCP-based migration commands. Remove it only after verifying drizzle-kit works without it.

## Risks / Trade-offs

- **[Drizzle-Kit compatibility]** → Drizzle Kit migration commands may still need the `pg` driver. Mitigation: keep `pg` in dependencies; only the runtime driver changes.
- **[Query compatibility]** → Some `pg`-specific query features may not work over HTTP. Mitigation: the app uses standard SQL via Drizzle ORM which is driver-agnostic.
- **[Local development]** → The HTTP driver works against remote Neon even locally, adding latency. Mitigation: mock mode (`MOCK_API=true`) doesn't hit the database at all.
