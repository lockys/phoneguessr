# PWA Icon & Install Prompt — Design Spec

**Date:** 2026-03-26
**Status:** Approved

---

## Overview

Replace the current placeholder PWA icons with a real app icon (dark navy, white phone, amber `?`), complete the PWA manifest and iOS meta tags, and add a subtle install prompt banner that appears after the user's first completed game.

---

## Scope

**In scope:**
- App icon SVG + PNG generation script (192, 512, 180 apple-touch, 32 favicon, plus maskable variants)
- `manifest.json` additions (`id`, maskable icons, `display_override`)
- iOS/Apple meta tags in `modern.config.ts`
- `favicon-32x32.png` and `apple-touch-icon.png` links in HTML head
- `InstallPrompt` component: post-first-game banner with Install + dismiss
- iOS fallback banner ("Share → Add to Home Screen") when `beforeinstallprompt` is unavailable
- One-line write to `localStorage` in `Game.tsx` to signal install eligibility

**Out of scope:**
- Push notifications
- Offline gameplay (service worker already caches assets)
- Manifest `screenshots` field (requires actual app screenshots)
- Splash screens

---

## Icon Design

### Visual

- **Background:** `#1a1a2e` (matches app theme color)
- **Shape:** Rounded rectangle (iOS/Android clip to their own radius)
- **Phone body:** White (`#e2e8f0`), centered, portrait orientation
- **Phone screen:** Dark (`#0f172a`)
- **Question mark:** Amber (`#f59e0b`), centered on screen, bold weight
- **Home button:** Small circle `#94a3b8` below screen

### Two icon variants

**Standard (`any`):** Icon fills the full canvas — optimized for iOS (which clips to its own rounded rect) and for browser favicons.

**Maskable:** The same design but with ~12% inset padding on all sides so the visual content stays inside Android's 80% "safe zone" circle when Android clips to squircle/circle. The background `#1a1a2e` fills the full canvas including the padding area.

The generation script outputs both variants as separate files.

### Generated files

| File | Size | Purpose |
|------|------|---------|
| `phoneguessr/config/public/icons/icon-192x192.png` | 192×192 | Android PWA, manifest (`any`) |
| `phoneguessr/config/public/icons/icon-512x512.png` | 512×512 | Android splash, manifest (`any`) |
| `phoneguessr/config/public/icons/icon-192x192-maskable.png` | 192×192 | Manifest (`maskable`) |
| `phoneguessr/config/public/icons/icon-512x512-maskable.png` | 512×512 | Manifest (`maskable`) |
| `phoneguessr/config/public/icons/apple-touch-icon.png` | 180×180 | iOS home screen (no corner rounding needed) |
| `phoneguessr/config/public/icons/favicon-32x32.png` | 32×32 | Browser tab favicon |

### Generation script

`phoneguessr/scripts/generate-icons.ts` — uses `sharp` (already a devDependency at `^0.34.5`) to rasterize inline SVG strings at each required size. Run once manually; outputs are committed to the repo.

```bash
cd phoneguessr && npx tsx scripts/generate-icons.ts
```

The script defines two SVG strings:
- `svgStandard` — full-bleed design
- `svgMaskable` — same design with 12% inset (phone body/icon scaled down and centered, background fills full canvas)

`sharp` converts each SVG buffer → PNG at the required sizes. The script overwrites existing files in `config/public/icons/`.

---

## Manifest Updates

File: `phoneguessr/config/public/manifest.json`

**Additions:**

1. `"id": "/"` — stable app identity, prevents browser from treating a future `start_url` change as a new app
2. `"display_override": ["standalone", "minimal-ui"]` — allows `minimal-ui` fallback on browsers that don't fully support `standalone`
3. Four icon entries: `any` (192, 512) + `maskable` (192, 512) as separate files

**Final icons array:**
```json
"icons": [
  { "src": "/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
  { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
  { "src": "/icons/icon-192x192-maskable.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
  { "src": "/icons/icon-512x512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
]
```

---

## HTML Head Tags

File: `phoneguessr/modern.config.ts` — extend the existing `html.tags` array.

**Add:**
```ts
{ tag: 'meta', attrs: { name: 'apple-mobile-web-app-capable', content: 'yes' } },
{ tag: 'meta', attrs: { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' } },
{ tag: 'meta', attrs: { name: 'apple-mobile-web-app-title', content: 'PhoneGuessr' } },
{ tag: 'link', attrs: { rel: 'apple-touch-icon', href: '/icons/apple-touch-icon.png' } },
{ tag: 'link', attrs: { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/icons/favicon-32x32.png' } },
```

---

## Install Eligibility Signal

File: `phoneguessr/src/components/Game.tsx`

When a game result is saved (the `saveResult` call / post-game flow), write a single localStorage flag — **regardless of whether the user is authenticated or not**:

```ts
localStorage.setItem('phoneguessr_install_eligible', 'true');
```

This must be written for both authenticated users (whose results go to the DB) and unauthenticated users. It is the single condition `InstallPrompt` depends on. It is written once and never removed.

---

## Install Prompt Component

### Files

| Action | File |
|--------|------|
| Create | `phoneguessr/src/components/InstallPrompt.tsx` |
| Create | `phoneguessr/src/components/install-prompt.css` |
| Modify | `phoneguessr/src/routes/layout.tsx` |
| Modify | `phoneguessr/src/components/Game.tsx` |

