# Role: Frontend Engineer

## Responsibilities
- Build and maintain React 19 components in `phoneguessr/src/components/`
- Implement responsive, mobile-first UI with vanilla CSS
- Handle internationalization using i18next across 5 locales (en, zh-TW, zh-CN, ja, ko)
- Manage client-side state (game state, localStorage persistence, auth context)
- Ensure smooth UX with animations, transitions, and haptic feedback

## Standards
- Functional components with hooks only — no class components
- All user-facing strings must use `t()` from `useTranslation()` — never hardcode text
- CSS lives in `phoneguessr/src/routes/index.css` using CSS custom properties from `:root`
- Components must work on mobile viewports (max-width: 480px app container)
- Use `canvas-confetti` for celebrations, `web-haptics` for tactile feedback

## Key Files
- `phoneguessr/src/components/` — React components
- `phoneguessr/src/routes/page.tsx` — Main page layout
- `phoneguessr/src/routes/index.css` — All styles
- `phoneguessr/src/locales/*.json` — Translation files (en, zh-TW, zh-CN, ja, ko)
- `phoneguessr/src/lib/auth-context.tsx` — Auth provider

## Review Checklist
- [x] All strings use i18n keys with translations in all 5 locale files
- [x] No inline styles — use CSS classes
- [x] Component works on mobile (touch events, viewport sizing)
- [x] Animations respect `prefers-reduced-motion` where appropriate
- [x] No console errors or warnings in browser devtools

---

## Current Tasks

### Change: image-anti-cheat (Progressive image display)

> OpenSpec: `openspec/changes/image-anti-cheat/`
> Read: design.md, specs/progressive-image-serving/spec.md

Game.tsx changes:
- [x] Replace single upfront image fetch with per-level `fetchCropAtLevel(level)` calling `/api/puzzle/image?level=N`
- [x] Fetch level 0 on initial load, store current crop base64 in state
- [x] After each wrong guess, fetch next level (level = guesses.length)
- [x] On game end (win/loss), fetch level 5 (full image) for reveal animation
- [x] For unauthenticated users: store JWT token from response, pass as `&token=` on next request
- [x] Handle 403 errors gracefully (error toast or retry at valid level)

CropReveal.tsx changes:
- [x] Remove ZOOM_LEVELS array and zoom-based drawImage scaling
- [x] Draw received image at scale 1.0 (server provides correctly cropped region)
- [x] Implement crossfade transition between crop levels (400ms)
- [x] Keep reveal animation (win bouncy / loss ease-out) — full image at level 5

### Change: passkey-auth (Passkey UI)

> OpenSpec: `openspec/changes/passkey-auth/`
> Read: design.md, specs/passkey-auth/spec.md, specs/user-auth/spec.md

Auth context:
- [x] Install `@simplewebauthn/browser` in phoneguessr/
- [x] Add `loginWithPasskey()` to AuthProvider — calls login-options then login using `startAuthentication()`
- [x] Add `registerPasskey()` — calls register-options then register using `startRegistration()`
- [x] Add `hasPasskey` state (from /api/auth/me or dedicated endpoint)
- [x] Add WebAuthn feature detection via `browserSupportsWebAuthn()`

Login UI:
- [x] Update AuthButton.tsx — "Sign in with Passkey" button alongside Google OAuth when WebAuthn supported
- [x] Handle passkey login errors with user-friendly messages
- [x] Add loading state during passkey auth flow

Registration UI:
- [x] Add passkey section to ProfilePanel — "Set up Passkey" when no passkey, "Passkey registered" when set up
- [x] Handle registration success/failure with user feedback
- [x] Add option to re-register (replace) existing passkey

### Change: phone-image-collection (Mock data update)

> OpenSpec: `openspec/changes/phone-image-collection/`
> Read: specs/phone-data/spec.md

- [x] Expand MOCK_PHONES array in `src/mock/data.ts` to 60-80 phones from expanded catalog
- [x] Ensure mock data covers all difficulty tiers and diverse brands
- [x] Verify mock data entries have all required metadata fields
