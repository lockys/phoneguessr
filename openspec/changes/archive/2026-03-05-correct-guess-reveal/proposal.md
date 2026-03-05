## Why

When the player guesses the phone correctly, the current reveal is underwhelming — the clip-path simply expands from the current crop level to the full image over 0.4s. This misses a key moment of delight. A cinematic zoom-out from the cropped portion to the full phone photo would create the satisfying "aha!" payoff that makes daily puzzle games addictive and shareable.

## What Changes

- Replace the basic clip-path unmasking on correct guess with a zoom-out reveal animation
- During gameplay, the cropped image appears zoomed-in (filling the container) so players see detail
- On correct guess, the image smoothly zooms out from the cropped portion to reveal the full phone — a dramatic pull-back effect
- The animation should feel polished: appropriate duration (~1-1.5s), smooth easing, and a brief pause before the game-over stats appear
- On loss, use a simpler/faster reveal (no celebratory effect)

## Capabilities

### New Capabilities
- `reveal-animation`: Zoom-out reveal animation system for the CropReveal component, triggered on correct guess. Covers animation timing, easing, CSS transform approach, and coordination with game-over UI appearance.

### Modified Capabilities

## Impact

- `src/components/CropReveal.tsx` — Major changes: replace clip-path-only approach with CSS transform (scale + translate) for the zoomed-in crop, then animate to scale(1) on reveal
- `src/components/Game.tsx` — Minor: may need to delay game-over UI appearance until animation completes
- `src/routes/index.css` — Animation keyframes or transition classes
- No backend changes, no new dependencies
