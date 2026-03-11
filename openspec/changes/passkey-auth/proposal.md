## Why

Currently the app only supports Google OAuth for authentication. Users must go through Google's OAuth flow every time, which is slow on mobile. Passkeys (WebAuthn) enable biometric login (Face ID, Touch ID, fingerprint) — faster, phishing-resistant, and works offline. This gives returning users a one-tap login experience.

## What Changes

- Add WebAuthn passkey registration flow for authenticated users (register a passkey after signing in with Google)
- Add WebAuthn passkey login flow as an alternative to Google OAuth
- New API endpoints for passkey registration challenge, registration verification, login challenge, and login verification
- New database table to store passkey credentials linked to user accounts
- Updated login UI with "Sign in with Passkey" button alongside existing Google OAuth

## Capabilities

### New Capabilities
- `passkey-auth`: WebAuthn passkey registration, storage, and authentication flow

### Modified Capabilities
- `user-auth`: Add passkey as an alternative login method alongside Google OAuth

## Impact

- **API**: 4 new endpoints — `/api/auth/passkey/register-options`, `/api/auth/passkey/register`, `/api/auth/passkey/login-options`, `/api/auth/passkey/login`
- **Database**: New `passkey_credentials` table (credentialId, publicKey, counter, userId FK, transports, createdAt)
- **Dependencies**: `@simplewebauthn/server` and `@simplewebauthn/browser` packages
- **Frontend**: Updated AuthButton component with passkey option; passkey registration prompt in ProfilePanel
- **Security**: Passkeys are phishing-resistant by design; no passwords stored
