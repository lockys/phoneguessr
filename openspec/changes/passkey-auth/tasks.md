## 1. Dependencies & Configuration

- [ ] 1.1 Install `@simplewebauthn/server` (v11+) in project root (used by Vercel serverless functions in `api/`)
- [ ] 1.2 Install `@simplewebauthn/browser` in `phoneguessr/` (used by frontend)
- [ ] 1.3 Add environment variables: `WEBAUTHN_RP_ID`, `WEBAUTHN_RP_NAME`, `WEBAUTHN_ORIGIN` with defaults for local dev
- [ ] 1.4 Create `phoneguessr/src/lib/webauthn.ts` with RP config helpers that read from env vars (rpID, rpName, origin)

## 2. Database Schema

- [ ] 2.1 Add `passkey_credentials` table to `phoneguessr/src/db/schema.ts` (id, userId FK, credentialId text unique, publicKey text, counter integer, transports text array, createdAt)
- [ ] 2.2 Run `drizzle-kit generate` to create the migration
- [ ] 2.3 Run `drizzle-kit push` or `drizzle-kit migrate` to apply schema to database

## 3. Challenge Store

- [ ] 3.1 Create `phoneguessr/src/lib/challenge-store.ts` with in-memory Map-based challenge store (set, get, delete) with 60-second TTL auto-cleanup

## 4. Registration API Endpoints

- [ ] 4.1 Create `api/auth/passkey/register-options.ts` — GET endpoint that requires session auth, generates registration options via `generateRegistrationOptions()`, stores challenge, returns options JSON
- [ ] 4.2 Create `api/auth/passkey/register.ts` — POST endpoint that requires session auth, verifies registration response via `verifyRegistrationResponse()`, upserts credential in `passkey_credentials` table

## 5. Login API Endpoints

- [ ] 5.1 Create `api/auth/passkey/login-options.ts` — POST endpoint (no auth required), accepts optional email to look up user credentials, generates authentication options via `generateAuthenticationOptions()`, stores challenge, returns options JSON
- [ ] 5.2 Create `api/auth/passkey/login.ts` — POST endpoint (no auth required), verifies authentication response via `verifyAuthenticationResponse()`, updates counter, creates session via `createSessionToken()`, sets session cookie

## 6. Frontend — Auth Context Updates

- [ ] 6.1 Add `loginWithPasskey()` method to `AuthProvider` in `phoneguessr/src/lib/auth-context.tsx` that calls login-options then login endpoints using `@simplewebauthn/browser`'s `startAuthentication()`
- [ ] 6.2 Add `registerPasskey()` method to `AuthProvider` that calls register-options then register endpoints using `@simplewebauthn/browser`'s `startRegistration()`
- [ ] 6.3 Add `hasPasskey` state to auth context (fetched from a new field on `/api/auth/me` or a dedicated endpoint)
- [ ] 6.4 Add WebAuthn feature detection (`browserSupportsWebAuthn()` from `@simplewebauthn/browser`) to auth context

## 7. Frontend — Login UI

- [ ] 7.1 Update `AuthButton.tsx` to show "Sign in with Passkey" button alongside Google OAuth when WebAuthn is supported
- [ ] 7.2 Handle passkey login errors (no credential found, verification failed) with user-friendly messages
- [ ] 7.3 Add loading state during passkey authentication flow

## 8. Frontend — Registration UI

- [ ] 8.1 Add passkey registration section to ProfilePanel: "Set up Passkey" button when no passkey registered, "Passkey registered" indicator when already set up
- [ ] 8.2 Handle registration success (show confirmation) and failure (show error message)
- [ ] 8.3 Add option to re-register (replace) an existing passkey

## 9. Mock API

- [ ] 9.1 Add mock routes for all 4 passkey endpoints in `phoneguessr/src/mock/middleware.ts`
- [ ] 9.2 Mock register-options and register: simulate success, track mock passkey state
- [ ] 9.3 Mock login-options and login: simulate successful passkey auth, return mock user session

## 10. Verification

- [ ] 10.1 Test passkey registration flow end-to-end: sign in with Google, register passkey, verify credential stored in DB
- [ ] 10.2 Test passkey login flow end-to-end: sign out, sign in with passkey, verify session created
- [ ] 10.3 Test error cases: expired challenge, invalid assertion, unauthenticated registration attempt, counter mismatch
- [ ] 10.4 Test WebAuthn feature detection: verify passkey UI hidden on browsers without WebAuthn support
- [ ] 10.5 Test mock API mode: verify all passkey endpoints respond correctly in dev:mock mode
- [ ] 10.6 Verify existing Google OAuth flow is unaffected by passkey changes
