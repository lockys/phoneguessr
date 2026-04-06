# Telegram Mini App — Robust Auth Design

**Date:** 2026-04-06  
**Status:** Approved

## Problem

When PhoneGuessr is opened as a Telegram Mini App, the user's account name does not appear. The root cause is that the current auth flow waits for a full server round-trip before setting any user state. If anything fails silently — missing `TELEGRAM_BOT_TOKEN` on the server, cookie rejected by Telegram's WebView, network error — the user state stays `null` and no name is shown anywhere in the UI.

## Approach

**B — Robust Telegram auth with optimistic display.**

Show the Telegram user's name immediately from `window.Telegram.WebApp.initDataUnsafe.user` (available client-side the moment the app opens), then confirm/upgrade via the server session in the background. Never go blank.

## Architecture

### Client-side auth flow (`auth-context.tsx`)

1. On mount, check `isTelegramEnv`.
2. If true, immediately read `initDataUnsafe.user` and populate an optimistic user object `{ displayName, avatarUrl }` — no server call needed.
3. In parallel, send `initData` to `POST /api/auth/telegram` to create a verified server session.
4. On success: replace optimistic user with the server-verified user (same data in practice).
5. On failure: keep the optimistic user visible; set an `authError` flag so the UI can show a retry option.

**Key change:** `isTelegramEnv` remains a module-level constant (SDK loads synchronously). The optimistic user is a new piece of state derived from `initDataUnsafe`, not from the server.

### UI changes

**`AuthButton.tsx`** (header)
- In Telegram: always renders name + avatar as soon as `initDataUnsafe` is available. No loading state shown to user.
- No sign-out button (unchanged).

**`ProfilePanel.tsx`** (profile tab)
- While server auth is in progress: show "Connecting Telegram account…" instead of the unauthenticated prompt.
- If server auth fails: show a "Retry" button (calls `loginWithTelegram()` again). Game remains fully playable.
- On success: normal profile card with name, stats, history.

### No backend changes

`api/auth.ts` `handleTelegramAuth` is correct. The fix is entirely client-side.  
`TELEGRAM_BOT_TOKEN` must still be configured in the deployment environment — if it isn't, the retry button and error state give the user a clear signal rather than silence.

## Data flow

```
App opens in Telegram
  │
  ├─ initDataUnsafe.user → optimistic displayName/avatarUrl → shown in header immediately
  │
  └─ POST /api/auth/telegram (initData)
        ├─ success → server-verified user replaces optimistic user (no visual change)
        └─ failure → authError=true → "Retry" shown in ProfilePanel; header name unchanged
```

## Components changed

| File | Change |
|------|--------|
| `phoneguessr/src/lib/auth-context.tsx` | Add `telegramUser` optimistic state; expose `authError`; set user from initDataUnsafe before server call |
| `phoneguessr/src/components/AuthButton.tsx` | Use optimistic name in Telegram env |
| `phoneguessr/src/components/ProfilePanel.tsx` | Show "Connecting…" during auth; show Retry on failure |

## Out of scope

- Telegram CloudStorage for session persistence (approach C — future)
- Telegram MainButton / BackButton navigation
- Telegram theme color adoption
- Any new routes or API endpoints
