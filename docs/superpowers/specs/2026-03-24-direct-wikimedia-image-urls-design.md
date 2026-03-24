# Direct Wikimedia Image URLs Design

**Date:** 2026-03-24
**Status:** Approved

## Problem

The current pipeline downloads Wikimedia images locally via `collect-images.ts`, stores them in `config/public/phones/`, and serves them as base64 from `api/puzzle.ts`. This adds storage overhead and pipeline complexity when the images are already available on Wikimedia's CDN under CC licenses.

## Goal

Use Wikimedia image URLs directly in the game — store the URL in the database and serve it to the client, eliminating the download/local-storage step.

## Architecture

### New pipeline

```
fetch-wikimedia-images.ts  →  press-kit-manifest.json  →  seed.ts  →  DB  →  api/puzzle.ts  →  client
```

`collect-images.ts`, `generate-placeholders.ts`, and `validate-phone-data.ts` are no longer part of the normal pipeline. They remain in the repo for reference. `phone-data.json` becomes a legacy artifact and is no longer read by any active code path.

### Old pipeline (retired from normal use)

```
fetch-wikimedia-images.ts  →  press-kit-manifest.json
  →  collect-images.ts  →  config/public/phones/  →  phone-data.json
  →  seed.ts  →  DB  →  api/puzzle.ts (reads local file, returns base64)  →  client
```

## Changes

### 1. Database schema (`phoneguessr/src/db/schema.ts`)

Rename column: `image_path` → `image_url`

```ts
// Before
imagePath: text('image_path').notNull(),

// After
imageUrl: text('image_url').notNull(),
```

**Migration note:** Drizzle `generate` emits DROP + ADD for renames, which destroys data. Write the migration SQL by hand:

```sql
ALTER TABLE phones RENAME COLUMN image_path TO image_url;
```

Place it in `phoneguessr/drizzle/` with the next sequential filename (do not run `db:generate` for this change).

### 2. Seed script (`phoneguessr/src/db/seed.ts`)

- Read from `press-kit-manifest.json` instead of `phone-data.json`. The manifest lives at `phoneguessr/scripts/press-kit-manifest.json`; from `src/db/seed.ts` use `path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../scripts/press-kit-manifest.json')` with `fs.readFileSync` (do not use a static JSON import — `fileURLToPath` returns the file path, so `path.dirname` must be called first to get the directory)
- Filter to entries where `source === "wikimedia-commons"` only — GSMArena URLs are under copyright and must not be served directly from the browser
- For each accepted entry: if `imageUrl` is present, upsert into `phones`; if absent, skip
- Use `onConflictDoUpdate` (not `onConflictDoNothing`) to overwrite `imageUrl` on re-seed so existing rows get the new URL
- Remove all references to `phone-data.json`

### 3. API (`api/puzzle.ts`)

**`image` action:** Remove `fs.readFileSync`, base64 encoding, and mime-type detection. Query today's phone from the DB, read `phone.imageUrl`, and return it:

```json
{ "imageUrl": "https://upload.wikimedia.org/..." }
```

**`today` action:** Keep the existing indirection — it continues to return `imageUrl: '/api/puzzle/image'` as a stable endpoint. The client hits `/api/puzzle/image` which then returns the Wikimedia URL. This keeps the client decoupled from the storage backend.

**`yesterday` action:** `getYesterdayPuzzle()` in `phoneguessr/src/lib/puzzle.ts` selects `phone.imagePath` — update to select `phone.imageUrl` instead.

### 4. Client (`phoneguessr/src/components/Game.tsx`)

- Rename state variable: `imageData` → `imageUrl`
- Update the image fetch handler to read `imgData.imageUrl` instead of `imgData.imageData`
- Remove the `onImageDrawn` callback that clears `imageData` (it was a memory optimization for base64 blobs; not needed for URL strings)
- Pass the URL string to `CropReveal` as `imageSrc`

### 5. CropReveal (`phoneguessr/src/components/CropReveal.tsx`)

Add `crossOrigin="anonymous"` when creating the `Image` object so canvas draw operations do not taint the canvas with cross-origin image data:

```ts
// Before
const img = new Image();

// After
const img = new Image();
img.crossOrigin = 'anonymous';
```

Wikimedia Commons CDN serves `Access-Control-Allow-Origin: *` so this will succeed.

### 6. Mock layer

The mock API must mirror the new real API shape:

- **`phoneguessr/src/mock/data.ts`**: Replace `imagePath` with `imageUrl` on `MockPhone`; values should be full URLs (e.g. Wikimedia URLs or placeholder image URLs)
- **`phoneguessr/src/mock/middleware.ts`**: Update `GET /api/puzzle/image` handler to return `{ imageUrl: "..." }` instead of `{ imageData: "..." }`
- **`phoneguessr/src/mock/state.ts`**: Remove both `getMockImageData()` and `getMockYesterdayImageData()` (base64 read functions). Update `getMockYesterdayPuzzle()` return value: rename `phone.imagePath` → `phone.imageUrl`
- **`phoneguessr/src/mock/data.test.ts`**:
  - Update the `imagePath` format assertion (line ~37) to: `expect(phone.imageUrl).toMatch(/^https?:\/\//)`
  - Delete the `'has image files on disk'` test (lines ~57–70) inside the `MOCK_PHONES catalog` describe block — it iterates `phoneDataJson` which is being retired
  - Delete the entire `phone-data.json sync` describe block (lines ~114–143) and its `import phoneDataJson from '../db/phone-data.json'` at line 4 — `phone-data.json` is no longer an active artifact

### 7. Validate script (`phoneguessr/scripts/validate-phone-data.ts`)

This script reads `phone-data.json` and checks `imagePath`. It is deprecated — remove it from the documented workflow in `CLAUDE.md`. No code changes required; it can be left as-is since it is no longer called.

## Out of Scope

- Removing `collect-images.ts`, `generate-placeholders.ts`, or `validate-phone-data.ts` from the repo
- Caching or proxying Wikimedia images through our API
- Handling Wikimedia image unavailability at runtime
- Attribution display in the game UI
