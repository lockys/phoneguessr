# Direct Wikimedia Image URLs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace local image file serving with direct Wikimedia Commons URLs stored in the database and returned to the client.

**Architecture:** The `phones.image_path` DB column is renamed to `image_url` via a hand-written SQL migration. The seed script reads `press-kit-manifest.json` directly (skipping `collect-images.ts`), filters to `source === "wikimedia-commons"` entries only, and upserts each phone's Wikimedia URL. The API returns the URL string; the client loads it directly from Wikimedia's CDN. The canvas image gets `crossOrigin = "anonymous"` to prevent taint errors.

**Tech Stack:** Drizzle ORM (PostgreSQL), Node.js fs/path, React 19, Vitest

**Spec:** `docs/superpowers/specs/2026-03-24-direct-wikimedia-image-urls-design.md`

---

## File Map

| File | Change |
|------|--------|
| `phoneguessr/src/db/schema.ts` | Rename `imagePath`/`image_path` → `imageUrl`/`image_url` |
| `phoneguessr/drizzle/0002_rename_image_path_to_image_url.sql` | CREATE — manual SQL migration |
| `phoneguessr/src/db/seed.ts` | Read manifest, filter wikimedia, upsert with imageUrl |
| `phoneguessr/src/lib/puzzle.ts` | `imagePath` → `imageUrl` in `getYesterdayPuzzle()` return |
| `api/puzzle.ts` | `image` action: return `{ imageUrl }` instead of base64 |
| `phoneguessr/src/components/CropReveal.tsx` | Add `img.crossOrigin = 'anonymous'` |
| `phoneguessr/src/components/Game.tsx` | Rename state, update fetch, remove `onImageDrawn` clear |
| `phoneguessr/src/mock/data.ts` | `imagePath` → `imageUrl`, values become URLs |
| `phoneguessr/src/mock/state.ts` | Remove base64 fns, update getMockPuzzle/getMockYesterdayPuzzle |
| `phoneguessr/src/mock/middleware.ts` | `image` route returns `{ imageUrl }`, remove `getMockImageData` import |
| `phoneguessr/src/mock/data.test.ts` | Update assertions, delete stale blocks |
| `CLAUDE.md` | Update pipeline docs |

---

## Task 1: DB schema rename + manual migration

**Files:**
- Modify: `phoneguessr/src/db/schema.ts:20`
- Create: `phoneguessr/drizzle/0002_rename_image_path_to_image_url.sql`

- [ ] **Step 1: Create the manual migration file**

Create `phoneguessr/drizzle/0002_rename_image_path_to_image_url.sql`:

```sql
ALTER TABLE phones RENAME COLUMN image_path TO image_url;
```

Do NOT run `npm run db:generate` — Drizzle would emit DROP+ADD instead of RENAME, destroying data.

- [ ] **Step 2: Update the schema**

In `phoneguessr/src/db/schema.ts` line 20, change:

```ts
// Before
imagePath: text('image_path').notNull(),

// After
imageUrl: text('image_url').notNull(),
```

- [ ] **Step 3: Apply the migration**

Run from `phoneguessr/`:
```bash
npm run db:migrate
```

Expected: migration applies without error. The `phones` table now has `image_url` column with existing data preserved.

- [ ] **Step 4: Commit**

```bash
git add phoneguessr/src/db/schema.ts phoneguessr/drizzle/0002_rename_image_path_to_image_url.sql
git commit -m "feat(db): rename image_path to image_url in phones table"
```

---

## Task 2: Update seed script

The seed script currently reads `phone-data.json` via a static import. Replace it to read `press-kit-manifest.json` dynamically, filter to Wikimedia-only entries, and upsert using `onConflictDoUpdate`.

**Files:**
- Modify: `phoneguessr/src/db/seed.ts`

- [ ] **Step 1: Rewrite seed.ts**

Replace the entire file content:

