## Why

The current reveal is a clean zoom-out, but a tile/block overlay that dissolves away creates a more visually striking "unveiling" moment. Block reveals are a proven pattern in puzzle games (think Wordle's tile flips, picture puzzle reveals) — they build anticipation during gameplay and deliver a satisfying cascade when the answer is correct.

## What Changes

- Add a CSS grid overlay of opaque blocks on top of the phone image during gameplay
- Each wrong guess removes a batch of blocks (staggered fade-out), progressively exposing the image underneath
- On correct guess, remaining blocks cascade away with a dramatic staggered animation (scale + fade)
- The existing zoom-out still happens underneath, but the block dissolution is the primary visual spectacle
- On loss, blocks clear quickly without fanfare
- No blocks shown when returning to a completed puzzle

## Capabilities

### New Capabilities

### Modified Capabilities
- `reveal-animation`: Adding block overlay grid on top of the existing zoom reveal. Blocks dissolve progressively during gameplay and cascade dramatically on correct guess.

## Impact

- `src/components/CropReveal.tsx` — Add block grid overlay layer and dissolution logic
- `src/routes/index.css` — Block grid styles and keyframe animations
- No backend changes, no new dependencies (pure CSS grid + inline styles for stagger delays)
