## 1. Canvas Rendering

- [x] 1.1 Rewrite CropReveal to use `<canvas>` instead of `<img>`: load base64 into offscreen Image, draw to canvas with devicePixelRatio scaling
- [x] 1.2 Implement JS-driven zoom: redraw canvas at current scale level on each guess, centered crop via drawImage parameters
- [x] 1.3 Implement JS-driven reveal animations (win: bouncy ease-out ~1.2s, loss: quick ease-out ~0.5s) using requestAnimationFrame
- [x] 1.4 Add `role="img"` and `aria-label="Mystery phone"` to canvas element
- [x] 1.5 Clear base64 string from React state after canvas draws (set imageData to empty after first draw)

## 2. CSS Cleanup

- [x] 2.1 Remove `.crop-image`, `.crop-image-reveal-win`, `.crop-image-reveal-loss`, and `@keyframes zoom-reveal-win/loss` from index.css (no longer needed with canvas)
- [x] 2.2 Update `.crop-container` if needed for canvas sizing

## 3. Integration

- [x] 3.1 Update Game.tsx if CropReveal props change (e.g., onRevealComplete callback still works)
- [x] 3.2 Verify BlockGrid overlay still renders correctly on top of canvas

## 4. Verification

- [x] 4.1 Verify DevTools no longer shows image preview on element hover
- [x] 4.2 Verify progressive zoom reveal works at all 6 levels
- [x] 4.3 Verify win/loss animations play correctly
- [x] 4.4 Verify high-DPI rendering is crisp
