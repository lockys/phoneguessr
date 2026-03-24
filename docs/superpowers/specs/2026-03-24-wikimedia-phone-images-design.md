# Wikimedia Phone Images Collection

**Date:** 2026-03-24
**Status:** Approved

## Problem

The current `press-kit-manifest.json` uses GSMArena image URLs (`fdn2.gsmarena.com`) whose licensing is unclear. The app database also only has 20 phones from 5 brands — far short of the 147-entry manifest and 130+ brand config. We need legally clear images from openly-licensed sources, while significantly expanding coverage to ~50 major brands.

## Goal

Replace GSMArena image URLs with CC-licensed images from Wikimedia Commons and expand the phone catalog to ~250 phones across ~50 major global brands (5 phones per major brand, following the existing tiering system).

## Architecture

A new script sits upstream of the existing pipeline:

```
fetch-wikimedia-images.ts       ← NEW
  → queries Wikimedia Commons API
  → writes/updates press-kit-manifest.json

collect-images.ts               ← UNCHANGED
  → downloads images from manifest URLs
  → processes with Sharp
  → generates phone-data.json
```

The pipeline logic of `collect-images.ts` is unchanged. The only required change to that file is extending the `ManifestEntry` interface with three optional attribution fields (see Manifest Entry Format below). `fetch-wikimedia-images.ts` imports `ManifestEntry` from `collect-images.ts` to share the single canonical type — no duplicate interface definitions.

## Script: `fetch-wikimedia-images.ts`

### Phone Model List

A hardcoded list of ~250 brand + model pairs embedded in the script. Covers ~50 major brands, 5 phones each, spanning 2019–2024, across flagship/mid/budget tiers. Each entry carries:

```ts
{
  brand: string
  model: string
  releaseYear: number
  priceTier: 'budget' | 'mid' | 'flagship'
  formFactor: 'bar' | 'flip' | 'fold'
  difficulty: 'easy' | 'medium' | 'hard'
}
```

Brands included (not exhaustive): Apple, Samsung, Google, Xiaomi, OnePlus, Sony, Motorola, Nokia, OPPO, Vivo, Realme, Honor, Huawei, LG, ASUS, HTC, BlackBerry, Nothing, Fairphone, Lenovo, ZTE, Poco, Redmi, TCL, Sharp, and ~25 more from the existing brand config.

### Wikimedia Commons API Search

For each model, a **single combined API call** using a search generator with imageinfo properties:

```
GET https://commons.wikimedia.org/w/api.php
  ?action=query
  &generator=search
  &gsrsearch="{brand} {model}"
  &gsrnamespace=6
  &gsrlimit=10
  &prop=imageinfo
  &iiprop=url|extmetadata|size
  &iiextmetadatafilter=LicenseShortName|Artist|LicenseUrl
  &format=json
  &origin=*
```

The `generator=search` approach returns pages with their imageinfo in one request, avoiding a separate lookup step. The search term `"{brand} {model}"` must be URL-encoded (e.g. `Galaxy S24+` → `Galaxy%20S24%2B`).

**User-Agent header** (required by Wikimedia API etiquette):
```
PhoneGuessr/1.0 (https://github.com/calvinjeng/guess-game) fetch-wikimedia-images/1.0
```

### License Filter

Read `extmetadata.LicenseShortName.value` from each candidate. Accept using `String.startsWith` or `includes` matching:

| Accept | Examples |
|--------|---------|
| `CC0` | `"CC0"` |
| `Public Domain` | `"Public domain"` |
| `CC BY` (any version) | `"CC BY 4.0"`, `"CC BY 2.0"` |
| `CC BY-SA` (any version) | `"CC BY-SA 4.0"`, `"CC BY-SA 3.0"` |

Reject if `LicenseShortName` is absent, empty, or contains `NC`, `ND`, `GFDL`, or `All rights reserved`.

For dual-licensed images (e.g. `"CC BY-SA 3.0 or GFDL"`), accept if any component matches the above.

### Image Selection

Among license-passing candidates, select the best image:

