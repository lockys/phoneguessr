## 1. Swipe Container Infrastructure

- [x] 1.1 Create SwipeContainer component with CSS scroll-snap horizontal container holding two panel slots
- [x] 1.2 Add CSS for swipe container (scroll-snap-type: x mandatory, full-width panels, overflow-x auto)
- [x] 1.3 Detect active panel index via scroll event listener in SwipeContainer

## 2. Page Indicator Toast

- [x] 2.1 Create PageIndicator component that shows panel name ("Game" / "Leaderboard") as a translucent centered pill
- [x] 2.2 Add CSS for page indicator (fixed position, backdrop-filter blur, opacity fade transition)
- [x] 2.3 Wire PageIndicator to SwipeContainer — show on panel change, auto-dismiss after 1.5s, skip on initial load

## 3. Page Layout Integration

- [x] 3.1 Restructure page.tsx to render SwipeContainer with Game as panel 0 and Leaderboard as panel 1
- [x] 3.2 Move Leaderboard out of Game.tsx — it now renders independently in panel 1
- [x] 3.3 Verify game state is preserved when swiping between panels

## 4. Result Modal

- [x] 4.1 Create ResultModal component with fixed overlay, centered content, backdrop blur, and close button
- [x] 4.2 Add CSS for modal (position fixed, inset 0, backdrop-filter, centered card, enter animation)
- [x] 4.3 Move GameOver content (stats, share button, auth prompt) into ResultModal
- [x] 4.4 Trigger ResultModal in Game.tsx on reveal complete (replacing inline showResults rendering)
- [x] 4.5 Implement modal dismissal via close button and backdrop tap

## 5. Compact Guess History

- [x] 5.1 Reduce guess row padding to 6px 10px, font-size to 13px, icon size to 14px
- [x] 5.2 Reduce empty guess row min-height from 38px to 30px
- [x] 5.3 Verify guess history + autocomplete input fit on screen without scrolling on mobile

## 6. Verification

- [x] 6.1 Verify swipe navigation works on mobile (touch) and desktop (mouse drag)
- [x] 6.2 Verify page indicator toast appears on panel switch and auto-dismisses
- [x] 6.3 Verify result modal shows on game end with correct content and is dismissable
- [x] 6.4 Verify leaderboard displays correctly in its own panel
