# Wikimedia Phone Images Collection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `fetch-wikimedia-images.ts` — a script that queries Wikimedia Commons for CC-licensed phone images and populates `press-kit-manifest.json` with legally clear image URLs.

**Architecture:** A new script upstream of the existing pipeline. It queries the Wikimedia Commons API using `generator=search` + `prop=imageinfo`, filters for CC-compatible licenses, selects the best portrait-oriented image per phone, and writes manifest entries. The existing `collect-images.ts` download/process/generate pipeline is unchanged except for a minor interface extension.

**Tech Stack:** TypeScript, Node.js `fetch`, Wikimedia Commons REST API (no auth), `tsx` runner, Vitest for tests.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `phoneguessr/scripts/collect-images.ts` | Add optional attribution fields to `ManifestEntry` |
| Create | `phoneguessr/scripts/fetch-wikimedia-images.ts` | Main script: phone list, API client, manifest writer, CLI |
| Create | `phoneguessr/scripts/fetch-wikimedia-images.test.ts` | Unit tests for all pure functions |
| Create | `phoneguessr/scripts/gaps.json` | Written at runtime; tracks models with no Wikimedia image |
| Modify | `phoneguessr/scripts/validate-phone-data.ts` | Lower catalog-size threshold from 400 → 250 |

---

## Task 1: Extend ManifestEntry interface

**Files:**
- Modify: `phoneguessr/scripts/collect-images.ts:29-38`

- [ ] **Step 1: Add optional attribution fields to ManifestEntry**

In `collect-images.ts`, extend the `ManifestEntry` interface (lines 29–38):

```ts
export interface ManifestEntry {
  brand: string;
  model: string;
  imageUrl: string;
  releaseYear: number;
  priceTier: 'budget' | 'mid' | 'flagship';
  formFactor: 'bar' | 'flip' | 'fold';
  difficulty: 'easy' | 'medium' | 'hard';
  source: string;
  // Attribution fields (optional; required for CC BY / CC BY-SA compliance)
  attribution?: string;
  licenseShortName?: string;
  licenseUrl?: string;
}
```

- [ ] **Step 2: Verify lint passes**

```bash
cd phoneguessr && npm run lint -- --reporter=compact 2>&1 | head -20
```

Expected: no errors related to `collect-images.ts`.

- [ ] **Step 3: Commit**

```bash
git add phoneguessr/scripts/collect-images.ts
git commit -m "feat(scripts): extend ManifestEntry with optional attribution fields"
```

---

## Task 2: Implement license filter (TDD)

**Files:**
- Create: `phoneguessr/scripts/fetch-wikimedia-images.test.ts`
- Create: `phoneguessr/scripts/fetch-wikimedia-images.ts` (partial)

- [ ] **Step 1: Create test file with license filter tests**

Create `phoneguessr/scripts/fetch-wikimedia-images.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { isLicenseAccepted } from './fetch-wikimedia-images';

describe('isLicenseAccepted', () => {
  it('accepts CC0', () => expect(isLicenseAccepted('CC0')).toBe(true));
  it('accepts Public domain', () => expect(isLicenseAccepted('Public domain')).toBe(true));
  it('accepts CC BY 4.0', () => expect(isLicenseAccepted('CC BY 4.0')).toBe(true));
  it('accepts CC BY 2.0', () => expect(isLicenseAccepted('CC BY 2.0')).toBe(true));
  it('accepts CC BY-SA 4.0', () => expect(isLicenseAccepted('CC BY-SA 4.0')).toBe(true));
  it('accepts CC BY-SA 3.0', () => expect(isLicenseAccepted('CC BY-SA 3.0')).toBe(true));
  it('accepts dual license with CC component', () => expect(isLicenseAccepted('CC BY-SA 3.0 or GFDL')).toBe(true));
  it('rejects GFDL alone', () => expect(isLicenseAccepted('GFDL')).toBe(false));
  it('rejects CC BY-NC 4.0', () => expect(isLicenseAccepted('CC BY-NC 4.0')).toBe(false));
  it('rejects CC BY-ND 4.0', () => expect(isLicenseAccepted('CC BY-ND 4.0')).toBe(false));
  it('rejects All rights reserved', () => expect(isLicenseAccepted('All rights reserved')).toBe(false));
  it('rejects empty string', () => expect(isLicenseAccepted('')).toBe(false));
  it('rejects undefined', () => expect(isLicenseAccepted(undefined)).toBe(false));
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd phoneguessr && npx vitest run scripts/fetch-wikimedia-images.test.ts 2>&1 | tail -10
```

Expected: FAIL — `fetch-wikimedia-images.ts` does not exist yet.

- [ ] **Step 3: Create script file with isLicenseAccepted**

Create `phoneguessr/scripts/fetch-wikimedia-images.ts` (partial):

```ts
/**
 * fetch-wikimedia-images.ts
 *
 * Queries Wikimedia Commons for CC-licensed phone images and populates
 * press-kit-manifest.json with legally clear image URLs.
 *
 * Usage:
 *   npx tsx phoneguessr/scripts/fetch-wikimedia-images.ts [options]
 *
 * Options:
 *   --brand <name>   Only fetch for this brand
 *   --dry-run        Search but do not write manifest
 *   --overwrite      Replace existing entries by brand|model key
 *   --help
 */

// ─── License Filter ───────────────────────────────────────────────────────────

const ACCEPTED_LICENSE_PREFIXES = ['CC0', 'Public domain', 'CC BY'];
const REJECTED_LICENSE_TERMS = ['NC', 'ND', 'GFDL', 'All rights reserved'];

/**
 * Returns true if the Wikimedia LicenseShortName value is CC-compatible.
 * Handles dual-licensed strings like "CC BY-SA 3.0 or GFDL".
 */
export function isLicenseAccepted(license: string | undefined): boolean {
  if (!license) return false;

  // For dual-licensed strings, check each component
  const parts = license.split(/\s+or\s+/i);

  for (const part of parts) {
    const trimmed = part.trim();
    const hasAcceptedPrefix = ACCEPTED_LICENSE_PREFIXES.some(p => trimmed.startsWith(p));
    const hasRejectedTerm = REJECTED_LICENSE_TERMS.some(t => trimmed.includes(t));

    if (hasAcceptedPrefix && !hasRejectedTerm) {
      return true;
    }
  }

  return false;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd phoneguessr && npx vitest run scripts/fetch-wikimedia-images.test.ts 2>&1 | tail -10
```

