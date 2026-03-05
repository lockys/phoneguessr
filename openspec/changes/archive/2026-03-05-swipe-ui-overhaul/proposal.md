## Why

The current single-page layout stacks all game content vertically — image, guess history, autocomplete, game-over stats, and leaderboard — which makes the screen feel cluttered on mobile. The leaderboard especially takes up significant space after the game ends. Moving to a swipeable multi-panel layout keeps the primary game view focused, puts the leaderboard a swipe away, and uses a compact modal for guess results instead of inline rendering.

## What Changes

- **Swipeable page panels**: Game content and leaderboard become separate horizontal panels. Users swipe left/right (or tap indicators) to navigate between them.
- **Page indicator toast**: A translucent overlay briefly appears when switching panels, showing which page the user is on (e.g., "Game" / "Leaderboard").
- **Guess result modal**: When the game ends (win or loss), show the result summary (score, stats, share button, auth prompt) in a centered popup modal instead of inline below the image.
- **Compact guess history UI**: Reduce the vertical footprint of the guess history rows so they don't push the autocomplete input off-screen on smaller devices.

## Capabilities

### New Capabilities
- `swipe-navigation`: Horizontal swipe-based panel navigation with page indicator toast
- `result-modal`: Popup modal for displaying game results (win/loss stats, share, auth prompt)

### Modified Capabilities
- `game-play`: Guess history rows become more compact; leaderboard moves out of main game view
- `leaderboard`: Leaderboard becomes its own swipeable panel instead of rendering inline after game-over

## Impact

- `src/routes/page.tsx` — Restructured to render swipeable panel container
- `src/components/Game.tsx` — Remove inline GameOver/Leaderboard rendering; trigger result modal instead
- `src/components/GameOver.tsx` — Refactored into a modal overlay component
- `src/components/Leaderboard.tsx` — Moved into its own panel within the swipe container
- `src/components/GuessHistory.tsx` — Compact row styling
- `src/routes/index.css` — New styles for swipe panels, page indicator, modal, compact rows
- New components: `SwipeContainer`, `PageIndicator`, `ResultModal`
