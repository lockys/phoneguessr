## Context

PhoneGuessr currently uses Google OAuth as its sole authentication method. Auth is handled by Vercel serverless functions at `api/auth/` (login, callback, me, logout). Sessions are JWT tokens (via `jose`) stored in HTTP-only cookies. The `users` table has `googleId` as the identity anchor. The frontend uses an `AuthProvider` context that calls `/api/auth/me` on load and exposes `login()` / `logout()` methods. A mock API middleware handles auth routes in local development.

Key constraints:
- Vercel serverless functions (stateless, no persistent in-process memory across invocations)
- PostgreSQL via Neon (Drizzle ORM)
- Session tokens are JWTs created by `createSessionToken()` in `phoneguessr/src/lib/auth.ts`
- Cookie management via `phoneguessr/src/lib/cookies.ts`
- Mock API mode must support all new endpoints

## Goals / Non-Goals

**Goals:**
- Allow authenticated users to register a passkey (FIDO2/WebAuthn) linked to their account
- Allow returning users to sign in with a passkey instead of Google OAuth
- Reuse existing session infrastructure (JWT cookies) for passkey-authenticated sessions
- Support passkey login on mobile (Face ID, Touch ID, fingerprint) and desktop (Windows Hello, Touch ID)

**Non-Goals:**
- Replacing Google OAuth (passkeys are an additional option, not a replacement)
- Supporting multiple passkeys per user in v1 (one passkey per user is sufficient)
- Passkey-only account creation (users must first sign in with Google to establish an account)
- Usernameless/discoverable credential flows (we use server-side credential lookup by user session or allowCredentials list)
- Cross-device passkey registration (register on the device you will use)

## Decisions

### 1. SimpleWebAuthn library (`@simplewebauthn/server` v11+ and `@simplewebauthn/browser`)

**Decision**: Use the SimpleWebAuthn library for all WebAuthn operations (challenge generation, registration verification, authentication verification) on the server, and the browser companion for calling `navigator.credentials.create()` / `navigator.credentials.get()`.

**Why**: SimpleWebAuthn is the most widely used WebAuthn library in the Node.js ecosystem. It abstracts CBOR parsing, attestation verification, and assertion validation. v11+ supports the latest WebAuthn L2 spec and handles edge cases (transports, authenticator selection). The library is actively maintained and has excellent TypeScript types.

**Alternatives considered**:
- **Raw WebAuthn API**: Significantly more code for CBOR decoding, attestation parsing, and signature verification. High risk of subtle security bugs.
- **Hanko/passkeys SDK**: Adds a third-party service dependency. We want self-hosted credential storage.
- **fido2-lib**: Lower-level, less ergonomic API, smaller community.

### 2. Register-after-Google-login flow

**Decision**: Users must be authenticated via Google OAuth before they can register a passkey. The passkey is linked to their existing user account. There is no passkey-only account creation.

**Why**: This simplifies identity management. The `users` table already has `googleId` as the unique identity. Passkeys become a convenience login method for existing accounts, not a new identity provider. This avoids the complexity of merging accounts or handling users who lose their passkey with no recovery path.

**Flow**: Sign in with Google -> Navigate to profile -> Click "Set up Passkey" -> Browser prompts biometric -> Credential stored in `passkey_credentials` table.

### 3. New `passkey_credentials` table

**Decision**: Create a new table to store WebAuthn credentials:

```
passkey_credentials:
  id            serial PRIMARY KEY
  user_id       integer NOT NULL REFERENCES users(id)
  credential_id text NOT NULL UNIQUE   -- base64url-encoded credential ID
  public_key    text NOT NULL           -- base64url-encoded public key
  counter       integer NOT NULL DEFAULT 0
  transports    text[]                  -- e.g. ['internal', 'hybrid']
  created_at    timestamp NOT NULL DEFAULT now()
```

