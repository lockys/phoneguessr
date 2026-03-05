## Context

CropReveal currently renders the puzzle image as an `<img>` element with a base64 data URL `src`. While this prevents identification via URL/filename, DevTools element inspector shows a full image preview on hover — allowing players to see the phone before guessing.

## Goals / Non-Goals

**Goals:**
- Prevent DevTools image preview by rendering on `<canvas>` instead of `<img>`
- Maintain existing zoom-level progressive reveal behavior
- Maintain existing win/loss reveal animations
- Keep the BlockGrid overlay working on top of the canvas

**Non-Goals:**
- Server-side image encryption or obfuscation
- Preventing screenshot-based cheating
- Changing the image fetch API or data format

## Decisions

### 1. Canvas 2D rendering instead of `<img>`
**Decision**: Replace `<img>` with `<canvas>` element, draw image data using `CanvasRenderingContext2D.drawImage()`.

**Rationale**: Canvas does not expose its source data in the DOM. DevTools shows the `<canvas>` element but cannot preview the drawn content as an image. The base64 data URL never appears in any DOM attribute.

**Alternative considered**: WebGL — more powerful but overkill for 2D image display. Canvas 2D is simpler and sufficient.

### 2. JavaScript-driven zoom animation via requestAnimationFrame
**Decision**: Replace CSS keyframe animations (`zoom-reveal-win`/`zoom-reveal-loss`) with JS-driven animation using `requestAnimationFrame` to interpolate canvas `drawImage` parameters.

**Rationale**: CSS animations don't apply to canvas draw operations. The animation must be driven from JS by redrawing the canvas each frame with interpolated scale values.

### 3. Revoke image object after drawing
**Decision**: After loading the base64 data into an `Image` object and drawing to canvas, keep the Image object in a ref (needed for redraw on zoom changes) but never attach it to the DOM.

**Rationale**: The `Image` object is in JS memory only — not inspectable via DOM. The base64 string is cleared from React state after the canvas draws.

## Risks / Trade-offs

- **Canvas rendering quality** → Use `devicePixelRatio` scaling for crisp rendering on high-DPI screens.
- **Animation smoothness** → `requestAnimationFrame` provides 60fps; cubic-bezier easing reimplemented in JS. Slightly more code but equivalent smoothness.
- **Accessibility** → Canvas is less accessible than `<img>`. Add `role="img"` and `aria-label` to the canvas element.
