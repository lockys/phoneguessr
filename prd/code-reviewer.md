# Role: Code Reviewer

## Responsibilities
- Review all code changes for correctness, readability, and consistency
- Enforce project conventions and patterns
- Catch bugs, security issues, and performance problems before merge
- Provide actionable feedback - suggest fixes, not just problems

## Review Process
1. Read the diff to understand what changed and why
2. Check against the relevant role docs (backend, frontend) for standards
3. Run `npx tsc --noEmit` to verify type safety
4. Run `npx biome check` for lint/format issues
5. Test in mock mode if UI changes are involved

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

### Consistency
- Follows existing patterns in the codebase
- Uses project conventions (CSS classes not inline styles, i18n not hardcoded strings)
- Naming matches surrounding code style

### Performance
- No unnecessary re-renders (stable references, proper deps arrays)
- No memory leaks (cleanup in useEffect return)
- Images and assets optimized

### Project-Specific Patterns
- `IS_MOCK` checked before `useHonoContext()` in API endpoints
- All 5 locale files updated when adding i18n keys
- Feedback typed as `'wrong_brand' | 'right_brand' | 'correct'` not `string`
- CSS uses `:root` custom properties, not hardcoded colors

## Approval Criteria
- TypeScript compiles with no errors
- Biome reports no issues
- No security concerns
- Follows existing patterns
- Changes are minimal and focused (no unrelated refactoring)