**Why**: Separate table (not columns on `users`) because WebAuthn credentials are a distinct entity. Even though v1 is one-passkey-per-user, the schema naturally supports multiple credentials per user if we expand later. `credential_id` and `public_key` are stored as base64url text (matching SimpleWebAuthn's output format) rather than bytea for simpler debugging and JSON serialization. The `transports` array is needed for the `allowCredentials` list during authentication.

### 4. Challenge storage: in-memory Map with TTL

**Decision**: Store WebAuthn challenges in a module-level `Map<string, { challenge: string; expires: number }>` keyed by userId (for registration) or a random session ID (for login). Challenges expire after 60 seconds.

**Why**: WebAuthn requires the server to generate a challenge, send it to the client, then verify the client's response includes the same challenge. The challenge must be stored server-side between the two requests. Options considered:

**Alternatives considered**:
- **Database storage**: Adds two extra DB round-trips per auth attempt. Over-engineered for a short-lived value.
- **Redis/KV store**: Adds infrastructure dependency for a simple key-value with TTL.
- **Signed challenge in cookie/response**: Client could replay or tamper. Server-side verification is the spec recommendation.
- **JWT-encoded challenge**: Would need to be sent back by client, adds complexity.

**Trade-off**: In-memory storage does not survive serverless cold starts or work across multiple instances. This is acceptable because: (1) challenges have a 60-second TTL, so the window is short; (2) if a cold start occurs between options and verify, the user simply retries; (3) Vercel functions reuse warm instances for sequential requests from the same user. If this becomes a reliability problem, we can migrate to a database-backed challenge store.

### 5. Four API endpoints under `/api/auth/passkey/`

**Decision**: Create four Vercel serverless function endpoints:

| Endpoint | Method | Auth Required | Purpose |
|---|---|---|---|
| `/api/auth/passkey/register-options` | GET | Yes (session) | Generate registration challenge + options |
| `/api/auth/passkey/register` | POST | Yes (session) | Verify registration response, store credential |
| `/api/auth/passkey/login-options` | POST | No | Generate authentication challenge + options |
| `/api/auth/passkey/login` | POST | No | Verify authentication response, create session |

**File structure**: `api/auth/passkey/register-options.ts`, `api/auth/passkey/register.ts`, `api/auth/passkey/login-options.ts`, `api/auth/passkey/login.ts` (matching Vercel file-based routing).

**Why**: Separating options-generation from verification follows the WebAuthn two-step flow. Registration endpoints require an active session (user must be logged in via Google). Login endpoints are unauthenticated (that is the point of logging in).

### 6. Session creation reuses existing `createSessionToken()`

**Decision**: After passkey authentication succeeds, look up the user from `passkey_credentials.user_id`, load the full user record, and call the existing `createSessionToken()` with the same `SessionData` shape. Set the same session cookie.

**Why**: The rest of the app (auth context, API auth checks, `/api/auth/me`) already understands JWT sessions. By reusing the same token creation, passkey login is transparent to the rest of the system. No changes needed to session verification, cookie handling, or the auth context.

### 7. Relying Party configuration

**Decision**: The WebAuthn Relying Party (RP) ID and origin are derived from environment variables:

- `WEBAUTHN_RP_ID`: defaults to `localhost` in dev, set to `phoneguessr.com` (or actual domain) in production
- `WEBAUTHN_RP_NAME`: defaults to `PhoneGuessr`
- `WEBAUTHN_ORIGIN`: defaults to `http://localhost:3000` in dev, set to `https://phoneguessr.com` in production

**Why**: RP ID must match the domain where the passkey is used. Hardcoding would break local development. Environment variables allow the same code to work in dev, preview deploys, and production.

### 8. Login-options uses email to find credentials

**Decision**: The `/api/auth/passkey/login-options` endpoint accepts an optional `email` in the POST body. If provided, it looks up the user by email and returns their credential IDs in `allowCredentials`. If not provided, it returns an empty `allowCredentials` list (discoverable credential / resident key flow).

**Why**: Providing `allowCredentials` guides the browser to show only relevant passkeys, improving UX. The email serves as a user hint without being a security factor (the passkey itself is the authenticator). Supporting empty `allowCredentials` enables the "just tap" flow on devices with discoverable credentials.

## Risks / Trade-offs

- **In-memory challenge store on serverless**: Challenges may be lost on cold start between the options and verify requests. Mitigation: 60-second TTL, user retries, and Vercel warm instance reuse make this rare in practice. Monitor and migrate to DB-backed store if needed.
- **Single passkey per user in v1**: If a user loses their device, they cannot use passkey login (but Google OAuth still works). Mitigation: Google OAuth remains the primary and recovery login method.
- **No cross-device sync**: Passkeys registered on one device may not work on another (depends on platform passkey sync, e.g., iCloud Keychain, Google Password Manager). Mitigation: This is handled by the platform, not our app. Users can always fall back to Google OAuth.
- **Browser support**: WebAuthn is supported in all modern browsers but not in older ones. Mitigation: Feature-detect `window.PublicKeyCredential` and only show passkey UI when available. Google OAuth is always available as fallback.
