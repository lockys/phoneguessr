## 1. Remove empty placeholder rows

- [x] 1.1 In `GuessHistory.tsx`, remove the empty placeholder row rendering (the `<div className="guess-row guess-empty">` elements). Keep only the remaining-count indicator as a compact text line below actual guesses.
- [x] 1.2 In `index.css`, remove `.guess-empty`, `.guess-empty-label`, and `.guess-remaining` styles. Add a compact `.guess-remaining-text` style for the inline remaining count.

## 2. Make guess history scrollable on mobile

- [x] 2.1 In `index.css`, add a mobile media query (`max-width: 480px`) that constrains `.guess-history` with `max-height: 140px; overflow-y: auto` and hides the scrollbar.
- [x] 2.2 In `GuessHistory.tsx`, add a `useEffect` + `ref` to auto-scroll the guess history container to the bottom when a new guess is added.

## 3. Pin autocomplete input on mobile

- [x] 3.1 In `index.css`, add a mobile media query that makes `.autocomplete` sticky at the bottom of the scroll context: `position: sticky; bottom: 0; z-index: 10; background: var(--bg)`.
- [x] 3.2 Verify the app container uses `100dvh` (already set on `body`) so the sticky input adjusts when the mobile keyboard opens.

## 4. Verify

- [x] 4.1 Run `npm run dev:mock` and test: guess rows render without empty placeholders, guess history scrolls on mobile viewport, autocomplete stays visible during gameplay.
