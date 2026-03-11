## Context

PhoneGuessr currently serves the full phone image as a base64-encoded data URL via `GET /api/puzzle?action=image`. The client receives the entire image in the JSON response (`{ imageData: "data:image/jpeg;base64,..." }`), loads it into an offscreen `Image` object, and draws a zoomed/cropped region to a `<canvas>` element using `CropReveal.tsx`. While the canvas prevents DevTools image preview, the full base64 data is visible in the network tab. A player can copy the base64 string, decode it, and reverse-image-search to identify the phone before guessing.

Current flow:
1. `api/puzzle.ts` (image case): reads phone image from `phoneguessr/config/public/phones/`, base64 encodes, returns full image as JSON
2. `Game.tsx`: fetches `/api/puzzle/image`, stores base64 in `imageData` state, passes to `CropReveal`
3. `CropReveal.tsx`: creates `Image` from base64, draws to canvas with zoom/crop based on `ZOOM_LEVELS` array (4.17x to 1.0x)

Tech stack: React 19 frontend, Hono serverless API on Vercel, PostgreSQL via Drizzle ORM, Google OAuth, `sharp` available in Node.js serverless functions.

## Goals / Non-Goals

**Goals:**
- Prevent players from obtaining the full phone image via network inspection until the game ends
- Server-side crop rendering so only the visible region is transmitted at each guess level
- Validate the requested crop level against the player's actual game state (anti-cheat)
- Support both authenticated (DB-tracked) and unauthenticated (token-based) players
- Maintain existing zoom/reveal animation UX on the client
- Support mock API mode for local development

**Non-Goals:**
- DRM-level image protection (screenshots are always possible)
- Encrypting the cropped image data (the crop itself is the protection — only a small region is visible)
- Changing the 6 zoom levels or their scale factors
- Modifying the BlockGrid overlay behavior
- Changing the guess submission or scoring flow

## Decisions

### D1: Progressive server-side crops instead of encryption
**Decision**: Instead of sending the full image and relying on client-side cropping, the server extracts and sends only the visible crop region for each guess level using `sharp`. The full image is never transmitted until the game ends.

**Rationale**: This is fundamentally more secure than encryption because the data literally does not exist in the response. With encryption (AES + Web Crypto), the decryption key must reach the client somehow — a determined player could intercept it. With progressive crops, even a perfect man-in-the-middle only sees a small region of the phone. Additionally, `sharp` is already a common Vercel-compatible dependency with no key exchange complexity.

**Alternatives rejected**:
- **AES encryption with Web Crypto API**: Requires key exchange (embed in HTML? separate endpoint?). Key is always extractable from JS. Adds ~10ms latency per decrypt plus dependency on crypto APIs. More complex for equivalent security.
- **WebGL shader encryption**: Over-engineered. Requires WebGL context, custom shaders, and fallback for unsupported browsers. No meaningful security advantage over progressive crops.
- **Canvas data URL obfuscation**: Client still has the full image in memory. DevTools heap snapshot could extract it. Does not solve the network-tab problem.

### D2: Level parameter with server-side validation
**Decision**: The image endpoint accepts `GET /api/puzzle?action=image&level=N` where N is 0-5. The server validates that the authenticated user has made at least N guesses for today's puzzle before serving level N. Level 5 (full image) is only served when the game is complete (result exists in DB).

**Rationale**: Without validation, a player could request `level=5` directly and get the full image. Server-side validation against the `guesses` table ensures the crop level matches the player's actual game progress.

### D3: Signed token fallback for unauthenticated users
**Decision**: For unauthenticated users (no session cookie), the server issues a signed JWT on first image request containing `{ puzzleId, level, exp }`. Each subsequent request must include the previous token, and the server only issues a token for `level+1` when a new guess has been recorded. The token is returned in the image response JSON.

**Rationale**: Unauthenticated users have no DB records to validate against. The signed token acts as a server-issued capability — the client cannot forge a higher level. The token is short-lived (expires at end of puzzle day) and puzzle-specific.

**Implementation detail**: The JWT secret can be a server environment variable. The token is included in the JSON response alongside the image data. The client stores it in memory (React state) and passes it on the next image request via a query parameter or header.

### D4: Sharp crop parameters derived from existing zoom levels
**Decision**: The server uses `sharp` to extract the center crop region corresponding to each zoom level. The crop dimensions are calculated from the existing `ZOOM_LEVELS` scale factors (4.17x, 2.5x, 1.79x, 1.39x, 1.14x, 1.0x). At scale S, the visible region is `1/S` of each dimension, so the crop is `(width/S) x (height/S)` centered.

**Rationale**: This preserves the exact same visual experience. The client receives a pre-cropped image and draws it to fill the canvas — same result as the current client-side zoom, but without transmitting the full image.

### D5: Client simplified — no more zoom scaling in CropReveal
**Decision**: `CropReveal.tsx` receives a pre-cropped image at each level and draws it to fill the canvas (scale 1.0). The `ZOOM_LEVELS` array and zoom-based `drawImage` logic are removed from the client. Zoom-level transitions (the 400ms animation between levels) are handled by crossfading between the old and new crop images.

**Rationale**: The server handles all cropping. The client just displays what it receives. This simplifies `CropReveal` and eliminates the possibility of the client manipulating zoom parameters to see more of the image.

### D6: Reveal animation uses the full image
**Decision**: On game end (win or loss), the server returns the full image (level 5). The reveal animation zooms from the current crop's scale to full view, using the full image. This preserves the existing bouncy/ease-out animation behavior.

**Rationale**: The game is over when the reveal plays — there is no cheating concern. The full image is needed for the satisfying zoom-out reveal animation.

### D7: Mock API support
**Decision**: The mock API (`src/mock/state.ts`) implements the same progressive crop logic using `sharp`, reading from `config/public/phones/`. A `getMockCroppedImage(level)` function replaces `getMockImageData()`.

**Rationale**: Mock mode must behave identically to production for development and testing. Since `sharp` works in local Node.js, this is straightforward.

## Risks / Trade-offs

- **Latency per crop**: `sharp` resize/extract adds ~20-50ms per request on Vercel serverless. Acceptable for a single image per guess. Can be cached in-memory or via CDN with puzzle+level cache key.
- **Multiple network requests**: Client now makes one image request per guess level (up to 6) instead of one upfront. Total data transferred is similar — each crop is smaller but there are more requests. Mitigated by the fact that requests happen on user action (guess), not all at once.
- **Sharp dependency**: Adds `sharp` as a production dependency (~7MB). This is a standard image processing library widely used in Node.js serverless. Vercel has native support for it.
- **JWT token complexity for anonymous users**: Adds a token management flow. Mitigated by keeping it simple — token in response JSON, sent back as query parameter.
- **Transition animation**: Crossfading between crop levels may look slightly different from the current smooth zoom. Mitigated by making the crossfade duration match the current 400ms transition.

## Open Questions

- Should cropped images be cached on the server (e.g., pre-generate all 6 crops at puzzle creation time) or generated on-the-fly per request?
- Should the JWT token for anonymous users be stored in a cookie instead of passed via query parameter, to simplify the client flow?
