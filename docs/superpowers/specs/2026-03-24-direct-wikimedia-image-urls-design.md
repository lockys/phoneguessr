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

`collect-images.ts` and `generate-placeholders.ts` are no longer part of the normal pipeline. They remain in the repo for optional use.

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

Generate and apply a Drizzle migration for this rename.

### 2. Seed script (`phoneguessr/src/db/seed.ts`)

- Read from `press-kit-manifest.json` instead of `phone-data.json`
- For each manifest entry: if `imageUrl` is present, insert/upsert into `phones` using `imageUrl`; if absent, skip the entry
- Remove any reference to `phone-data.json` or local image paths

### 3. API (`api/puzzle.ts`)

The `image` action stops reading a local file. It queries the DB for today's phone, reads `phone.imageUrl`, and returns it directly:

```json
{ "imageUrl": "https://upload.wikimedia.org/..." }
```

Remove: `fs.readFileSync`, base64 encoding, mime-type detection.

### 4. Client (`phoneguessr/src/components/Game.tsx`)

Update the image fetch handler to read `imageUrl` from the API response instead of `imageData`. Pass it directly to `CropReveal` as `imageSrc`.

`CropReveal.tsx` requires no changes — it already accepts any URL string as `imageSrc`.

## Out of Scope

- Removing `collect-images.ts` or `generate-placeholders.ts` from the repo
- Caching or proxying Wikimedia images through our API
- Handling Wikimedia image unavailability at runtime
- Attribution display in the game UI