```ts
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sql } from 'drizzle-orm';
import { db } from './index';
import { phones } from './schema';

interface ManifestEntry {
  brand: string;
  model: string;
  imageUrl?: string;
  source?: string;
  releaseYear?: number;
  priceTier?: string;
  formFactor?: string;
  difficulty?: string;
}

async function seed() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const manifestPath = path.resolve(
    __dirname,
    '../../scripts/press-kit-manifest.json',
  );
  const manifest: ManifestEntry[] = JSON.parse(
    fs.readFileSync(manifestPath, 'utf-8'),
  );

  const entries = manifest.filter(
    e => e.source === 'wikimedia-commons' && e.imageUrl,
  );

  console.log(`Seeding ${entries.length} phones from Wikimedia manifest...`);

  for (const entry of entries) {
    await db
      .insert(phones)
      .values({
        brand: entry.brand,
        model: entry.model,
        imageUrl: entry.imageUrl as string,
        active: true,
        releaseYear: entry.releaseYear ?? null,
        priceTier: entry.priceTier ?? null,
        formFactor: entry.formFactor ?? null,
        difficulty: entry.difficulty ?? null,
      })
      .onConflictDoUpdate({
        target: [phones.brand, phones.model],
        set: { imageUrl: sql`excluded.image_url` },
      });
  }

  console.log(`Seeded ${entries.length} phones.`);
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
```

- [ ] **Step 2: Run seed and verify**

Run from `phoneguessr/`:
```bash
npm run db:seed
```

Expected: prints `Seeding N phones from Wikimedia manifest...` and `Seeded N phones.` with no errors. N should be ~119 (Wikimedia entries from the manifest).

- [ ] **Step 3: Commit**

```bash
git add phoneguessr/src/db/seed.ts
git commit -m "feat(seed): read from Wikimedia manifest instead of phone-data.json"
```

---

## Task 3: Update API and puzzle library

Two files need updating: `api/puzzle.ts` (the `image` action) and `phoneguessr/src/lib/puzzle.ts` (the `getYesterdayPuzzle` return value).

**Files:**
- Modify: `api/puzzle.ts:28-52`
- Modify: `phoneguessr/src/lib/puzzle.ts:204-218`

- [ ] **Step 1: Update the `image` action in `api/puzzle.ts`**

Replace the `case 'image':` block (lines 28–52):

```ts
// Before
case 'image': {
  const { phone } = await getTodayPuzzle();
  const imagePath = path.resolve(
    process.cwd(),
    'phoneguessr',
    'config',
    'public',
    phone.imagePath.replace(/^\/public\//, ''),
  );

  if (!fs.existsSync(imagePath)) {
    return Response.json({ error: 'Image not found' }, { status: 404 });
  }

  const buffer = fs.readFileSync(imagePath);
  const ext = path.extname(imagePath).slice(1).toLowerCase();
  const mime =
    ext === 'png'
      ? 'image/png'
      : ext === 'svg'
        ? 'image/svg+xml'
        : 'image/jpeg';
  const base64 = buffer.toString('base64');
  return Response.json({ imageData: `data:${mime};base64,${base64}` });
}

// After
case 'image': {
  const { phone } = await getTodayPuzzle();
  return Response.json({ imageUrl: phone.imageUrl });
}
```

Also remove `import fs from 'node:fs'` and `import path from 'node:path'` from the top of `api/puzzle.ts` — both are only used inside the `case 'image':` block and are unused after this change.

- [ ] **Step 2: Update `getYesterdayPuzzle()` in `phoneguessr/src/lib/puzzle.ts`**

In the return object at the bottom of `getYesterdayPuzzle()` (around line 204–210), change `imagePath` to `imageUrl`:

```ts
// Before
return {
  phone: {
    brand: phone.brand,
    model: phone.model,
    imagePath: phone.imagePath,
    releaseYear: null as number | null,
  },
  ...
};

// After
return {
  phone: {
    brand: phone.brand,
    model: phone.model,
    imageUrl: phone.imageUrl,
    releaseYear: null as number | null,
  },
  ...
};
```

