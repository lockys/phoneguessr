## 1. CropReveal Transform Refactor

- [x] 1.1 Replace clip-path inset crop levels with scale factor constants (4.17, 2.50, 1.79, 1.39, 1.14, 1.00)
- [x] 1.2 Update CropReveal to use `transform: scale(X)` with `transform-origin: center` instead of `clipPath: inset()`
- [x] 1.3 Ensure container `overflow: hidden` clips the scaled image correctly (verify existing CSS)

## 2. Reveal Animation

- [x] 2.1 Add `isWin` prop to CropReveal to differentiate win vs loss animation timing
- [x] 2.2 Implement win reveal: 1.2s zoom-out transition with smooth easing (scale X → 1)
- [x] 2.3 Implement loss reveal: 0.5s zoom-out transition with ease-out
- [x] 2.4 Handle returning to completed puzzle — show scale(1) immediately with no transition

## 3. Game-Over UI Delay

- [x] 3.1 Add `onRevealComplete` callback prop to CropReveal (fires on `transitionend` with setTimeout fallback)
- [x] 3.2 Update Game component to defer GameOver/Leaderboard rendering until reveal animation completes
- [x] 3.3 Ensure game-over UI appears immediately when loading a previously completed puzzle (no delay)

## 4. Polish & Verification

- [x] 4.1 Test progressive zoom during gameplay — each wrong guess zooms out smoothly (0.4s)
- [x] 4.2 Test win reveal at different guess counts (1st guess through 5th guess)
- [x] 4.3 Verify loss reveal feels appropriately fast and non-celebratory
- [x] 4.4 Verify returning to completed puzzle shows full image and stats immediately
