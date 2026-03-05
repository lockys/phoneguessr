## Context

PhoneGuessr has a complete dark-themed design system using CSS custom properties (11 tokens in `:root`). The app is mobile-first (480px max-width) with frosted glass effects, system fonts, and GPU-accelerated animations. The existing animation vocabulary includes block pop-out, modal slide-up, hint fade, and cursor blink. Haptic feedback is integrated via web-haptics. The game uses canvas rendering for phone images with DPR-aware scaling.

## Goals / Non-Goals

**Goals:**
- Define animation specs for guess row feedback that feel responsive and satisfying
- Specify a glow effect for the win celebration that complements the existing zoom-out
- Design a Wordle-style guess distribution histogram for the Profile panel
- Define a 3-step onboarding flow that teaches the game without being annoying
- Specify light theme color tokens that pair with the existing dark palette
- Define an audio system with lazy-loaded SFX and a mute toggle
- Specify PWA manifest and offline fallback for home screen installs

**Non-Goals:**
- Custom fonts or typography changes — system font stack is fine
- Lottie or heavy animation libraries — CSS keyframes and canvas only
- Full offline gameplay — offline fallback is a static "you're offline" page
- Service worker caching of game assets — just the offline fallback
- Dark/light auto-detection — manual toggle only (auto-detect can be added later)
- Sound effects for navigation/swipe — only game-critical events

## Decisions

### 1. Guess Feedback Animation — Slide-in with Delayed Color Reveal

**Decision**: New guess rows animate in from the right (translateX) over 0.3s, starting with a neutral border. After 0.15s delay, the border color transitions to the feedback color (red/yellow/green) over 0.2s. Wrong guesses get a subtle horizontal shake (3px, 2 cycles). Correct guesses get a scale pulse (1.0 → 1.05 → 1.0).

**Rationale**: The 2-phase animation (position → color) creates anticipation. The shake/pulse gives instant visceral feedback. All animations use transform/opacity for GPU compositing. Total animation time is under 0.5s to not delay gameplay.

**CSS approach**:
```
@keyframes guess-slide-in { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
@keyframes guess-shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } }
@keyframes guess-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
```

### 2. Image Reveal Celebration — Radial Glow Behind Image

**Decision**: On correct guess, add a pseudo-element behind the crop container that renders a radial gradient glow (accent color at 0.3 opacity, fading to transparent). The glow fades in over 0.6s (matching the middle of the zoom-out) and fades out over 2s.

**Rationale**: A glow behind the image emphasizes the "reveal" moment without competing with the confetti. Using a pseudo-element keeps the DOM clean. The effect is purely decorative and skippable with `prefers-reduced-motion`.