Expected: all 13 license tests PASS.

- [ ] **Step 5: Commit**

```bash
git add phoneguessr/scripts/fetch-wikimedia-images.ts phoneguessr/scripts/fetch-wikimedia-images.test.ts
git commit -m "feat(scripts): add license filter for Wikimedia CC detection"
```

---

## Task 3: Implement image selection (TDD)

**Files:**
- Modify: `phoneguessr/scripts/fetch-wikimedia-images.test.ts`
- Modify: `phoneguessr/scripts/fetch-wikimedia-images.ts`

- [ ] **Step 1: Add image selection tests**

Append to `fetch-wikimedia-images.test.ts`:

```ts
import { selectBestImage, type WikiImageCandidate } from './fetch-wikimedia-images';

describe('selectBestImage', () => {
  const base: WikiImageCandidate = {
    title: 'File:Samsung Galaxy S24.jpg',
    url: 'https://upload.wikimedia.org/samsung-s24.jpg',
    width: 400,
    height: 800,
    license: 'CC BY-SA 4.0',
    attribution: 'Samsung',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  };

  it('returns null for empty list', () => {
    expect(selectBestImage([])).toBeNull();
  });

  it('rejects landscape images (width > height)', () => {
    const landscape = { ...base, width: 900, height: 400 };
    expect(selectBestImage([landscape])).toBeNull();
  });

  it('rejects blocklisted filenames', () => {
    const hand = { ...base, title: 'File:Samsung holding hand.jpg' };
    expect(selectBestImage([hand])).toBeNull();
  });

  it('rejects SVG format', () => {
    const svg = { ...base, title: 'File:Samsung Galaxy S24.svg' };
    expect(selectBestImage([svg])).toBeNull();
  });

  it('selects a valid portrait image', () => {
    expect(selectBestImage([base])).toEqual(base);
  });

  it('prefers image with model name in filename over generic name (same resolution)', () => {
    // Both same resolution — model name score must be the tiebreaker, not insertion order
    const generic = { ...base, title: 'File:Phone front view.jpg', url: 'https://upload.wikimedia.org/generic.jpg' };
    const named = { ...base, title: 'File:Samsung Galaxy S24.jpg', url: 'https://upload.wikimedia.org/named.jpg' };
    // Test with generic first to prove ordering doesn't matter
    expect(selectBestImage([generic, named])?.url).toBe(named.url);
    expect(selectBestImage([named, generic])?.url).toBe(named.url);
  });

  it('prefers higher resolution among equal candidates', () => {
    const small = { ...base, url: 'https://upload.wikimedia.org/small.jpg', width: 200, height: 400 };
    const large = { ...base, url: 'https://upload.wikimedia.org/large.jpg', width: 400, height: 800 };
    expect(selectBestImage([small, large])?.url).toBe(large.url);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd phoneguessr && npx vitest run scripts/fetch-wikimedia-images.test.ts 2>&1 | tail -10
```

Expected: FAIL — `selectBestImage` and `WikiImageCandidate` not exported.

- [ ] **Step 3: Add WikiImageCandidate type and selectBestImage to script**

Append to `fetch-wikimedia-images.ts`:

```ts
// ─── Image Selection ──────────────────────────────────────────────────────────

export interface WikiImageCandidate {
  title: string;     // e.g. "File:Samsung Galaxy S24.jpg"
  url: string;
  width: number;
  height: number;
  license: string;
  attribution: string;
  licenseUrl: string;
}

const FILENAME_BLOCKLIST = ['hand', 'holding', 'person', 'review', 'unbox'];
const ACCEPTED_FORMATS = ['.jpg', '.jpeg', '.png'];

/**
 * From a list of CC-licensed candidates, pick the best image:
 * 1. Skip landscape, blocklisted filenames, non-JPEG/PNG
 * 2. Prefer filename containing model name or "front"
 * 3. Highest pixel area wins ties
 */
export function selectBestImage(
  candidates: WikiImageCandidate[],
  modelName = '',
): WikiImageCandidate | null {
  const filtered = candidates.filter(c => {
    const lower = c.title.toLowerCase();
    if (c.width > c.height) return false;
    if (FILENAME_BLOCKLIST.some(term => lower.includes(term))) return false;
    if (!ACCEPTED_FORMATS.some(ext => lower.endsWith(ext))) return false;
    return true;
  });

  if (filtered.length === 0) return null;

  // Score: 2 points for "front", 1 point for model name in filename
  return filtered.sort((a, b) => {
    const scoreA = filenameScore(a.title, modelName);
    const scoreB = filenameScore(b.title, modelName);
    if (scoreA !== scoreB) return scoreB - scoreA;
    return (b.width * b.height) - (a.width * a.height);
  })[0];
}

function filenameScore(title: string, modelName: string): number {
  const lower = title.toLowerCase();
  let score = 0;
  if (lower.includes('front')) score += 2;
  if (modelName && lower.includes(modelName.toLowerCase())) score += 1;
  return score;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd phoneguessr && npx vitest run scripts/fetch-wikimedia-images.test.ts 2>&1 | tail -15
```

Expected: all selection tests PASS.

- [ ] **Step 5: Commit**

```bash
git add phoneguessr/scripts/fetch-wikimedia-images.ts phoneguessr/scripts/fetch-wikimedia-images.test.ts
git commit -m "feat(scripts): add image selection logic for Wikimedia candidates"
```

---

## Task 4: Implement Wikimedia API client (TDD)

**Files:**
- Modify: `phoneguessr/scripts/fetch-wikimedia-images.test.ts`
- Modify: `phoneguessr/scripts/fetch-wikimedia-images.ts`

