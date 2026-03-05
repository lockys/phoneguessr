## Why

The empty guess slots currently show plain grey circles with no context. Players can't quickly tell how many guesses remain. Adding a frosted/blurred visual treatment and a "X guesses left" label makes the remaining attempts immediately clear.

## What Changes

- Empty guess rows get a frosted glass (blur) visual treatment instead of plain low-opacity styling
- The first empty row shows "N guesses left" text to indicate remaining attempts
- Remaining empty rows stay minimal but styled consistently with the frosted look

## Capabilities

### New Capabilities
_(none)_

### Modified Capabilities
- `game-play`: Empty guess rows change from plain circles to frosted slots with remaining count

## Impact

- `src/components/GuessHistory.tsx` — Update empty row rendering
- `src/routes/index.css` — Update `.guess-empty` styles, add frosted glass effect