1. **Aspect ratio guard**: skip images where `width > height` (landscape/banner images are wrong for phones)
2. **Filename blocklist**: skip filenames containing `hand`, `holding`, `person`, `review`, `unbox` — these are press/review shots rather than clean product images
3. **Filename preference**: prefer filenames containing the model name or "front"
4. **Resolution**: among remaining candidates, prefer the highest pixel area (`width * height`)
5. **Format**: accept JPEG and PNG only; skip SVG, GIF, TIFF

**Known coverage gap**: Recent flagship phones (especially Apple iPhones and Google Pixels) have limited clean product shot coverage on Wikimedia Commons. These models are likely to land in `gaps.json` and require manual URL curation.

### Attribution Metadata

CC BY and CC BY-SA licenses require attribution. Store attribution fields on every manifest entry:

```ts
{
  // ...existing fields...
  attribution?: string      // extmetadata.Artist.value (HTML-stripped plain text)
  licenseShortName?: string // extmetadata.LicenseShortName.value
  licenseUrl?: string       // extmetadata.LicenseUrl.value
}
```

The `ManifestEntry` interface in `collect-images.ts` must be extended to include these three fields (optional, for backwards compatibility with manually-curated entries).

### Rate Limiting

Minimum **500ms** between requests (Wikimedia's recommended minimum for anonymous scripts). With ~250 models at one request each, total runtime is ~2 minutes. Requests are processed serially (no parallelism) to stay within anonymous access guidelines.

### Fallback

If no licensed image is found for a model, skip it and record `{ brand, model }` in `phoneguessr/scripts/gaps.json`. No GSMArena fallback.

## CLI Interface

```
npx tsx phoneguessr/scripts/fetch-wikimedia-images.ts [options]

Options:
  --brand <name>   Only fetch images for one brand (e.g. "Samsung")
  --dry-run        Search Wikimedia but do not write manifest; print selected image URL and license per model
  --overwrite      Replace existing entries with same brand|model key, regardless of source
  --help           Show help
```

**`--dry-run` output format** (one line per model):
```
[dry-run] Samsung Galaxy S24  →  https://upload.wikimedia.org/...  (CC BY-SA 4.0)
[dry-run] Samsung Galaxy S23  →  NO IMAGE FOUND
```

This allows validating image quality and license coverage before writing the manifest.

**Default behavior**: skip any manifest entry whose `brand|model` key already exists (idempotent re-runs).

**`--overwrite` behavior**: replace entries matching the same `brand|model` key — including existing GSMArena entries. This is the correct flag to use when migrating the manifest from GSMArena to Wikimedia.

**`gaps.json` merge behavior**: on each run, the file is read first (if it exists) and new gaps are merged in (deduplicated by `brand|model`). Re-runs with `--brand` never clear gaps from other brands.

## Manifest Entry Format

Generated entries use the existing `ManifestEntry` schema extended with attribution fields:

```json
{
  "brand": "Samsung",
  "model": "Galaxy S24",
  "imageUrl": "https://upload.wikimedia.org/...",
  "releaseYear": 2024,
  "priceTier": "flagship",
  "formFactor": "bar",
  "difficulty": "easy",
  "source": "wikimedia-commons",
  "attribution": "Samsung Electronics",
  "licenseShortName": "CC BY-SA 4.0",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/"
}
```

## Output Report

End-of-run summary printed to stdout:

```
✓ Found:  198 / 250
✗ Gaps:    52  → written to phoneguessr/scripts/gaps.json
```

## Validator Thresholds

`validate-phone-data.ts` currently checks for 400+ phones and 100+ brands. After this script runs with a fresh manifest, the catalog will have ~200–250 phones from ~50 brands. The strict thresholds in the validator must be updated to match the new targets before running `--strict` mode.

## Out of Scope

- Changes to `collect-images.ts` image processing pipeline
- Niche/rugged brand coverage (Cat, Doogee, Crosscall, etc.)
- Automatic gap-filling from other sources
- Per-brand official website scrapers
- Displaying attribution in the game UI (separate task)