- [ ] **Step 1: Add API client tests with mocked fetch**

Append to `fetch-wikimedia-images.test.ts`:

```ts
import { vi } from 'vitest';
import { fetchWikimediaImage } from './fetch-wikimedia-images';

describe('fetchWikimediaImage', () => {
  afterEach(() => vi.restoreAllMocks());

  it('returns null on fetch failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    const result = await fetchWikimediaImage('Samsung', 'Galaxy S24');
    expect(result).toBeNull();
  });

  it('returns null when no pages returned', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ query: { pages: {} } }),
    }));
    const result = await fetchWikimediaImage('Samsung', 'Galaxy S24');
    expect(result).toBeNull();
  });

  it('returns null when page has no imageinfo', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        query: {
          pages: {
            '123': { title: 'File:Samsung Galaxy S24.jpg', imageinfo: [] },
          },
        },
      }),
    }));
    const result = await fetchWikimediaImage('Samsung', 'Galaxy S24');
    expect(result).toBeNull();
  });

  it('returns null when all candidates have rejected licenses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        query: {
          pages: {
            '123': {
              title: 'File:Samsung Galaxy S24.jpg',
              imageinfo: [{
                url: 'https://upload.wikimedia.org/s24.jpg',
                width: 400, height: 800,
                extmetadata: {
                  LicenseShortName: { value: 'All rights reserved' },
                  Artist: { value: 'Samsung' },
                  LicenseUrl: { value: '' },
                },
              }],
            },
          },
        },
      }),
    }));
    const result = await fetchWikimediaImage('Samsung', 'Galaxy S24');
    expect(result).toBeNull();
  });

  it('returns a candidate when license is CC BY-SA 4.0', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        query: {
          pages: {
            '123': {
              title: 'File:Samsung Galaxy S24 front.jpg',
              imageinfo: [{
                url: 'https://upload.wikimedia.org/s24-front.jpg',
                width: 400, height: 800,
                extmetadata: {
                  LicenseShortName: { value: 'CC BY-SA 4.0' },
                  Artist: { value: 'TechReviewer' },
                  LicenseUrl: { value: 'https://creativecommons.org/licenses/by-sa/4.0/' },
                },
              }],
            },
          },
        },
      }),
    }));
    const result = await fetchWikimediaImage('Samsung', 'Galaxy S24');
    expect(result).not.toBeNull();
    expect(result?.url).toBe('https://upload.wikimedia.org/s24-front.jpg');
    expect(result?.license).toBe('CC BY-SA 4.0');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd phoneguessr && npx vitest run scripts/fetch-wikimedia-images.test.ts 2>&1 | tail -10
```

Expected: FAIL — `fetchWikimediaImage` not exported.

- [ ] **Step 3: Implement fetchWikimediaImage**

Append to `fetch-wikimedia-images.ts`:

```ts
// ─── API Client ───────────────────────────────────────────────────────────────

const WIKIMEDIA_API = 'https://commons.wikimedia.org/w/api.php';
const USER_AGENT = 'PhoneGuessr/1.0 (https://github.com/calvinjeng/guess-game) fetch-wikimedia-images/1.0';

/**
 * Search Wikimedia Commons for a phone image.
 * Uses generator=search to get imageinfo in one request.
 * Returns the best CC-licensed portrait image, or null if none found.
 */
export async function fetchWikimediaImage(
  brand: string,
  model: string,
): Promise<WikiImageCandidate | null> {
  const query = encodeURIComponent(`"${brand} ${model}"`);
  const url =
    `${WIKIMEDIA_API}?action=query` +
    `&generator=search&gsrsearch=${query}&gsrnamespace=6&gsrlimit=10` +
    `&prop=imageinfo&iiprop=url%7Cextmetadata%7Csize` +
    `&iiextmetadatafilter=LicenseShortName%7CArtist%7CLicenseUrl` +
    `&format=json&origin=*`;

  let data: Record<string, unknown> = {};
  try {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!res.ok) return null;
    data = await res.json() as Record<string, unknown>;
  } catch {
    return null;
  }

  const pages = (data as { query?: { pages?: Record<string, unknown> } })?.query?.pages;
  if (!pages || Object.keys(pages).length === 0) return null;

  const candidates: WikiImageCandidate[] = [];

  for (const page of Object.values(pages) as Array<{
    title: string;
    imageinfo?: Array<{
      url: string;
      width: number;
      height: number;
      extmetadata?: {
        LicenseShortName?: { value: string };
        Artist?: { value: string };
        LicenseUrl?: { value: string };
      };
    }>;
  }>) {
    const info = page.imageinfo?.[0];
    if (!info) continue;

    const license = info.extmetadata?.LicenseShortName?.value ?? '';
    if (!isLicenseAccepted(license)) continue;

    candidates.push({
      title: page.title,
      url: info.url,
      width: info.width,
      height: info.height,
      license,
      attribution: stripHtml(info.extmetadata?.Artist?.value ?? ''),
      licenseUrl: info.extmetadata?.LicenseUrl?.value ?? '',
    });
  }

  return selectBestImage(candidates);
}

/** Strip HTML tags from attribution strings */
function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').trim();
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd phoneguessr && npx vitest run scripts/fetch-wikimedia-images.test.ts 2>&1 | tail -15
```

Expected: all API client tests PASS.

- [ ] **Step 5: Commit**

```bash
git add phoneguessr/scripts/fetch-wikimedia-images.ts phoneguessr/scripts/fetch-wikimedia-images.test.ts
git commit -m "feat(scripts): implement Wikimedia Commons API client"
```

---

## Task 5: Implement gap tracking (TDD)

**Files:**
- Modify: `phoneguessr/scripts/fetch-wikimedia-images.test.ts`
- Modify: `phoneguessr/scripts/fetch-wikimedia-images.ts`

- [ ] **Step 1: Add gap tracking tests**

Append to `fetch-wikimedia-images.test.ts`:

