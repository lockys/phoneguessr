## Why

PhoneGuessr's core gameplay loop is complete, but the experience lacks the micro-interactions and polish that make daily puzzle games feel satisfying. Guess rows appear instantly with no animation. Winning feels muted beyond a confetti burst. Stats are plain numbers. New players have no guidance. There's no light theme, no audio feedback, and no way to install it as a PWA. These gaps keep PhoneGuessr from feeling like a finished product.

## What Changes

Seven UI polish features, prioritized by impact on perceived quality:

**P1 — Core Gameplay Feel:**
1. **Guess feedback animation** — Guess rows slide in from the right with a delayed color reveal (neutral → red/yellow/green). Wrong guesses shake; correct guesses pulse.
2. **Image reveal celebration** — On win, add a radial glow behind the revealed phone image. Enhances the cinematic zoom-out that already exists.

**P2 — Engagement & Retention:**
3. **Stats visualization** — Replace plain stat numbers in the Profile panel with a Wordle-style guess distribution histogram (horizontal bars for 1-6 guesses).
4. **Onboarding** — 3-step tutorial overlay for first-time players: explains blocks, guessing, and scoring. Shows once (localStorage tracked).

**P3 — Polish & Platform:**
5. **Dark/light theme** — Add a light theme option. Toggle in Profile panel. Persist choice in localStorage.
6. **Sound effects** — Optional SFX for block reveal, correct/wrong guess, and confetti. Muted by default. Toggle in Profile panel.
7. **PWA manifest** — Web app manifest with icons, splash screen, theme color, and an offline fallback page.

## Capabilities

### New Capabilities

- `guess-feedback-animation`: Animated guess row insertion with slide-in, color reveal, and feedback-specific effects (shake/pulse)
- `image-reveal-celebration`: Radial glow overlay effect behind the phone image on correct guess
- `stats-visualization`: Horizontal bar chart showing guess distribution in the Profile panel
- `onboarding-tutorial`: 3-step spotlight overlay for first-time players with localStorage persistence
- `theme-system`: Light/dark theme toggle with CSS custom properties and localStorage persistence
- `sound-effects`: Optional audio feedback for game events with mute toggle
- `pwa-manifest`: Web app manifest, service worker offline page, and home screen install support

### Modified Capabilities

- `profile-page`: Add theme toggle, sound toggle, and guess distribution histogram
- `result-modal`: Stats section links to profile histogram

## Impact

### Files Created
- `src/components/Onboarding.tsx` — 3-step tutorial overlay
- `src/components/GuessDistribution.tsx` — Horizontal bar chart component
- `public/manifest.json` — PWA manifest
- `public/offline.html` — Offline fallback page
- `public/sw.js` — Minimal service worker for offline fallback
- `public/icons/` — PWA icons (192x192, 512x512)
- `src/lib/sounds.ts` — Audio manager with lazy loading and mute toggle

### Files Modified
- `src/routes/index.css` — Animation keyframes, light theme variables, glow styles, histogram bars, onboarding overlay styles
- `src/components/GuessHistory.tsx` — Apply slide-in animation to new guess rows
- `src/components/CropReveal.tsx` — Add glow overlay element on win state
- `src/components/ProfilePanel.tsx` — Add theme toggle, sound toggle, guess distribution
- `src/components/Game.tsx` — Trigger onboarding, play sound effects on game events
- `src/routes/page.tsx` — Apply theme class to app container
- `src/locales/*.json` (all 5) — New i18n keys for onboarding, theme, sound, stats labels

### Priority Order for Implementation

1. Guess feedback animation (highest impact per effort — CSS only)
2. Image reveal celebration (small addition to existing zoom animation)
3. Stats visualization (standalone component, no dependencies)
4. Onboarding tutorial (standalone component, localStorage only)
5. PWA manifest (config files, no code dependencies)
6. Sound effects (needs audio files, optional feature)
7. Dark/light theme (touches many CSS rules, highest risk)