- [ ] **Step 3: Commit**

```bash
git add api/puzzle.ts phoneguessr/src/lib/puzzle.ts
git commit -m "feat(api): return imageUrl directly instead of base64 for puzzle image"
```

---

## Task 4: CropReveal CORS + Game.tsx state rename

**Files:**
- Modify: `phoneguessr/src/components/CropReveal.tsx:96`
- Modify: `phoneguessr/src/components/Game.tsx:48,63,223,234`

**Background:** The phone image is fetched exactly once when the game loads. Level-based progressive reveal is handled entirely client-side by the `BlockGrid` component (receives a `level` prop, overlays grid blocks that are removed as guesses increase) — there are no per-level server fetches. The `onImageDrawn` callback in `Game.tsx` (`() => setImageData('')`) was only a memory optimization: it cleared the large base64 string from React state after the canvas had painted it. With a URL string, there is nothing to free, so the callback is removed entirely. `CropReveal`'s `onImageDrawn` prop is also removed from the interface since no caller uses it anymore.

- [ ] **Step 1: Add `crossOrigin = 'anonymous'` in CropReveal.tsx**

In `phoneguessr/src/components/CropReveal.tsx`, inside the `useEffect` that loads the image (around line 96), add `crossOrigin` immediately after `new Image()`:

```ts
// Before
const img = new Image();
img.onload = () => {

// After
const img = new Image();
img.crossOrigin = 'anonymous';
img.onload = () => {
```

This must be set before `img.src` is assigned (line 148 — `img.src = imageSrc`).

- [ ] **Step 2: Remove `onImageDrawn` from CropReveal.tsx interface and call sites**

In `phoneguessr/src/components/CropReveal.tsx`:

**2a.** Remove `onImageDrawn?: () => void` from the `CropRevealProps` interface (around line 11).

**2b.** Remove `onImageDrawn` from the function parameter destructuring (around line 53):
```ts
// Before
}: CropRevealProps) {

// The destructuring includes: { imageSrc, level, revealed, isWin, onRevealComplete, onImageDrawn }

// After: remove onImageDrawn from the destructuring
```

**2c.** Remove both `onImageDrawn?.()` call sites — one at the end of the first-load branch (around line 112) and one at the end of the crossfade animation (around line 142).

**2d.** Update the `biome-ignore` comment on line 93 — remove `onImageDrawn` from its text since that prop no longer exists:
```ts
// Before
// biome-ignore lint/correctness/useExhaustiveDependencies: level/revealed/ensureCanvasSize/onImageDrawn captured at src-change time

// After
// biome-ignore lint/correctness/useExhaustiveDependencies: level/revealed/ensureCanvasSize captured at src-change time
```

- [ ] **Step 3: Update Game.tsx**

In `phoneguessr/src/components/Game.tsx`:

**3a.** Rename the state variable (line 48):
```ts
// Before
const [imageData, setImageData] = useState<string>('');

// After
const [imageUrl, setImageUrl] = useState<string>('');
```

**3b.** Update the image fetch handler (line 63):
```ts
// Before
setImageData(imgData.imageData);

// After
setImageUrl(imgData.imageUrl);
```

**3c.** Update `CropReveal` props (line 223) and remove the `onImageDrawn` prop (line 234):
```tsx
// Before
<CropReveal
  imageSrc={imageData}
  level={guesses.length}
  revealed={isFinished}
  isWin={...}
  onRevealComplete={handleRevealComplete}
  onImageDrawn={() => setImageData('')}
/>

// After
<CropReveal
  imageSrc={imageUrl}
  level={guesses.length}
  revealed={isFinished}
  isWin={...}
  onRevealComplete={handleRevealComplete}
/>
```

- [ ] **Step 4: Commit**

```bash
git add phoneguessr/src/components/CropReveal.tsx phoneguessr/src/components/Game.tsx
git commit -m "feat(client): load phone image from URL instead of base64"
```