**Visual**: Soft red-pink (#e94560) radial glow, 120% of container size, centered behind the image.

### 3. Stats Visualization — Horizontal Guess Distribution

**Decision**: A horizontal bar chart in the Profile panel showing guess distribution (1–6 guesses). Each bar label shows the guess number (left) and count (right). Bar width is proportional to the max count. The bar for the current game's guess count is highlighted in green; others use the accent color at 40% opacity.

**Rationale**: Wordle popularized this exact visualization. Players immediately understand it. CSS-only implementation (no charting library) — each bar is a div with percentage width. Data comes from localStorage game history, no API needed.

**Layout**:
```
1  ████████████████████  5
2  ████████████  3
3  ████  1
4  ██████████████████  4
5  ██  0
6  ████  1
```

### 4. Onboarding — 3-Step Spotlight Tutorial

**Decision**: A semi-transparent dark overlay with a "spotlight" cutout that highlights the relevant UI area. Three steps:
1. Spotlight on crop container: "A phone is hidden behind blocks"
2. Spotlight on autocomplete input: "Type to guess the phone model"
3. Spotlight on guess history area: "Fewer guesses = higher score!"

Each step has Next/Skip buttons. After the final step, show a "Got it!" button. Persist `phoneguessr_onboarded: true` in localStorage.

**Rationale**: Spotlight tutorials are familiar from mobile apps. Three steps is the minimum to explain the game. Skippable for impatient users. localStorage means it never shows again.

**Trigger**: Show after the start overlay is dismissed (first play only). If the user has already played (localStorage has game history), skip onboarding.

### 5. Theme System — Light Mode via CSS Custom Properties

**Decision**: Add a `[data-theme="light"]` selector that overrides all `:root` color tokens. The theme toggle is a button in the Profile panel. Persist choice in `localStorage` as `phoneguessr_theme: "dark" | "light"`. Apply theme attribute to `<html>` element on load.

**Light theme tokens**:
```css
[data-theme="light"] {
  --bg: #f5f5f7;
  --surface: #ffffff;
  --surface-hover: #f0f0f2;
  --text: #1a1a2e;
  --text-muted: #6b6b7e;
  --accent: #e94560;    /* unchanged */
  --green: #16a34a;     /* darker green for light bg */
  --yellow: #ca8a04;    /* darker yellow for light bg */
  --red: #dc2626;       /* darker red for light bg */
  --border: #d4d4d8;
}
```

**Rationale**: CSS custom property overrides mean zero JavaScript styling logic. The `data-theme` attribute on `<html>` ensures the entire page picks up the theme. Accent color stays the same for brand consistency. Feedback colors are adjusted for contrast on light backgrounds.

### 6. Sound Effects — Lazy-Loaded Audio with Mute Toggle

**Decision**: Create a `sounds.ts` module that lazily creates `Audio` objects on first use. Sound events:
- Block reveal: short subtle "tick" (~100ms)
- Wrong guess: low "buzz" (~200ms)
- Right brand: medium "ding" (~200ms)
- Correct guess: ascending "chime" (~400ms)
- Confetti: brief "pop" (~150ms)

Muted by default. Toggle in Profile panel persists to `localStorage` as `phoneguessr_sound: boolean`. Audio files are small (<20KB total), stored in `public/sounds/`.

**Rationale**: Muted by default respects users in public settings. Lazy loading means zero impact on initial page load. Small file sizes ensure no perceptible delay. The sounds reinforce the visual feedback without being annoying.

### 7. PWA Manifest — Home Screen Install

**Decision**: Add `public/manifest.json` with:
- `name`: "PhoneGuessr"
- `short_name`: "PhoneGuessr"
- `start_url`: "/"
- `display`: "standalone"
- `theme_color`: "#1a1a2e"
- `background_color`: "#1a1a2e"
- `icons`: 192x192 and 512x512 PNG (simple phone icon with accent color)

Add a minimal service worker that intercepts failed navigations and serves `offline.html`. No asset caching — just the offline fallback.

**Rationale**: Standalone display removes the browser chrome for a native-app feel. The offline page prevents a blank error screen when connectivity drops. Keeping the service worker minimal avoids cache invalidation complexity.

## Risks / Trade-offs

- **Light theme visual QA**: Every component needs checking in light mode. The frosted glass effects (backdrop-filter) may need opacity adjustments for light backgrounds.
- **Sound effect licensing**: Audio files need to be royalty-free or custom-made. Consider generating simple tones programmatically with Web Audio API as a fallback if sourcing files is problematic.
- **Onboarding positioning**: The spotlight cutout positioning depends on DOM layout, which varies by viewport. Use `getBoundingClientRect()` with a requestAnimationFrame to handle layout shifts.
- **Animation performance**: All animations must stay on the compositor thread (transform/opacity only). The glow pseudo-element should use `will-change: opacity` for smooth fade.
- **PWA icon creation**: Need to create or source a suitable app icon. Can be a simple geometric design using the accent color palette.
- **prefers-reduced-motion**: All animations must have reduced-motion variants (instant transitions or static states). The sound system is unaffected by this preference.