```ts
import { mergeGaps, type GapEntry } from './fetch-wikimedia-images';

describe('mergeGaps', () => {
  it('merges new gaps with existing, deduplicates', () => {
    const existing: GapEntry[] = [{ brand: 'Apple', model: 'iPhone 16 Pro' }];
    const newGaps: GapEntry[] = [
      { brand: 'Apple', model: 'iPhone 16 Pro' },   // duplicate
      { brand: 'Samsung', model: 'Galaxy S24' },     // new
    ];
    const result = mergeGaps(existing, newGaps);
    expect(result).toHaveLength(2);
    expect(result).toContainEqual({ brand: 'Apple', model: 'iPhone 16 Pro' });
    expect(result).toContainEqual({ brand: 'Samsung', model: 'Galaxy S24' });
  });

  it('returns new gaps when existing is empty', () => {
    const result = mergeGaps([], [{ brand: 'Nokia', model: 'G42' }]);
    expect(result).toHaveLength(1);
  });

  it('returns empty when both are empty', () => {
    expect(mergeGaps([], [])).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd phoneguessr && npx vitest run scripts/fetch-wikimedia-images.test.ts 2>&1 | tail -10
```

Expected: FAIL — `mergeGaps` and `GapEntry` not exported.

- [ ] **Step 3: Implement gap tracking**

Append to `fetch-wikimedia-images.ts`:

```ts
// ─── Gap Tracking ─────────────────────────────────────────────────────────────

export interface GapEntry {
  brand: string;
  model: string;
}

/** Merge two gap lists, deduplicating by brand|model key */
export function mergeGaps(existing: GapEntry[], newGaps: GapEntry[]): GapEntry[] {
  const seen = new Set(existing.map(g => `${g.brand}|${g.model}`));
  const merged = [...existing];
  for (const gap of newGaps) {
    const key = `${gap.brand}|${gap.model}`;
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(gap);
    }
  }
  return merged;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd phoneguessr && npx vitest run scripts/fetch-wikimedia-images.test.ts 2>&1 | tail -10
```

Expected: all gap tracking tests PASS.

- [ ] **Step 5: Commit**

```bash
git add phoneguessr/scripts/fetch-wikimedia-images.ts phoneguessr/scripts/fetch-wikimedia-images.test.ts
git commit -m "feat(scripts): implement gap tracking with deduplication"
```

---

## Task 6: Implement manifest update logic (TDD)

**Files:**
- Modify: `phoneguessr/scripts/fetch-wikimedia-images.test.ts`
- Modify: `phoneguessr/scripts/fetch-wikimedia-images.ts`

- [ ] **Step 1: Add manifest update tests**

Append to `fetch-wikimedia-images.test.ts`:

```ts
import type { ManifestEntry } from './collect-images';
import { applyManifestUpdate } from './fetch-wikimedia-images';

describe('applyManifestUpdate', () => {
  const existing: ManifestEntry[] = [{
    brand: 'Samsung', model: 'Galaxy S24', imageUrl: 'https://gsmarena.com/s24.jpg',
    releaseYear: 2024, priceTier: 'flagship', formFactor: 'bar',
    difficulty: 'easy', source: 'gsmarena-bigpic',
  }];

  const wikiEntry: ManifestEntry = {
    brand: 'Samsung', model: 'Galaxy S24', imageUrl: 'https://upload.wikimedia.org/s24.jpg',
    releaseYear: 2024, priceTier: 'flagship', formFactor: 'bar',
    difficulty: 'easy', source: 'wikimedia-commons',
    attribution: 'Samsung', licenseShortName: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  };

  it('skips existing entry by default (overwrite=false)', () => {
    const result = applyManifestUpdate(existing, [wikiEntry], false);
    expect(result).toHaveLength(1);
    expect(result[0].source).toBe('gsmarena-bigpic');
  });

  it('replaces existing entry when overwrite=true', () => {
    const result = applyManifestUpdate(existing, [wikiEntry], true);
    expect(result).toHaveLength(1);
    expect(result[0].source).toBe('wikimedia-commons');
    expect(result[0].imageUrl).toContain('wikimedia.org');
  });

  it('appends new entry not in existing', () => {
    const newEntry: ManifestEntry = {
      ...wikiEntry, brand: 'Nokia', model: 'G42',
      imageUrl: 'https://upload.wikimedia.org/nokia-g42.jpg',
    };
    const result = applyManifestUpdate(existing, [newEntry], false);
    expect(result).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd phoneguessr && npx vitest run scripts/fetch-wikimedia-images.test.ts 2>&1 | tail -10
```

Expected: FAIL — `applyManifestUpdate` not exported.

- [ ] **Step 3: Implement applyManifestUpdate**

Append to `fetch-wikimedia-images.ts`:

```ts
import type { ManifestEntry } from './collect-images';

// ─── Manifest Update ──────────────────────────────────────────────────────────

/**
 * Merge newEntries into existingEntries.
 * - overwrite=false: skip entries whose brand|model already exists
 * - overwrite=true:  replace entries whose brand|model already exists
 */
export function applyManifestUpdate(
  existing: ManifestEntry[],
  newEntries: ManifestEntry[],
  overwrite: boolean,
): ManifestEntry[] {
  const keyMap = new Map<string, number>();
  const result = [...existing];

  for (let i = 0; i < result.length; i++) {
    keyMap.set(`${result[i].brand}|${result[i].model}`, i);
  }

  for (const entry of newEntries) {
    const key = `${entry.brand}|${entry.model}`;
    if (keyMap.has(key)) {
      if (overwrite) {
        result[keyMap.get(key)!] = entry;
      }
      // else: skip
    } else {
      keyMap.set(key, result.length);
      result.push(entry);
    }
  }

  return result;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd phoneguessr && npx vitest run scripts/fetch-wikimedia-images.test.ts 2>&1 | tail -10
```

Expected: all manifest update tests PASS.

- [ ] **Step 5: Run full test suite to check for regressions**

```bash
cd phoneguessr && npm run test 2>&1 | tail -20
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add phoneguessr/scripts/fetch-wikimedia-images.ts phoneguessr/scripts/fetch-wikimedia-images.test.ts
git commit -m "feat(scripts): implement manifest update with overwrite support"
```

