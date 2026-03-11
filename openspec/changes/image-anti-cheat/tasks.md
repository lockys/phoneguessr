## 1. Sharp Integration and Crop Utility

- [ ] 1.1 Add `sharp` as a production dependency (`pnpm add sharp`)
- [ ] 1.2 Create `phoneguessr/src/lib/image-crop.ts` utility with `generateCrop(imagePath: string, level: number): Promise<string>` that reads the source image, extracts a centered crop based on `ZOOM_LEVELS[level]`, and returns a base64 data URL
- [ ] 1.3 Define the shared `ZOOM_LEVELS` array (`[4.17, 2.5, 1.79, 1.39, 1.14, 1.0]`) in a shared constants file importable by both server and client
- [ ] 1.4 Write unit tests for `generateCrop` — verify crop dimensions at each level, verify level 5 returns full image

## 2. JWT Token Utility

- [ ] 2.1 Create `phoneguessr/src/lib/image-token.ts` with `signImageToken(puzzleId: number, level: number): string` and `verifyImageToken(token: string): { puzzleId: number, level: number } | null`
- [ ] 2.2 Use a server environment variable (`IMAGE_TOKEN_SECRET`) as the JWT signing key
- [ ] 2.3 Set token expiration to end of current puzzle day (midnight UTC)
- [ ] 2.4 Write unit tests for token sign/verify — valid token, expired token, tampered token

## 3. API Endpoint — Progressive Image Serving

- [ ] 3.1 Modify the `image` case in `api/puzzle.ts` to accept `level` query parameter (default: 0)
- [ ] 3.2 For authenticated users: query `guesses` table to count guesses for today's puzzle; reject if `level > guessCount` (403). Check `results` table — if result exists, allow any level.
- [ ] 3.3 For unauthenticated users: validate the `token` query parameter using `verifyImageToken`; reject if token level < level-1 (403). On first request (no token), serve level 0.
- [ ] 3.4 Call `generateCrop(imagePath, level)` to produce the cropped base64 image
- [ ] 3.5 Include `token` in the response JSON for unauthenticated users (signed with the new level)
- [ ] 3.6 Response format: `{ imageData: "data:image/jpeg;base64,...", token?: "jwt..." }`

## 4. Client — Game.tsx Updates

- [ ] 4.1 Change image fetching from a single upfront fetch to a per-level fetch: `fetchCropAtLevel(level: number)` that calls `/api/puzzle?action=image&level=N`
- [ ] 4.2 Store the current crop base64 in state; fetch level 0 on initial load
- [ ] 4.3 After each wrong guess, fetch the next crop level (level = guesses.length)
- [ ] 4.4 On game end (win or loss), fetch level 5 (full image) for the reveal animation
- [ ] 4.5 For unauthenticated users: store the JWT token from each image response in state, pass it as `&token=` on subsequent requests
- [ ] 4.6 Handle 403 errors gracefully (show error toast or retry at current valid level)

## 5. Client — CropReveal.tsx Updates

- [ ] 5.1 Remove the `ZOOM_LEVELS` array and zoom-based `drawImage` scaling from CropReveal
- [ ] 5.2 Update `drawImageScaled` to draw the received image at scale 1.0 (fill canvas) since the server provides the correctly cropped region
- [ ] 5.3 Implement crossfade transition between crop levels: when a new crop arrives, fade from old to new over 400ms (matching current zoom transition duration)
- [ ] 5.4 Keep the reveal animation (win bouncy / loss ease-out) — on game end, the full image (level 5) is drawn, and the animation zooms from the last crop's visual scale to full

## 6. Mock API Updates

- [ ] 6.1 Add `getMockCroppedImage(level: number): string | null` to `src/mock/state.ts` using `sharp` to generate crops from mock phone images
- [ ] 6.2 Update mock API route handler to support `level` parameter on image requests
- [ ] 6.3 Mock mode should NOT validate levels (skip auth/token checks for development convenience)

## 7. Verification

- [ ] 7.1 Verify network tab shows only the cropped region (not full image) at each guess level
- [ ] 7.2 Verify requesting a higher level than guesses count returns 403 for authenticated users
- [ ] 7.3 Verify JWT token flow works for unauthenticated users (level progression)
- [ ] 7.4 Verify full image is only served after game completion
- [ ] 7.5 Verify crop dimensions match expected zoom levels (visual comparison with current behavior)
- [ ] 7.6 Verify reveal animation plays correctly with the full image after game end
- [ ] 7.7 Verify mock mode progressive crops work in local development
- [ ] 7.8 Verify existing BlockGrid overlay still renders correctly on top of cropped canvas
