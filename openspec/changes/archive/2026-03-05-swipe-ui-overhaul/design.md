## Context

PhoneGuessr is a single-page game built with Modern.js. Currently, everything renders vertically in one scrollable view: image, guess history, autocomplete input, game-over stats, and leaderboard. On mobile, this pushes important elements (input, results) off-screen. The game has no routing beyond the single page at `/`.

## Goals / Non-Goals

**Goals:**
- Split game and leaderboard into swipeable horizontal panels
- Show a translucent page indicator toast when switching panels
- Display game results (win/loss) in a centered modal overlay
- Reduce guess history row height so the input stays visible on small screens

**Non-Goals:**
- URL-based routing (panels are client-side only, no URL changes)
- Gesture physics (spring/momentum scrolling) — keep it simple with CSS snap
- Desktop-specific layouts or responsive breakpoints

## Decisions

### 1. CSS Scroll Snap for panel navigation
**Decision**: Use native CSS `scroll-snap-type: x mandatory` on a horizontal container.

**Alternatives considered**:
- **Touch event JS library (e.g., Swiper.js)**: Heavy dependency for a two-panel layout. Adds bundle size.
- **Manual touch event handling**: Fragile, needs momentum/physics logic.

**Rationale**: CSS Scroll Snap is well-supported (>95% browser coverage), zero-dependency, handles both touch swipe and mouse drag natively, and snaps cleanly to panel boundaries.

### 2. Panel structure
**Decision**: Two panels — "Game" (index 0) and "Leaderboard" (index 1). Both are full-width children of a `scroll-snap` container.

The `SwipeContainer` component wraps the panels and listens to `scroll` events to detect the active panel index. It passes the active index to a `PageIndicator` component.

### 3. Page indicator as fading toast
**Decision**: Show a translucent pill/badge (e.g., "Game" or "Leaderboard") that appears centered on panel change, then fades out after ~1.5s.

**Implementation**: CSS `opacity` transition + JS timeout. The indicator re-renders on panel change with a fresh timeout.

### 4. Result modal overlay
**Decision**: Render `GameOver` content inside a modal overlay (`position: fixed`, centered, backdrop blur). Triggered when game ends (after reveal animation completes).

The modal includes: win/loss title, stats (guesses, time), share button, and auth prompt. A close button or backdrop tap dismisses it.

### 5. Compact guess history rows
**Decision**: Reduce padding from `8px 12px` to `6px 10px`, font-size from `14px` to `13px`, and icon size from `16px` to `14px`. Empty row min-height reduced from `38px` to `30px`.

This saves ~40-50px total for 6 guess rows, keeping the autocomplete input above the fold.

## Risks / Trade-offs

- **Scroll snap browser quirks** → Test on iOS Safari specifically, where scroll-snap has had minor issues in older versions. Mitigation: graceful degradation (panels still work as overflow scroll without snap).
- **Modal blocking leaderboard access** → User might want to check leaderboard immediately after game ends. Mitigation: modal has a clear dismiss action, and swiping still works with modal closed.
- **Panel scroll state persistence** → If user swipes to leaderboard mid-game then swipes back, game state should be preserved. Mitigation: Both panels are always rendered (no lazy loading), game state lives in React state, unaffected by scroll position.
