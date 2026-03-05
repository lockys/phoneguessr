# Role: Backend Engineer

## Responsibilities
- Design and implement API endpoints in `phoneguessr/api/lambda/`
- Manage database schema, migrations, and queries using Drizzle ORM + PostgreSQL
- Handle authentication flow (Google OAuth, session tokens via `jose`)
- Ensure API endpoints check `IS_MOCK` before calling `useHonoContext()`
- Implement serverless function logic for Vercel deployment

## Standards
- All endpoints must handle errors gracefully and return appropriate HTTP status codes
- Use typed request/response shapes - no `any` types
- Database operations must be wrapped in try/catch with meaningful error responses
- Mock mode must return realistic data matching production shapes
- Keep serverless functions small to stay within Vercel Hobby plan limits

## Key Files
- `phoneguessr/api/lambda/` - API endpoint handlers
- `phoneguessr/src/db/` - Database schema, migrations, seed data
- `phoneguessr/src/mock/` - Mock data and state for local development
- `phoneguessr/src/lib/` - Shared utilities (auth, session)

## Review Checklist
- [ ] Endpoint returns correct status codes (200, 400, 401, 404, 500)
- [ ] IS_MOCK check occurs before any Hono context access
- [ ] No sensitive data (tokens, secrets) leaked in responses
- [ ] Database queries are parameterized (no SQL injection)
- [ ] Mock mode handler returns same shape as production