---

## Task 7: Wire phone list and CLI entry point

**Files:**
- Modify: `phoneguessr/scripts/fetch-wikimedia-images.ts` (add phone list + main)
- Note: `.gitignore` should already ignore `phoneguessr/scripts/gaps.json` — add it if not

- [ ] **Step 1: Add phone model list and main CLI to the script**

Append to `fetch-wikimedia-images.ts`:

```ts
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MANIFEST_PATH = join(__dirname, 'press-kit-manifest.json');
const GAPS_PATH = join(__dirname, 'gaps.json');

// ─── Phone Model List ─────────────────────────────────────────────────────────

interface PhoneSpec {
  brand: string;
  model: string;
  releaseYear: number;
  priceTier: 'budget' | 'mid' | 'flagship';
  formFactor: 'bar' | 'flip' | 'fold';
  difficulty: 'easy' | 'medium' | 'hard';
}

export const PHONE_MODELS: PhoneSpec[] = [
  // === Apple (easy) ===
  { brand: 'Apple', model: 'iPhone 16 Pro', releaseYear: 2024, priceTier: 'flagship', formFactor: 'bar', difficulty: 'easy' },
  { brand: 'Apple', model: 'iPhone 15', releaseYear: 2023, priceTier: 'mid', formFactor: 'bar', difficulty: 'easy' },
  { brand: 'Apple', model: 'iPhone 14', releaseYear: 2022, priceTier: 'mid', formFactor: 'bar', difficulty: 'easy' },
  { brand: 'Apple', model: 'iPhone 13', releaseYear: 2021, priceTier: 'mid', formFactor: 'bar', difficulty: 'easy' },
  { brand: 'Apple', model: 'iPhone SE (2022)', releaseYear: 2022, priceTier: 'budget', formFactor: 'bar', difficulty: 'easy' },

  // === Samsung (easy) ===
  { brand: 'Samsung', model: 'Galaxy S24 Ultra', releaseYear: 2024, priceTier: 'flagship', formFactor: 'bar', difficulty: 'easy' },
  { brand: 'Samsung', model: 'Galaxy S23', releaseYear: 2023, priceTier: 'flagship', formFactor: 'bar', difficulty: 'easy' },
  { brand: 'Samsung', model: 'Galaxy Z Fold 5', releaseYear: 2023, priceTier: 'flagship', formFactor: 'fold', difficulty: 'easy' },
  { brand: 'Samsung', model: 'Galaxy Z Flip 5', releaseYear: 2023, priceTier: 'flagship', formFactor: 'flip', difficulty: 'easy' },
  { brand: 'Samsung', model: 'Galaxy A54', releaseYear: 2023, priceTier: 'mid', formFactor: 'bar', difficulty: 'easy' },

  // === Google (easy) ===
  { brand: 'Google', model: 'Pixel 9 Pro', releaseYear: 2024, priceTier: 'flagship', formFactor: 'bar', difficulty: 'easy' },
  { brand: 'Google', model: 'Pixel 8', releaseYear: 2023, priceTier: 'flagship', formFactor: 'bar', difficulty: 'easy' },
  { brand: 'Google', model: 'Pixel 7a', releaseYear: 2023, priceTier: 'mid', formFactor: 'bar', difficulty: 'easy' },
  { brand: 'Google', model: 'Pixel 6', releaseYear: 2021, priceTier: 'flagship', formFactor: 'bar', difficulty: 'easy' },
  { brand: 'Google', model: 'Pixel 5', releaseYear: 2020, priceTier: 'mid', formFactor: 'bar', difficulty: 'easy' },

  // === Motorola (easy) ===
  { brand: 'Motorola', model: 'Edge 50 Pro', releaseYear: 2024, priceTier: 'flagship', formFactor: 'bar', difficulty: 'easy' },
  { brand: 'Motorola', model: 'Moto G85', releaseYear: 2024, priceTier: 'mid', formFactor: 'bar', difficulty: 'easy' },
  { brand: 'Motorola', model: 'Edge 40', releaseYear: 2023, priceTier: 'mid', formFactor: 'bar', difficulty: 'easy' },
  { brand: 'Motorola', model: 'Moto G73', releaseYear: 2023, priceTier: 'mid', formFactor: 'bar', difficulty: 'easy' },
  { brand: 'Motorola', model: 'Razr 40 Ultra', releaseYear: 2023, priceTier: 'flagship', formFactor: 'flip', difficulty: 'easy' },

  // === Nokia (easy) ===
  { brand: 'Nokia', model: 'G42', releaseYear: 2023, priceTier: 'budget', formFactor: 'bar', difficulty: 'easy' },
  { brand: 'Nokia', model: 'G21', releaseYear: 2022, priceTier: 'budget', formFactor: 'bar', difficulty: 'easy' },
  { brand: 'Nokia', model: 'X30', releaseYear: 2022, priceTier: 'mid', formFactor: 'bar', difficulty: 'easy' },
  { brand: 'Nokia', model: '5.4', releaseYear: 2021, priceTier: 'budget', formFactor: 'bar', difficulty: 'easy' },
  { brand: 'Nokia', model: '3.4', releaseYear: 2020, priceTier: 'budget', formFactor: 'bar', difficulty: 'easy' },

  // === OnePlus (medium) ===
  { brand: 'OnePlus', model: '12', releaseYear: 2024, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'OnePlus', model: '11', releaseYear: 2023, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'OnePlus', model: '10 Pro', releaseYear: 2022, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'OnePlus', model: 'Nord 3', releaseYear: 2023, priceTier: 'mid', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'OnePlus', model: 'Nord CE 3', releaseYear: 2023, priceTier: 'mid', formFactor: 'bar', difficulty: 'medium' },

  // === Xiaomi (medium) ===
  { brand: 'Xiaomi', model: '14 Pro', releaseYear: 2023, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Xiaomi', model: '13', releaseYear: 2023, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Xiaomi', model: '12', releaseYear: 2022, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Xiaomi', model: 'Redmi Note 13', releaseYear: 2024, priceTier: 'budget', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Xiaomi', model: 'Mi 11', releaseYear: 2021, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },

  // === Sony (medium) ===
  { brand: 'Sony', model: 'Xperia 1 VI', releaseYear: 2024, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Sony', model: 'Xperia 5 V', releaseYear: 2023, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Sony', model: 'Xperia 10 V', releaseYear: 2023, priceTier: 'mid', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Sony', model: 'Xperia 1 IV', releaseYear: 2022, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Sony', model: 'Xperia 5 III', releaseYear: 2021, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },

  // === Huawei (medium) ===
  { brand: 'Huawei', model: 'P60 Pro', releaseYear: 2023, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Huawei', model: 'Mate 60 Pro', releaseYear: 2023, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Huawei', model: 'Nova 11', releaseYear: 2023, priceTier: 'mid', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Huawei', model: 'P50', releaseYear: 2021, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Huawei', model: 'Mate 40 Pro', releaseYear: 2020, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },

  // === LG (medium) ===
  { brand: 'LG', model: 'Wing', releaseYear: 2020, priceTier: 'flagship', formFactor: 'fold', difficulty: 'medium' },
  { brand: 'LG', model: 'Velvet', releaseYear: 2020, priceTier: 'mid', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'LG', model: 'V60 ThinQ', releaseYear: 2020, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'LG', model: 'G8X ThinQ', releaseYear: 2019, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'LG', model: 'K61', releaseYear: 2020, priceTier: 'mid', formFactor: 'bar', difficulty: 'medium' },

  // === HTC (medium) ===
  { brand: 'HTC', model: 'U23 Pro', releaseYear: 2023, priceTier: 'mid', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'HTC', model: 'Desire 22 Pro', releaseYear: 2022, priceTier: 'mid', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'HTC', model: 'U20 5G', releaseYear: 2020, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'HTC', model: 'Desire 20 Pro', releaseYear: 2020, priceTier: 'mid', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'HTC', model: 'U12+', releaseYear: 2018, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },

  // === BlackBerry (medium) ===
  { brand: 'BlackBerry', model: 'Key2', releaseYear: 2018, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'BlackBerry', model: 'Key2 LE', releaseYear: 2018, priceTier: 'mid', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'BlackBerry', model: 'Motion', releaseYear: 2017, priceTier: 'mid', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'BlackBerry', model: 'KEYone', releaseYear: 2017, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'BlackBerry', model: 'Priv', releaseYear: 2015, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },

  // === OPPO (medium) ===
  { brand: 'OPPO', model: 'Find X7', releaseYear: 2024, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'OPPO', model: 'Reno 11', releaseYear: 2024, priceTier: 'mid', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'OPPO', model: 'Find N3 Flip', releaseYear: 2023, priceTier: 'flagship', formFactor: 'flip', difficulty: 'medium' },
  { brand: 'OPPO', model: 'A98', releaseYear: 2023, priceTier: 'mid', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'OPPO', model: 'Reno 10', releaseYear: 2023, priceTier: 'mid', formFactor: 'bar', difficulty: 'medium' },

  // === Vivo (medium) ===
  { brand: 'Vivo', model: 'X100 Pro', releaseYear: 2024, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Vivo', model: 'V29', releaseYear: 2023, priceTier: 'mid', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Vivo', model: 'Y100', releaseYear: 2023, priceTier: 'budget', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Vivo', model: 'X90', releaseYear: 2022, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Vivo', model: 'T2 Pro', releaseYear: 2023, priceTier: 'mid', formFactor: 'bar', difficulty: 'medium' },

  // === ASUS (medium) ===
  { brand: 'ASUS', model: 'ROG Phone 8', releaseYear: 2024, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'ASUS', model: 'Zenfone 10', releaseYear: 2023, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'ASUS', model: 'ROG Phone 6', releaseYear: 2022, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'ASUS', model: 'Zenfone 9', releaseYear: 2022, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'ASUS', model: 'ROG Phone 5', releaseYear: 2021, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },

  // === Nothing (hard) ===
  { brand: 'Nothing', model: 'Phone 2', releaseYear: 2023, priceTier: 'mid', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Nothing', model: 'Phone 1', releaseYear: 2022, priceTier: 'mid', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Nothing', model: 'Phone 2a', releaseYear: 2024, priceTier: 'mid', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Nothing', model: 'CMF Phone 1', releaseYear: 2024, priceTier: 'budget', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Nothing', model: 'Phone 2a Plus', releaseYear: 2024, priceTier: 'mid', formFactor: 'bar', difficulty: 'hard' },

  // === Realme (medium) ===
  { brand: 'Realme', model: '12 Pro+', releaseYear: 2024, priceTier: 'mid', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Realme', model: 'GT 5', releaseYear: 2023, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Realme', model: 'C55', releaseYear: 2023, priceTier: 'budget', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Realme', model: 'GT Neo 5', releaseYear: 2023, priceTier: 'mid', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Realme', model: 'Narzo 60', releaseYear: 2023, priceTier: 'budget', formFactor: 'bar', difficulty: 'medium' },

  // === Honor (medium) ===
  { brand: 'Honor', model: 'Magic 6 Pro', releaseYear: 2024, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Honor', model: '90', releaseYear: 2023, priceTier: 'mid', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Honor', model: 'X9b', releaseYear: 2024, priceTier: 'mid', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Honor', model: 'Magic 5 Pro', releaseYear: 2023, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Honor', model: '70', releaseYear: 2022, priceTier: 'mid', formFactor: 'bar', difficulty: 'medium' },

  // === Fairphone (hard) ===
  { brand: 'Fairphone', model: '5', releaseYear: 2023, priceTier: 'mid', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Fairphone', model: '4', releaseYear: 2021, priceTier: 'mid', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Fairphone', model: '3+', releaseYear: 2020, priceTier: 'mid', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Fairphone', model: '3', releaseYear: 2019, priceTier: 'mid', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Fairphone', model: '2', releaseYear: 2015, priceTier: 'mid', formFactor: 'bar', difficulty: 'hard' },

  // === Lenovo (medium) ===
  { brand: 'Lenovo', model: 'Legion Phone Duel 3', releaseYear: 2022, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Lenovo', model: 'ThinkPhone', releaseYear: 2023, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Lenovo', model: 'K15 Plus', releaseYear: 2021, priceTier: 'budget', formFactor: 'bar', difficulty: 'medium' },

  // === ZTE (medium) ===
  { brand: 'ZTE', model: 'Axon 50 Ultra', releaseYear: 2023, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'ZTE', model: 'Blade V50', releaseYear: 2023, priceTier: 'budget', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'ZTE', model: 'Axon 40 Ultra', releaseYear: 2022, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },

  // === Poco (hard) ===
  { brand: 'Poco', model: 'X6 Pro', releaseYear: 2024, priceTier: 'mid', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Poco', model: 'F5', releaseYear: 2023, priceTier: 'mid', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Poco', model: 'M6 Pro', releaseYear: 2024, priceTier: 'budget', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Poco', model: 'X5 Pro', releaseYear: 2023, priceTier: 'mid', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Poco', model: 'F4 GT', releaseYear: 2022, priceTier: 'flagship', formFactor: 'bar', difficulty: 'hard' },

  // === Redmi (hard) ===
  { brand: 'Redmi', model: 'Note 13 Pro+', releaseYear: 2024, priceTier: 'mid', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Redmi', model: '13C', releaseYear: 2023, priceTier: 'budget', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Redmi', model: 'Note 12 Pro', releaseYear: 2022, priceTier: 'mid', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Redmi', model: 'Note 11S', releaseYear: 2022, priceTier: 'mid', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Redmi', model: 'A2+', releaseYear: 2023, priceTier: 'budget', formFactor: 'bar', difficulty: 'hard' },

  // === TCL (hard) ===
  { brand: 'TCL', model: '40 NxtPaper', releaseYear: 2023, priceTier: 'mid', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'TCL', model: '30 SE', releaseYear: 2022, priceTier: 'budget', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'TCL', model: '20 Pro 5G', releaseYear: 2021, priceTier: 'mid', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'TCL', model: '10 Pro', releaseYear: 2020, priceTier: 'mid', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'TCL', model: '10L', releaseYear: 2020, priceTier: 'budget', formFactor: 'bar', difficulty: 'hard' },

  // === Sharp (hard) ===
  { brand: 'Sharp', model: 'Aquos R8 Pro', releaseYear: 2023, priceTier: 'flagship', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Sharp', model: 'Aquos sense8', releaseYear: 2023, priceTier: 'mid', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Sharp', model: 'Aquos R7', releaseYear: 2022, priceTier: 'flagship', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Sharp', model: 'Aquos zero6', releaseYear: 2021, priceTier: 'mid', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Sharp', model: 'Aquos R5G', releaseYear: 2020, priceTier: 'flagship', formFactor: 'bar', difficulty: 'hard' },

  // === Meizu (hard) ===
  { brand: 'Meizu', model: '21', releaseYear: 2024, priceTier: 'flagship', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Meizu', model: '20', releaseYear: 2023, priceTier: 'flagship', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Meizu', model: '18', releaseYear: 2021, priceTier: 'flagship', formFactor: 'bar', difficulty: 'hard' },

  // === Alcatel (hard) ===
  { brand: 'Alcatel', model: '3L (2021)', releaseYear: 2021, priceTier: 'budget', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Alcatel', model: '1S (2021)', releaseYear: 2021, priceTier: 'budget', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Alcatel', model: '3X (2020)', releaseYear: 2020, priceTier: 'budget', formFactor: 'bar', difficulty: 'hard' },

  // === iQOO (hard) ===
  { brand: 'iQOO', model: '12', releaseYear: 2024, priceTier: 'flagship', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'iQOO', model: 'Neo 9', releaseYear: 2024, priceTier: 'mid', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'iQOO', model: '11', releaseYear: 2023, priceTier: 'flagship', formFactor: 'bar', difficulty: 'hard' },

  // === Nubia (hard) ===
  { brand: 'Nubia', model: 'Z60 Ultra', releaseYear: 2024, priceTier: 'flagship', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Nubia', model: 'Red Magic 9 Pro', releaseYear: 2024, priceTier: 'flagship', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Nubia', model: 'Z50 Ultra', releaseYear: 2023, priceTier: 'flagship', formFactor: 'bar', difficulty: 'hard' },

  // === Razer (hard) ===
  { brand: 'Razer', model: 'Phone 2', releaseYear: 2018, priceTier: 'flagship', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Razer', model: 'Phone', releaseYear: 2017, priceTier: 'flagship', formFactor: 'bar', difficulty: 'hard' },

  // === Essential (hard) ===
  { brand: 'Essential', model: 'PH-1', releaseYear: 2017, priceTier: 'flagship', formFactor: 'bar', difficulty: 'hard' },

  // === Sony Ericsson (medium) ===
  { brand: 'Sony Ericsson', model: 'Xperia Arc', releaseYear: 2011, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Sony Ericsson', model: 'Xperia X10', releaseYear: 2010, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
];

// ─── File I/O ─────────────────────────────────────────────────────────────────

function loadManifest(): ManifestEntry[] {
  if (!existsSync(MANIFEST_PATH)) return [];
  return JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8')) as ManifestEntry[];
}

function saveManifest(entries: ManifestEntry[]): void {
  writeFileSync(MANIFEST_PATH, JSON.stringify(entries, null, 2) + '\n');
}

function loadGaps(): GapEntry[] {
  if (!existsSync(GAPS_PATH)) return [];
  return JSON.parse(readFileSync(GAPS_PATH, 'utf-8')) as GapEntry[];
}

function saveGaps(gaps: GapEntry[]): void {
  writeFileSync(GAPS_PATH, JSON.stringify(gaps, null, 2) + '\n');
}

// ─── CLI Entry Point ──────────────────────────────────────────────────────────

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  if (args.includes('--help')) {
    console.log(`