---

## Task 5: Mock layer — tests first (TDD)

Update `data.test.ts` to match the new shape, then update `data.ts` to make the tests pass.

**Files:**
- Modify: `phoneguessr/src/mock/data.test.ts`
- Modify: `phoneguessr/src/mock/data.ts`

- [ ] **Step 1: Write the failing tests in data.test.ts**

Make three changes to `phoneguessr/src/mock/data.test.ts`:

**1a.** Remove line 4 (`import phoneDataJson from '../db/phone-data.json'`).

**1b.** Replace the `'has valid imagePath format'` test (lines 37–43) with:
```ts
it('has valid imageUrl format for every phone', () => {
  for (const phone of MOCK_PHONES) {
    expect(phone.imageUrl).toMatch(/^https?:\/\//);
  }
});
```

**1c.** Delete the `'has image files on disk for phones from phone-data.json'` test (lines 57–70).

**1d.** Delete the entire `describe('phone-data.json sync', ...)` block (lines 114–143).

- [ ] **Step 2: Run tests to confirm they fail**

Run from `phoneguessr/`:
```bash
npx vitest run src/mock/data.test.ts
```

Expected: FAIL — `phone.imageUrl` is undefined because `MockPhone` still has `imagePath`.

- [ ] **Step 3: Update data.ts to make tests pass**

In `phoneguessr/src/mock/data.ts`:

**3a.** Update the `MockPhone` interface:
```ts
// Before
export interface MockPhone {
  id: number;
  brand: string;
  model: string;
  imagePath: string;
  releaseYear: number;
  priceTier: 'budget' | 'mid' | 'flagship';
  formFactor: 'bar' | 'flip' | 'fold';
  difficulty: 'easy' | 'medium' | 'hard';
}

// After
export interface MockPhone {
  id: number;
  brand: string;
  model: string;
  imageUrl: string;
  releaseYear: number;
  priceTier: 'budget' | 'mid' | 'flagship';
  formFactor: 'bar' | 'flip' | 'fold';
  difficulty: 'easy' | 'medium' | 'hard';
}
```

**3b.** Rename the key across all 70 entries in `MOCK_PHONES`: use a global find-and-replace of `imagePath:` → `imageUrl:` across the file.

**3c.** Replace all local path values with a valid HTTPS URL: use a regex find-and-replace to change every value matching `'/public/phones/[^']+'` to `'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg'`. Using the same placeholder URL for all 70 entries is acceptable — the test only verifies the `^https?:\/\/` pattern.

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx vitest run src/mock/data.test.ts
```

Expected: PASS — all tests pass including the new `imageUrl` format check.

- [ ] **Step 5: Commit**

```bash
git add phoneguessr/src/mock/data.test.ts phoneguessr/src/mock/data.ts
git commit -m "feat(mock): replace imagePath with imageUrl in MockPhone"
```

---

## Task 6: Mock state + middleware

**Files:**
- Modify: `phoneguessr/src/mock/state.ts`
- Modify: `phoneguessr/src/mock/middleware.ts`

- [ ] **Step 1: Update state.ts**

In `phoneguessr/src/mock/state.ts`, make all edits in this order (delete functions before removing their imports to avoid intermediate compile errors):

**1a.** Delete the entire `getMockImageData()` function (lines 40–56).

**1b.** Delete the entire `getMockYesterdayImageData()` function (lines 119–135).

**1c.** Remove the `import fs from 'node:fs'` and `import path from 'node:path'` lines (lines 1–2) — now safe to remove since the only functions that used them are gone.

**1d.** In `getMockPuzzle()`, replace `imagePath: phone.imagePath` with `imageUrl: phone.imageUrl`:
```ts
// Before
return {
  puzzleId: 1,
  puzzleNumber: Math.max(1, puzzleNumber),
  puzzleDate: today,
  imagePath: phone.imagePath,
  _answerId: phone.id,
  _answerBrand: phone.brand,
};

