## Why

The current base64 `<img>` approach prevents phone identification via URL, but DevTools still shows a full image preview when inspecting the `<img>` element. Players can hover over the element to see the entire phone before guessing.

## What Changes

- Replace `<img>` rendering in CropReveal with `<canvas>` element
- Draw the image programmatically onto canvas, applying crop/zoom via canvas transform
- Clear the image object from memory after drawing so there is no inspectable source
- Maintain existing block grid overlay and CSS animations for reveal

## Capabilities

### New Capabilities

- `canvas-rendering`: Canvas-based image rendering that prevents DevTools image preview inspection

### Modified Capabilities

- `image-protection`: Strengthen protection — image data is drawn to canvas and source object is discarded, not stored in DOM attributes

## Impact

- `src/components/CropReveal.tsx` — major rewrite from `<img>` to `<canvas>`
- `src/routes/index.css` — CSS animation approach may need adjustment for canvas
- No API or dependency changes