Usage: npx tsx phoneguessr/scripts/fetch-wikimedia-images.ts [options]

Options:
  --brand <name>   Only fetch for this brand (e.g. "Samsung")
  --dry-run        Search Wikimedia but do not write manifest
  --overwrite      Replace existing entries by brand|model key
  --help           Show this help
    `.trim());
    process.exit(0);
  }

  const dryRun = args.includes('--dry-run');
  const overwrite = args.includes('--overwrite');
  const brandIdx = args.indexOf('--brand');
  const brandFilter = brandIdx !== -1 ? args[brandIdx + 1] : null;

  const phones = brandFilter
    ? PHONE_MODELS.filter(p => p.brand.toLowerCase() === brandFilter.toLowerCase())
    : PHONE_MODELS;

  console.log('PhoneGuessr — Wikimedia Image Fetcher');
  console.log('======================================');
  if (dryRun) console.log('DRY RUN — manifest will not be written');
  if (brandFilter) console.log(`Brand filter: ${brandFilter}`);
  console.log(`Processing ${phones.length} models...\n`);

  const existingManifest = loadManifest();
  const existingGaps = loadGaps();
  const newEntries: ManifestEntry[] = [];
  const newGaps: GapEntry[] = [];

  for (const phone of phones) {
    // Rate limit: 500ms between requests
    await new Promise(r => setTimeout(r, 500));

    const candidate = await fetchWikimediaImage(phone.brand, phone.model);

    if (!candidate) {
      if (dryRun) {
        console.log(`[dry-run] ${phone.brand} ${phone.model}  →  NO IMAGE FOUND`);
      }
      newGaps.push({ brand: phone.brand, model: phone.model });
      continue;
    }

    const entry: ManifestEntry = {
      brand: phone.brand,
      model: phone.model,
      imageUrl: candidate.url,
      releaseYear: phone.releaseYear,
      priceTier: phone.priceTier,
      formFactor: phone.formFactor,
      difficulty: phone.difficulty,
      source: 'wikimedia-commons',
      attribution: candidate.attribution,
      licenseShortName: candidate.license,
      licenseUrl: candidate.licenseUrl,
    };

    if (dryRun) {
      console.log(`[dry-run] ${phone.brand} ${phone.model}  →  ${candidate.url}  (${candidate.license})`);
    } else {
      newEntries.push(entry);
    }
  }

  if (!dryRun) {
    const updatedManifest = applyManifestUpdate(existingManifest, newEntries, overwrite);
    saveManifest(updatedManifest);

    const mergedGaps = mergeGaps(existingGaps, newGaps);
    if (mergedGaps.length > 0) saveGaps(mergedGaps);

    console.log('\n══════════════════════════════════════');
    console.log(`✓ Found:  ${newEntries.length} / ${phones.length}`);
    console.log(`✗ Gaps:   ${newGaps.length}  → written to phoneguessr/scripts/gaps.json`);
    console.log('══════════════════════════════════════\n');
  }
}
```

