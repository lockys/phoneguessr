## Context

The game currently loads and starts the timer immediately. New users may not understand the game before the clock is ticking. The 4-panel swipe navigation (Profile, Game, Leaderboard, About) has no visual cue that swiping is possible. The language selector in the header takes space on every panel.

## Goals / Non-Goals

**Goals:**
- Add a "ready screen" overlay before game starts — frosted glass backdrop with a Start button
- Only show the overlay on first visit for today's puzzle (not when returning to a completed puzzle)
- Show contextual swipe hints (left/right panel names) briefly during navigation
- Relocate language selector to Profile panel for a cleaner header

**Non-Goals:**
- Tutorial or multi-step onboarding
- Animated transitions for the overlay dismissal (keep it simple — instant remove or quick fade)
- Persisting swipe hint dismissal across sessions

## Decisions

### 1. Overlay as a state in Game component
**Decision**: Add a `ready` state before `playing` in Game.tsx. When `ready`, render a frosted glass overlay on top of the game content (image + blocks are visible underneath, blurred). Clicking "Start" transitions to `playing` and starts the timer.

**Rationale**: Keeping it in Game.tsx means the puzzle data and image load behind the overlay, so there's no delay when the user clicks Start.

### 2. Swipe hints in SwipeContainer with auto-fade
**Decision**: Render left/right hint labels as fixed-position elements at the bottom of the screen. Show them for ~3 seconds on first panel switch, then fade out. Use the translated panel names from the adjacent panels.

**Rationale**: Fixed position ensures they don't interfere with panel content. Brief display teaches the gesture without being intrusive. Only shown on first swipe so returning users aren't bothered.

### 3. Language selector in ProfilePanel
**Decision**: Move LanguageSelector from `page.tsx` header into ProfilePanel, below the stats grid. Remove from header entirely.

**Rationale**: Language is a settings-like action, not a frequent interaction. Profile panel is the natural home for preferences. This declutters the header.

## Risks / Trade-offs

- **Overlay on already-played puzzle**: Must not show overlay if puzzle was already completed (check localStorage first). The `ready` state should only be set for fresh puzzles.
- **Swipe hints timing**: 3 seconds may feel too long or too short. Can be tuned easily via constant.
