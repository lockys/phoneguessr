## Why

The current image serving sends a full base64-encoded phone image in the API response. While filenames are hidden, a user can open DevTools, copy the base64 data URL from the network tab, decode it, and reverse-image-search to identify the phone. The game's integrity depends on preventing easy image identification before guessing.

## What Changes

- Server-side image encryption: encrypt phone images with a per-session or per-puzzle key before sending to the client
- Client-side decryption in JavaScript before rendering to canvas
- The decrypted image data never appears in network responses — only encrypted bytes are transmitted
- Alternatively: server-side crop rendering — send only the cropped portion of the image at each guess level, so the full image is never transmitted until the game ends

## Capabilities

### New Capabilities
- `image-encryption`: Server-side image encryption and client-side decryption to prevent network-level cheating

### Modified Capabilities
- `image-protection`: Strengthening anti-cheat from filename obfuscation to full image encryption

## Impact

- **API**: Modified `/api/puzzle/image` endpoint to return encrypted image data (or progressive crops)
- **Frontend**: `CropReveal.tsx` updated to decrypt before canvas rendering
- **Performance**: Encryption/decryption adds minimal latency (~10ms for AES); progressive crops reduce initial payload
- **Dependencies**: Web Crypto API (built-in, no external dependency)