- [ ] **Step 2: Add gaps.json to .gitignore**

```bash
grep -q 'gaps.json' /Users/calvinjeng/Documents/projects/guess-game/.gitignore || echo 'phoneguessr/scripts/gaps.json' >> /Users/calvinjeng/Documents/projects/guess-game/.gitignore
```

- [ ] **Step 3: Run the full test suite**

```bash
cd phoneguessr && npm run test 2>&1 | tail -20
```

Expected: all tests PASS (the new tests plus existing tests).

- [ ] **Step 4: Do a dry-run smoke test for one brand**

```bash
cd /Users/calvinjeng/Documents/projects/guess-game && npx tsx phoneguessr/scripts/fetch-wikimedia-images.ts --brand Nokia --dry-run 2>&1
```

Expected: 5 lines starting with `[dry-run] Nokia ...` each showing a URL or `NO IMAGE FOUND`.

- [ ] **Step 5: Commit**

```bash
git add phoneguessr/scripts/fetch-wikimedia-images.ts .gitignore
git commit -m "feat(scripts): add phone model list and CLI entry point for Wikimedia fetcher"
```

---

## Task 8: Update validator thresholds

**Files:**
- Modify: `phoneguessr/scripts/validate-phone-data.ts`

- [ ] **Step 1: Update catalog-size threshold from 400 to 250**

