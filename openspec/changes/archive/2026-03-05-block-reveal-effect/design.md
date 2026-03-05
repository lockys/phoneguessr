## Context

CropReveal currently uses `transform: scale(X)` to zoom into the phone image during gameplay, then zooms out on correct guess (1.2s) or loss (0.5s). The container is a square (`aspect-ratio: 1`, max-width 480px) with `overflow: hidden`.

The user wants a more dramatic visual — opaque blocks covering the image that dissolve away progressively, then cascade away on correct guess.

## Goals / Non-Goals

**Goals:**
- Overlay a grid of opaque blocks on the phone image during gameplay
- Progressive block removal: each wrong guess dissolves a batch of blocks
- Dramatic cascading block dissolution on correct guess (staggered animation)
- Combine with existing zoom-out for a layered reveal effect
- Quick block clear on loss (no celebration)
- Zero new dependencies — pure CSS/React

**Non-Goals:**
- Canvas-based rendering or WebGL effects
- Sound effects
- Changing the underlying zoom mechanic (keep `transform: scale`)
- Per-pixel blur or frosted-glass effects

## Decisions

### 1. CSS Grid overlay with individually animated divs

**Choice:** Render an NxN grid of absolutely-positioned `<div>` elements over the image. Each block has a solid background color (matching the app background `--bg`) and animates opacity/scale to disappear.

**Why:** Simple, performant, no dependencies. Each block is a plain div with `opacity` and `transform` transitions — both are GPU-composited properties. React renders the grid once; subsequent reveals just toggle CSS classes.

**Alternative considered:** CSS `background: repeating-conic-gradient` or SVG mask. Rejected — no per-cell animation control for stagger effects.

### 2. Grid size: 6x6 (36 blocks)

**Choice:** 6x6 grid gives enough granularity for visual interest while keeping DOM node count low.

**Why:** 36 divs is trivial for the browser. Larger grids (10x10 = 100) add marginal visual value but more DOM overhead. 6x6 maps cleanly to 6 guess levels — each wrong guess can reveal ~6 blocks.

### 3. Block removal pattern per guess level

**Choice:** Pre-compute which blocks to remove at each level. Use a shuffled order (seeded by puzzle date for consistency) so the pattern feels random but is deterministic.

Block reveal schedule:
- Level 0 (start): All 36 blocks visible → image fully hidden
- Level 1 (1 wrong guess): 6 blocks removed (30 remaining)
- Level 2: 6 more removed (24 remaining)
- Level 3: 6 more removed (18 remaining)
- Level 4: 6 more removed (12 remaining)
- Level 5: 6 more removed (6 remaining)
- Reveal (win/loss): Remaining blocks cascade away

Each removal batch uses a staggered animation (30ms delay per block within the batch) for a dissolve-wave effect.

### 4. Win cascade: staggered scale + fade

**Choice:** On correct guess, remaining blocks animate out with `transform: scale(1.3)` + `opacity: 0` in a spiral or random stagger pattern (40ms between each block). Total duration ~1.2s to match the zoom-out.

**Why:** Scale-up + fade creates an "explosion" feel — blocks pop outward and vanish. The stagger creates a wave that draws the eye across the image.

### 5. Loss: fast batch clear

**Choice:** On loss, all remaining blocks fade out simultaneously over 0.3s. No stagger, no scale — just a quick opacity transition.

**Why:** Matches the existing fast reveal philosophy. No celebration for a loss.

### 6. Block color matches app background

**Choice:** Blocks use `var(--bg)` (#1a1a2e) as their background color. This makes the grid look like the image is behind a dark wall with holes punched in it.

**Why:** Seamless visual integration. No jarring color mismatch. The dark blocks look intentional against the dark app theme.

## Risks / Trade-offs

- **36 extra DOM nodes** → Negligible performance impact. All animations use GPU-composited properties (opacity, transform).
- **Deterministic shuffle may occasionally reveal key features early** → Acceptable. The blocks are supplemental to the zoom crop — even with blocks removed, the zoom still restricts what's visible.
- **Block edges visible on non-integer pixel sizes** → Use `will-change: transform` and ensure blocks tile perfectly with `%` sizing. Sub-pixel gaps are acceptable and may add visual texture.
