## 1. Game Start Overlay

- [x] 1.1 Add `ready` state to Game.tsx: show overlay before `playing`, don't start timer until Start is clicked
- [x] 1.2 Create StartOverlay component: frosted glass backdrop over game content with centered Start button
- [x] 1.3 Add CSS for `.start-overlay` (backdrop-filter blur, semi-transparent bg, centered button)
- [x] 1.4 Skip overlay when puzzle already completed (localStorage check)
- [x] 1.5 Add i18n keys for start button text (`game.start`) to all 5 locale files

## 2. Move Language Selector

- [x] 2.1 Remove LanguageSelector import and usage from page.tsx header
- [x] 2.2 Add LanguageSelector to ProfilePanel below the stats grid
- [x] 2.3 Adjust CSS if needed for language selector in profile context

## 3. Swipe Navigation Hints

- [x] 3.1 Add SwipeHints component: fixed-position left/right labels showing adjacent panel names
- [x] 3.2 Integrate SwipeHints into SwipeContainer, passing activeIndex and panel names
- [x] 3.3 Add auto-fade logic: show hints on panel switch, fade out after ~3 seconds
- [x] 3.4 Add CSS for `.swipe-hint-left` / `.swipe-hint-right` (fixed bottom, small text, fade animation)
- [x] 3.5 Add i18n keys for hint arrows/labels if needed

## 4. Verification

- [x] 4.1 Verify overlay shows on fresh puzzle, hides on completed puzzle
- [x] 4.2 Verify timer starts only after clicking Start
- [x] 4.3 Verify language selector works correctly in Profile panel
- [x] 4.4 Verify swipe hints show correct adjacent panel names and auto-fade
- [x] 4.5 Verify build passes with no TypeScript errors
