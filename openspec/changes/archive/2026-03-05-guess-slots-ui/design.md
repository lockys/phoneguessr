## Context

GuessHistory renders 6 rows — filled guesses and empty placeholders. Empty rows currently show a grey circle at 30% opacity. The change adds a frosted glass effect and a "guesses left" counter.

## Goals / Non-Goals

**Goals:**
- Make remaining guesses visually distinct with a frosted/blurred background
- Show remaining guess count in the first empty slot

**Non-Goals:**
- Changing the layout or sizing of guess rows
- Adding animation to the empty slots

## Decisions

### 1. First empty row shows count, rest are minimal
**Decision**: The first empty row displays "N guesses left" centered text. Subsequent empty rows show just a subtle frosted bar (no icon, no text).

**Rationale**: Showing the count on every row would be redundant. One clear label plus visual empty slots communicates the same information more cleanly.

### 2. Frosted glass via backdrop-filter
**Decision**: Use `backdrop-filter: blur(4px)` with a semi-transparent background on empty rows for the frosted look.

## Risks / Trade-offs

- **backdrop-filter support** → 96%+ browser support. Falls back gracefully to just the semi-transparent background.