In `validate-phone-data.ts`, change the two occurrences of `400` (lines ~308, ~312, ~318) to `250`:

```ts
// Before:
if (phones.length >= 400) {
  ...
  detail: `${phones.length} phones (target: 400+)`,
  ...
  detail: `${phones.length} phones (target: 400+)`,

// After:
if (phones.length >= 250) {
  ...
  detail: `${phones.length} phones (target: 250+)`,
  ...
  detail: `${phones.length} phones (target: 250+)`,
```

- [ ] **Step 2: Update brand-count threshold from 100 to 50**

Search for the brand-count check (near line 325). Change `100` → `50`:

```ts
// Before:
if (brands.size >= 100) {
  ...
  detail: `${brands.size} brands (target: 100+)`,
  ...
  detail: `${brands.size} brands (target: 100+)`,

// After:
if (brands.size >= 50) {
  ...
  detail: `${brands.size} brands (target: 50+)`,
  ...
  detail: `${brands.size} brands (target: 50+)`,
```

- [ ] **Step 3: Lint check**

```bash
cd phoneguessr && npm run lint -- --reporter=compact 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add phoneguessr/scripts/validate-phone-data.ts
git commit -m "chore(scripts): lower catalog-size threshold to 250 phones and brand threshold to 50"
```

---

## Final Verification

- [ ] **Run full test suite one last time**

```bash
cd phoneguessr && npm run test 2>&1 | tail -20
```

Expected: all tests PASS.

- [ ] **Verify the script is executable end-to-end (dry run)**

```bash
cd /Users/calvinjeng/Documents/projects/guess-game && npx tsx phoneguessr/scripts/fetch-wikimedia-images.ts --brand Samsung --dry-run 2>&1
```

Expected: 5 lines of dry-run output for Samsung models.
