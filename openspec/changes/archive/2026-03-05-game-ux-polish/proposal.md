## Why

New players have no onboarding moment — the game starts immediately with the timer running, which can feel abrupt. There's also no visual guidance that swiping navigates between panels, and the language selector clutters the game header.

## What Changes

- Add a frosted glass overlay on the game panel when first landing, with a "Start" button. Clicking start dismisses the overlay and begins the timer countdown.
- Move the language selector from the app header to the Profile (record) panel.
- Add swipe navigation hints at the bottom of the screen (e.g., "← About" / "Record →") that appear briefly when switching panels, then fade out.

## Capabilities

### New Capabilities

- `game-start-overlay`: Frosted overlay with start button shown on first visit before timer begins
- `swipe-hints`: Contextual navigation hints showing adjacent panel names at screen edges

### Modified Capabilities

- `language-selector`: Move language selector from app header to Profile panel

## Impact

- `src/components/Game.tsx` — start overlay state, delay timer until start
- `src/components/SwipeContainer.tsx` — swipe hint rendering and auto-hide logic
- `src/components/ProfilePanel.tsx` — add LanguageSelector
- `src/routes/page.tsx` — remove LanguageSelector from header
- `src/routes/index.css` — new styles for overlay, hints
- `src/locales/*.json` — new translation keys for start button and hint labels
