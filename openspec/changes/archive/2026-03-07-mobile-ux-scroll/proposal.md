## Why

On mobile devices, the guess history renders all 6 rows (filled + empty placeholders) in a fixed column, pushing the phone autocomplete input off-screen. When the mobile keyboard opens, the input becomes completely invisible, forcing users to scroll blindly. This breaks the core gameplay loop on the primary target platform.

## What Changes

- Make the guess history area scrollable with a constrained height, so it never pushes the input off-screen
- Pin the phone autocomplete input to remain visible when the mobile keyboard is open
- Remove empty placeholder rows to reclaim vertical space — show only actual guesses plus a compact remaining-count indicator
- Auto-scroll guess history to the latest guess when a new one is added

## Capabilities

### New Capabilities
_None — this is a CSS/layout change within existing components._

### Modified Capabilities
_None — no spec-level behavior changes, only visual layout adjustments._

## Impact

- **Files**: `GuessHistory.tsx`, `Game.tsx`, `index.css`
- **Visual**: Guess history becomes a compact scrollable list; empty placeholder rows removed
- **Mobile UX**: Input remains visible during keyboard interaction
- **No API changes**, no new dependencies
