# Wikimedia Phone Images Collection

**Date:** 2026-03-24
**Status:** Approved

## Problem

The current `press-kit-manifest.json` uses GSMArena image URLs (`fdn2.gsmarena.com`) whose licensing is unclear. The app database also only has 20 phones from 5 brands — far short of the 147-entry manifest and 130+ brand config. We need legally clear images from manufacturer-provided or openly-licensed sources, while significantly expanding coverage to ~50 major brands.

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

No changes to `collect-images.ts` or the downstream pipeline.

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

For each model, two sequential API calls (no auth required):

**1. Search call:**
```
GET https://commons.wikimedia.org/w/api.php
  ?action=query&list=search
  &srsearch="{brand} {model}"
  &srnamespace=6
  &srlimit=10
  &format=json
```

**2. Image info call** (for each candidate):
```
GET https://commons.wikimedia.org/w/api.php
  ?action=query&titles=File:{filename}
  &prop=imageinfo
  &iiprop=url|extmetadata|size
  &format=json
```

### License Filter

Accept only:
- `CC BY` (any version)
- `CC BY-SA` (any version)
- `CC0`
- `Public Domain`

Reject: `CC BY-NC`, `All rights reserved`, or unknown/missing license.

### Image Selection

Among license-passing candidates:
1. Prefer filenames containing "front" or the exact model name
2. Prefer higher resolution (wider image wins)
3. Accept PNG or JPEG only

### Rate Limiting

1 request per 200ms — within Wikimedia's API guidelines for anonymous read-only access.

### Fallback

If no licensed image is found for a model, skip it and record `{ brand, model }` in `phoneguessr/scripts/gaps.json` for manual follow-up. No GSMArena fallback.

## CLI Interface

```
npx tsx phoneguessr/scripts/fetch-wikimedia-images.ts [options]

Options:
  --brand <name>   Only fetch images for one brand (e.g. "Samsung")
  --dry-run        Search Wikimedia but do not write manifest
  --overwrite      Replace existing manifest entries (default: skip existing)
  --help           Show help
```

Default behavior is idempotent: existing manifest entries are skipped unless `--overwrite` is passed. This allows safe re-runs and incremental expansion.

## Manifest Entry Format

Generated entries use the existing `ManifestEntry` schema with `source: "wikimedia-commons"`:

```json
{
  "brand": "Samsung",
  "model": "Galaxy S24",
  "imageUrl": "https://upload.wikimedia.org/...",
  "releaseYear": 2024,
  "priceTier": "flagship",
  "formFactor": "bar",
  "difficulty": "easy",
  "source": "wikimedia-commons"
}
```

## Output Report

End-of-run summary printed to stdout:

```
✓ Found:  198 / 250
✗ Gaps:    52  → written to phoneguessr/scripts/gaps.json
```

## Out of Scope

- Changes to `collect-images.ts` or downstream pipeline
- Niche/rugged brand coverage (Cat, Doogee, Crosscall, etc.)
- Automatic gap-filling from other sources
- Per-brand official website scrapers