### Logic

**`beforeinstallprompt` registration:**

The event fires early in the page lifecycle — potentially before React hydrates child components. It must be captured in `layout.tsx`'s existing `useEffect([])` (which already registers the service worker). Store the deferred event in a module-scoped variable so `InstallPrompt` can read it on mount without risking a race.

```ts
// layout.tsx — module-scoped, captured before any component effect
let _deferredPrompt: BeforeInstallPromptEvent | null = null;

export function getDeferredPrompt() { return _deferredPrompt; }

// Inside layout.tsx useEffect([]) alongside SW registration:
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  _deferredPrompt = e as BeforeInstallPromptEvent;
});
```

`InstallPrompt` calls `getDeferredPrompt()` on mount and on window focus — no listener of its own needed.

**iOS detection:**
```ts
const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone =
  window.matchMedia('(display-mode: standalone)').matches ||
  (('standalone' in window.navigator) && (window.navigator as { standalone?: boolean }).standalone === true);
```

**Show condition:** Display the banner when ALL of:
1. `isStandalone === false`
2. `localStorage.getItem('phoneguessr_install_dismissed') !== 'true'`
3. `localStorage.getItem('phoneguessr_install_eligible') === 'true'`
4. For Android: `deferredPrompt !== null` (the browser supports install)
   For iOS: `isIos === true` (show the share instruction variant)

Re-check conditions on `window` focus (for the case where the user plays a game in another tab and returns).

**Android banner:**
```
┌─────────────────────────────────────────────────────────┐
│  📱  Add PhoneGuessr to your home screen    [Install] [×] │
└─────────────────────────────────────────────────────────┘
```
- "Install" calls `deferredPrompt.prompt()`, awaits `userChoice`, hides banner regardless of choice, sets `phoneguessr_install_dismissed = 'true'`
- `×` sets `phoneguessr_install_dismissed = 'true'` and hides

**iOS banner:**
```
┌──────────────────────────────────────────────────────────┐
│  📱  Tap ⎙ then "Add to Home Screen" to install    [×]   │
└──────────────────────────────────────────────────────────┘
```
- No Install button (iOS does not support programmatic install)
- `×` sets `phoneguessr_install_dismissed = 'true'` and hides

### Mount point

In `phoneguessr/src/routes/layout.tsx`, import and render `<InstallPrompt />` as the last child before the closing root element tag.

### CSS

`install-prompt.css`:
- Fixed bottom, full width, `z-index: 1000`
- Dark background `#161b22`, border-top `1px solid #30363d`
- Flex row, `align-items: center`, `gap: 12px`, `padding: 12px 16px`
- Install button: `background: #1f6feb`, `border: none`, `border-radius: 6px`, white text
- Dismiss button: text-only `×`, muted color
- Slide-up entry animation: `transform: translateY(100%)` → `translateY(0)`, 300ms ease

---

## localStorage Keys

| Key | Type | Written by | Read by |
|-----|------|-----------|---------|
| `phoneguessr_install_dismissed` | `'true'` | `InstallPrompt` on dismiss or successful prompt | `InstallPrompt` on mount + focus |
| `phoneguessr_install_eligible` | `'true'` | `Game.tsx` on result save (all users) | `InstallPrompt` on mount + focus |

Key prefix `phoneguessr_` matches the project convention (e.g. `phoneguessr_2026-03-26`).

---

## Error Handling

| Scenario | Behaviour |
|----------|-----------|
| `beforeinstallprompt` never fires (desktop, Firefox, already installed) | Banner never shows — no error |
| Already in standalone mode | Banner never shows |
| `deferredPrompt.prompt()` throws | Catch silently, set dismissed, hide banner |
| `phoneguessr_install_eligible` key absent | Banner never shows |
| Non-iOS, no `beforeinstallprompt` (e.g. Firefox mobile) | Banner never shows |

---

## Modified Files Summary

| Action | File | Change |
|--------|------|--------|
| Create | `phoneguessr/scripts/generate-icons.ts` | SVG → PNG icon generation script |
| Create | `phoneguessr/config/public/icons/icon-192x192.png` | Regenerated real icon (any) |
| Create | `phoneguessr/config/public/icons/icon-512x512.png` | Regenerated real icon (any) |
| Create | `phoneguessr/config/public/icons/icon-192x192-maskable.png` | New maskable variant |
| Create | `phoneguessr/config/public/icons/icon-512x512-maskable.png` | New maskable variant |
| Create | `phoneguessr/config/public/icons/apple-touch-icon.png` | New 180×180 icon |
| Create | `phoneguessr/config/public/icons/favicon-32x32.png` | New 32×32 favicon |
| Modify | `phoneguessr/config/public/manifest.json` | `id`, `display_override`, maskable icon entries |
| Modify | `phoneguessr/modern.config.ts` | Apple meta tags + icon link tags |
| Create | `phoneguessr/src/components/InstallPrompt.tsx` | Install banner component |
| Create | `phoneguessr/src/components/install-prompt.css` | Banner styles |
| Modify | `phoneguessr/src/routes/layout.tsx` | Mount `<InstallPrompt />` |
| Modify | `phoneguessr/src/components/Game.tsx` | Write `phoneguessr_install_eligible` on result save |