// After
return {
  puzzleId: 1,
  puzzleNumber: Math.max(1, puzzleNumber),
  puzzleDate: today,
  imageUrl: phone.imageUrl,
  _answerId: phone.id,
  _answerBrand: phone.brand,
};
```

**1e.** In `getMockYesterdayPuzzle()`, replace `imagePath: phone.imagePath` with `imageUrl: phone.imageUrl`:
```ts
// Before
return {
  phone: {
    brand: phone.brand,
    model: phone.model,
    imagePath: phone.imagePath,
    releaseYear: null as number | null,
  },
  ...
};

// After
return {
  phone: {
    brand: phone.brand,
    model: phone.model,
    imageUrl: phone.imageUrl,
    releaseYear: null as number | null,
  },
  ...
};
```

- [ ] **Step 2: Update middleware.ts**

In `phoneguessr/src/mock/middleware.ts`:

**2a.** Remove `getMockImageData` from the import on line 11:
```ts
// Before
import {
  getMockFeedback,
  getMockHint,
  getMockImageData,
  getMockProfileStats,
  getMockPuzzle,
  getMockYesterdayPuzzle,
  resetMockHints,
} from './state.ts';

// After
import {
  getMockFeedback,
  getMockHint,
  getMockProfileStats,
  getMockPuzzle,
  getMockYesterdayPuzzle,
  resetMockHints,
} from './state.ts';
```

**2b.** Update the `GET /api/puzzle/image` handler (lines 63–70):
```ts
// Before
'GET /api/puzzle/image': (_req, res) => {
  const imageData = getMockImageData();
  if (!imageData) {
    json(res, { error: 'Image not found' }, 404);
    return;
  }
  json(res, { imageData });
},

// After
'GET /api/puzzle/image': (_req, res) => {
  const puzzle = getMockPuzzle();
  json(res, { imageUrl: puzzle.imageUrl });
},
```

- [ ] **Step 3: Run full test suite**

```bash
npx vitest run
```

Expected: all tests pass. TypeScript compiler errors would appear here if any `imagePath` references remain — fix them.

- [ ] **Step 4: Commit**

```bash
git add phoneguessr/src/mock/state.ts phoneguessr/src/mock/middleware.ts
git commit -m "feat(mock): remove base64 image serving, return Wikimedia URL directly"
```

---

## Task 7: Update CLAUDE.md pipeline docs

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update the phone image pipeline section**

In `CLAUDE.md`, find the `# Phone image pipeline` section. Replace the current pipeline commands:

```bash
# Before (current)
npx tsx scripts/fetch-wikimedia-images.ts --dry-run   # Preview Wikimedia images
npx tsx scripts/fetch-wikimedia-images.ts --overwrite  # Update manifest
npx tsx scripts/collect-images.ts                      # Download + process images
npx tsx scripts/validate-phone-data.ts                 # Validate phone-data.json

# After
npx tsx scripts/fetch-wikimedia-images.ts --dry-run   # Preview Wikimedia images
npx tsx scripts/fetch-wikimedia-images.ts --overwrite  # Update manifest
npm run db:seed                                        # Seed DB from manifest (Wikimedia-only entries)
```

Remove `collect-images.ts` and `validate-phone-data.ts` from the documented workflow. They remain in the repo but are no longer part of the normal pipeline.

Also update the `Architecture > Phone image pipeline` description: remove the reference to `phone-data.json` and `collect-images.ts` as active components.

- [ ] **Step 2: Run lint to check for issues**

```bash
cd phoneguessr && npm run lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update phone image pipeline to use Wikimedia URLs directly"
```

---

## Final Verification

- [ ] Run the full test suite: `cd phoneguessr && npx vitest run` — all pass
- [ ] Run lint: `npm run lint` — no errors
- [ ] Start mock dev server: `npm run dev:mock` — phone image loads from Wikimedia CDN in the browser (not base64)
- [ ] Confirm TypeScript has no errors: `npm run build` — builds without error
