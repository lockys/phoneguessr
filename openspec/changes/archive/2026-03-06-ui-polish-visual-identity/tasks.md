## 1. Guess Feedback Animation

- [ ] 1.1 Add CSS keyframes: `guess-slide-in` (translateX 20px → 0, opacity 0 → 1, 0.3s ease-out)
- [ ] 1.2 Add CSS keyframes: `guess-shake` (translateX ±3px, 2 cycles, 0.3s)
- [ ] 1.3 Add CSS keyframes: `guess-pulse` (scale 1 → 1.05 → 1, 0.3s)
- [ ] 1.4 Add `.guess-row-enter` class with slide-in animation and delayed border-color transition (0.15s delay, 0.2s transition)
- [ ] 1.5 Update GuessHistory.tsx: apply `.guess-row-enter` to newly added rows only (not on re-render of existing rows)
- [ ] 1.6 Apply `.guess-shake` to wrong guess rows, `.guess-pulse` to correct guess row after slide-in completes
- [ ] 1.7 Add `@media (prefers-reduced-motion: reduce)` — disable slide/shake/pulse, keep instant color change
- [ ] 1.8 Add haptic feedback on guess result (web-haptics: light for wrong, medium for right_brand, heavy for correct)

## 2. Image Reveal Celebration

- [ ] 2.1 Add `.crop-glow` class: pseudo-element with radial-gradient glow (accent color, 0.3 opacity, 120% size)
- [ ] 2.2 Add CSS keyframe: `glow-fade` (opacity 0 → 0.3 over 0.6s, hold, then 0 over 2s)
- [ ] 2.3 Update CropReveal.tsx: add glow element when game state is "won" and reveal animation is in progress
- [ ] 2.4 Add `@media (prefers-reduced-motion: reduce)` — skip glow animation
- [ ] 2.5 Verify glow does not interfere with canvas rendering or block grid z-index

## 3. Stats Visualization

- [ ] 3.1 Create GuessDistribution.tsx component: horizontal bar chart with labels 1–6
- [ ] 3.2 Read game history from localStorage to calculate distribution data
- [ ] 3.3 Add CSS for `.guess-distribution`, `.dist-bar`, `.dist-bar-fill`, `.dist-bar-highlight`
- [ ] 3.4 Integrate into ProfilePanel.tsx below the stats grid
- [ ] 3.5 Add i18n keys for "Guess Distribution" header and "No data yet" empty state to all 5 locales
- [ ] 3.6 Highlight the current game's guess count bar in green (if a game was just completed)

## 4. Onboarding Tutorial

- [ ] 4.1 Create Onboarding.tsx component: overlay with spotlight cutout, step content, Next/Skip/Done buttons
- [ ] 4.2 Define 3 steps with target element selectors and translated description text
- [ ] 4.3 Add CSS for `.onboarding-overlay`, `.onboarding-spotlight`, `.onboarding-tooltip`
- [ ] 4.4 Implement spotlight positioning using `getBoundingClientRect()` with RAF
- [ ] 4.5 Add localStorage persistence: `phoneguessr_onboarded` flag
- [ ] 4.6 Trigger onboarding in Game.tsx after start overlay is dismissed (first play only)
- [ ] 4.7 Add i18n keys for all 3 step descriptions, button labels to all 5 locales
- [ ] 4.8 Add `@media (prefers-reduced-motion: reduce)` — instant transitions between steps

## 5. Dark/Light Theme System

- [ ] 5.1 Add `[data-theme="light"]` CSS rule overriding all `:root` color tokens
- [ ] 5.2 Adjust frosted glass backdrop-filter opacities for light theme
- [ ] 5.3 Create theme toggle button in ProfilePanel.tsx
- [ ] 5.4 Implement localStorage persistence: `phoneguessr_theme` key
- [ ] 5.5 Apply `data-theme` attribute to `<html>` on page load (before first paint if possible)
- [ ] 5.6 Add i18n keys for "Theme", "Dark", "Light" to all 5 locales
- [ ] 5.7 Verify all components render correctly in light mode (visual QA pass)
- [ ] 5.8 Ensure PWA manifest `theme_color` updates with theme (meta tag)

## 6. Sound Effects

- [ ] 6.1 Create `src/lib/sounds.ts` module with lazy Audio object creation and play functions
- [ ] 6.2 Define sound events: blockReveal, wrongGuess, rightBrand, correctGuess, confettiPop
- [ ] 6.3 Source or generate royalty-free sound files (<20KB total), place in `public/sounds/`
- [ ] 6.4 Add mute toggle to ProfilePanel.tsx
- [ ] 6.5 Implement localStorage persistence: `phoneguessr_sound` key
- [ ] 6.6 Integrate sound triggers in Game.tsx at appropriate game events
- [ ] 6.7 Add i18n keys for "Sound", "On", "Off" to all 5 locales
- [ ] 6.8 Ensure sounds don't play on page load or when muted

## 7. PWA Manifest

- [ ] 7.1 Create `public/manifest.json` with app name, icons, colors, display mode
- [ ] 7.2 Create app icons: 192x192 and 512x512 PNG
- [ ] 7.3 Add `<link rel="manifest">` to HTML template
- [ ] 7.4 Add meta tags: `theme-color`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`
- [ ] 7.5 Create `public/offline.html` — styled fallback page matching app theme
- [ ] 7.6 Create minimal `public/sw.js` service worker for offline fallback only
- [ ] 7.7 Register service worker in app entry point
- [ ] 7.8 Test: app installs to home screen, offline page shows when disconnected

## 8. Verification

- [ ] 8.1 All animations use transform/opacity only (no layout-triggering properties)
- [ ] 8.2 `prefers-reduced-motion` disables all animations
- [ ] 8.3 All new strings have i18n keys in en, zh-TW, zh-CN, ja, ko
- [ ] 8.4 No hardcoded colors — all use CSS custom properties
- [ ] 8.5 Light theme renders all components without contrast issues
- [ ] 8.6 Biome lint passes with no errors
- [ ] 8.7 TypeScript compiles with no errors
- [ ] 8.8 Build succeeds: `npm run build`
