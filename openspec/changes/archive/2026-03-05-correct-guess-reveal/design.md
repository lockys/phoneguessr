## Context

CropReveal currently uses CSS `clip-path: inset()` to progressively reveal a phone image. Each wrong guess widens the visible area by reducing the inset percentage. On correct guess, `revealed` flips to true and the clip-path transitions to `inset(0)` over 0.4s — functional but anticlimactic.

The game container is a square (`aspect-ratio: 1`, max-width 480px) with `overflow: hidden`. Images vary from 648px to 1600px wide.

## Goals / Non-Goals

**Goals:**
- Cinematic zoom-out reveal on correct guess — camera-pull-back feel
- During gameplay, player sees a zoomed-in portion of the phone (detail view)
- On correct guess, smooth zoom-out from detail to full phone over ~1.2s
- On loss, a faster/simpler reveal (no celebratory fanfare)
- Delay game-over stats until the reveal animation finishes

**Non-Goals:**
- Particle effects, confetti, or other overlay animations (keep it clean)
- Sound effects
- Changing the progressive reveal mechanic during gameplay (6 guesses, 6 levels)

## Decisions

### 1. CSS `transform: scale()` instead of `clip-path: inset()`

**Choice:** Replace clip-path cropping with `transform: scale(X)` zoom + container `overflow: hidden`.

**Why:** Scale creates a true optical zoom effect — the image appears zoomed-in during play and smoothly zooms out on reveal. Clip-path only unmasks; it can't produce a zoom-out pull-back. CSS transforms are GPU-accelerated, performant, and support smooth transitions natively.

**How it works:**
- Each crop level maps to a scale factor: `scale = 1 / (1 - 2 * insetPct / 100)`
- Container `overflow: hidden` + `transform-origin: center` naturally crops to the center
- Transition from `scale(X)` → `scale(1)` = zoom-out

Scale factors per level:
| Level | Old inset | Visible area | Scale factor |
|-------|-----------|-------------|--------------|
| 0     | 38%       | 24%         | ~4.17        |
| 1     | 30%       | 40%         | 2.50         |
| 2     | 22%       | 56%         | ~1.79        |
| 3     | 14%       | 72%         | ~1.39        |
| 4     | 6%        | 88%         | ~1.14        |
| 5     | 0%        | 100%        | 1.00         |

**Alternative considered:** Two-phase animation (clip-path removal then scale). Rejected — requires JS animation orchestration and the visual result is less smooth than a single transform transition.

### 2. Differentiate win vs loss reveal

**Choice:** Win gets a slow, dramatic zoom-out (1.2s, custom easing). Loss gets a fast zoom-out (0.5s, ease-out) — acknowledges the answer without celebration.

**Why:** The win moment is the emotional payoff of the game. A slow, cinematic reveal rewards the player. On loss, dragging out the reveal feels punishing.

### 3. Delay game-over UI until animation completes

**Choice:** Use an `onTransitionEnd` callback (or a timeout matching the animation duration) to delay rendering the GameOver component and leaderboard.

**Why:** If stats appear instantly while the image is still zooming out, it visually competes with the reveal. A brief delay (matching animation duration) lets the player appreciate the full image before stats slide in.

**Alternative considered:** CSS animation on GameOver with delay. Rejected — simpler to control render timing in React state than to fight with CSS visibility/opacity delays.

### 4. Progressive zoom during gameplay

**Choice:** Each wrong guess transitions the scale factor down (zoom out slightly) over 0.4s, matching current behavior timing.

**Why:** This preserves the current feel where each guess reveals more of the image. The zoom-out is gradual and consistent with user expectations.

## Risks / Trade-offs

- **Image quality at high zoom** → At level 0 (scale 4.17x), smaller images (648px) in a 480px container need ~2000px effective resolution. Some softness is expected but acceptable — it's a brief puzzle state, and the zoom-out quickly resolves it. Mitigated by the fact that the game is mobile-first (containers typically <400px).
- **Transform-origin only supports center** → The crop always zooms into the image center. If a phone's distinguishing features are at the edges, level 0 might show a featureless center area. Same limitation as the current symmetric clip-path approach. Acceptable trade-off for implementation simplicity.
- **`onTransitionEnd` reliability** → Browser support is excellent but events can be missed if transition is interrupted. Mitigation: use a fallback `setTimeout` matching the animation duration.
