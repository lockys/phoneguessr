# Role: Code Reviewer

## Responsibilities
- Review all code changes for correctness, readability, and consistency
- Enforce project conventions and patterns
- Catch bugs, security issues, and performance problems before merge
- Provide actionable feedback — suggest fixes, not just problems

## Review Process
1. Read the diff to understand what changed and why
2. Check against the relevant role docs (backend, frontend) for standards
3. Run `npm run build` to verify compilation
4. Run `npx biome check` for lint/format issues
5. Run `npm run test` to verify tests pass
6. Test in mock mode if UI changes are involved

## What to Look For

### Correctness
- Does the code do what it claims?
- Are edge cases handled (empty arrays, null values, network failures)?
- Do types match between frontend and backend?

### Security
- No secrets or credentials in code
- API endpoints validate input
- No XSS vectors (dangerouslySetInnerHTML, unescaped user input)
- Auth checks present on protected endpoints
- Image data not leaked before game completion (anti-cheat)
- Passkey credential data properly validated server-side

### Consistency
- Follows existing patterns in the codebase
- Uses project conventions (CSS classes not inline styles, i18n not hardcoded strings)
- Naming matches surrounding code style
- API endpoints use Web API Request/Response (not Hono)

### Performance
- No unnecessary re-renders (stable references, proper deps arrays)
- No memory leaks (cleanup in useEffect return)
- Images and assets optimized
- sharp operations don't block the event loop

### Project-Specific Patterns
- All 5 locale files updated when adding i18n keys
- Feedback typed as `'wrong_brand' | 'right_brand' | 'correct'` not `string`
- CSS uses `:root` custom properties, not hardcoded colors
- API imports use `.js` extensions for ESM
- Vercel rewrites configured for new routes

## Approval Criteria
- TypeScript compiles with no errors
- Biome reports no issues
- All tests pass
- No security concerns
- Follows existing patterns
- Changes are minimal and focused (no unrelated refactoring)

---

## Current Review Focus Areas

### image-anti-cheat
- [x] sharp crop dimensions exactly match ZOOM_LEVELS array
- [x] Level validation cannot be bypassed (auth + token paths)
- [x] Full image never transmitted before game end
- [x] CropReveal crossfade transition is smooth (no flicker)
- [x] JWT token expiry aligned with puzzle day boundary

### passkey-auth
- [x] Challenge store TTL prevents replay attacks
- [x] Counter increment prevents credential cloning
- [x] Passkey sessions identical to OAuth sessions
- [x] WebAuthn feature detection prevents UI on unsupported browsers
- [x] Registration requires prior Google OAuth authentication

### phone-image-collection
- [x] Image processing produces consistent dimensions and quality
- [x] No duplicate brand+model entries in phone-data.json
- [x] Existing 20 phones unmodified after merge
- [x] Scraping respects rate limits and User-Agent

### test-coverage
- [x] Mock-db factory accurately simulates drizzle query chains
- [x] API tests use `// @vitest-environment node` pragma
- [x] No test pollution between test files (proper cleanup)
- [x] Coverage thresholds enforced in vitest config
