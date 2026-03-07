## Context

The game layout is a flex column inside a swipe panel: `game-header` → `crop-wrapper` → `GuessHistory` → `PhoneAutocomplete`. The `.swipe-panel` has `overflow-y: auto`, but `.game` uses `flex: 1` without constraining the guess history height. GuessHistory renders all 6 slots (filled guesses + empty placeholders), each ~30-42px tall, consuming ~250px+ of vertical space regardless of game progress.

On mobile (viewport ~667px), after subtracting the header (~50px), crop image (aspect-ratio 1:1 ≈ ~350px on a 390px-wide phone), game-header (~60px), and autocomplete (~50px), there's only ~150px left — not enough for 6 rows. The keyboard further reduces available space by ~250px.

## Goals / Non-Goals

**Goals:**
- Guess history never pushes autocomplete off-screen on mobile
- Autocomplete input remains visible when mobile keyboard is open
- New guesses auto-scroll into view
- Maintain existing animation system (slide-in, shake, pulse)

**Non-Goals:**
- Redesigning the crop image sizing (separate concern)
- Desktop layout changes (desktop has enough space)
- Changing the game logic or guess count

## Decisions

### 1. Remove empty placeholder rows
**Choice:** Only render actual guess rows + a compact remaining-count line (no empty div placeholders).

**Rationale:** Empty rows exist purely as visual padding. Removing them saves ~150px when the game starts (5 empty rows × 30px). The remaining-count text ("3 guesses left") provides the same information in a single line.

**Alternative:** Keep placeholders but collapse them — adds complexity for no UX benefit.

### 2. Constrain guess history with max-height + overflow scroll
**Choice:** Add `max-height: 140px; overflow-y: auto` to `.guess-history` on mobile (via media query).

**Rationale:** 140px fits ~3 guess rows. On desktop, no constraint needed since there's ample space. The scrollable area is small enough that users can see the scroll indicator.

**Alternative:** Use `flex-shrink` to let guess history compress — less predictable, may squeeze rows too small.

### 3. Use `position: sticky` on autocomplete within the game flex container
**Choice:** Make `.autocomplete` sticky at the bottom of the `.swipe-panel` viewport.

**Rationale:** `position: sticky; bottom: 0` keeps the input anchored while the rest of the game content scrolls. This works naturally with the existing `.swipe-panel { overflow-y: auto }` scroll context. No JavaScript needed.

**Alternative:** `position: fixed` — breaks out of the layout flow, needs manual width/padding management, conflicts with swipe panels.

### 4. Handle mobile keyboard with `dvh` units + env(safe-area-inset-bottom)
**Choice:** Use `100dvh` for the app container height to account for dynamic viewport changes when the keyboard opens.

**Rationale:** The app already uses `min-height: 100dvh` on `body`. The `dvh` unit automatically adjusts when the mobile keyboard appears/disappears. Combined with sticky positioning, this ensures the input stays in view. No JavaScript `visualViewport` API needed.

**Alternative:** JavaScript `visualViewport` resize listener — more complex, works on older browsers but adds JS overhead.

## Risks / Trade-offs

- **Scrollable guess history may feel cramped on very small screens** → 140px max-height is a reasonable compromise; users can scroll to see earlier guesses
- **Sticky positioning may not work in all mobile browsers** → `position: sticky` has >96% browser support; fallback is natural document flow (acceptable degradation)
- **Removing empty rows changes the visual "game board" feel** → The colored border feedback on actual guesses is the important visual; empty rows add no gameplay value
