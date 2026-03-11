## 1. Script Setup and Dependencies

- [ ] 1.1 Install `cheerio` and `sharp` as dev dependencies in the phoneguessr package
- [ ] 1.2 Create `phoneguessr/scripts/collect-images.ts` with basic CLI structure (argument parsing, help text)
- [ ] 1.3 Define the brand configuration array mapping 130+ brand names to GSMArena URL slugs
- [ ] 1.4 Implement HTTP fetch wrapper with 1-2s random delay, User-Agent header, retry logic (3 attempts with backoff), and error logging

## 2. GSMArena Scraping

- [ ] 2.1 Implement brand listing page parser: fetch `gsmarena.com/{brand-slug}-phones-{id}.php` and extract phone model links using cheerio
- [ ] 2.2 Handle pagination on brand listing pages (some brands have multiple pages of phones)
- [ ] 2.3 Implement phone detail page parser: extract full-resolution image URL, release date, phone type, and body form factor
- [ ] 2.4 Implement image download: fetch the product image URL and save raw bytes to a staging directory (`phoneguessr/scripts/.staging/`)
- [ ] 2.5 Add resumability: check if a phone's image already exists in staging before re-downloading
- [ ] 2.6 Test the scraper end-to-end on 3-5 brands (Apple, Nokia, Motorola, Benefon, Alcatel) to validate parsing across different page structures

## 3. Image Processing Pipeline

- [ ] 3.1 Implement sharp-based image processor: resize to max 800px width (preserve aspect ratio), convert to JPEG, optimize quality to target <200KB
- [ ] 3.2 Implement minimum dimension filter: skip images below 200x200px
- [ ] 3.3 Implement file naming: convert brand + model to lowercase kebab-case, handle special characters (`+` -> `-plus`, strip parens/slashes, collapse hyphens)
- [ ] 3.4 Save processed images to `phoneguessr/config/public/phones/`
- [ ] 3.5 Generate a processing report: count of images processed, skipped (too small), errors

## 4. Model Selection and Curation

- [ ] 4.1 Implement per-brand selection logic: sort phones by popularity/recency, pick top 2-5 per brand
- [ ] 4.2 Create a brand tier config mapping brands to their selection count: major brands (5), mid-tier (3-4), niche brands (2)
- [ ] 4.3 Add a manual override config file (`phoneguessr/scripts/phone-overrides.json`) for forcing inclusion/exclusion of specific models
- [ ] 4.4 Run selection on all 130+ brands and review output counts per brand

## 5. Metadata Generation

- [ ] 5.1 Implement releaseYear extraction from GSMArena release date strings (e.g., "Released 2005, October" -> 2005)
- [ ] 5.2 Implement priceTier inference heuristics based on brand positioning and model series names
- [ ] 5.3 Implement formFactor detection: parse phone type for flip/fold keywords, default to "bar"
- [ ] 5.4 Implement difficulty assignment based on brand recognition tiers: easy (Apple, Samsung, Google, Nokia, Motorola, iPhone, Galaxy), medium (OnePlus, Xiaomi, Sony, Huawei, HTC, BlackBerry, LG, Ericsson, Sony Ericsson, Siemens), hard (all others)
- [ ] 5.5 Generate phone-data.json entries combining image paths with extracted metadata
- [ ] 5.6 Merge generated entries with existing 20 phones in phone-data.json (preserve existing entries, append new ones)

## 6. Validation

- [ ] 6.1 Create validation script (`phoneguessr/scripts/validate-phone-data.ts`) that checks: all required fields present, valid enum values, no duplicate brand+model, image files exist
- [ ] 6.2 Validate brand coverage: confirm at least 100 distinct brands in the final dataset
- [ ] 6.3 Validate difficulty distribution: at least 20% easy, 25% medium, 30% hard
- [ ] 6.4 Validate image integrity: every referenced image file exists, is valid JPEG, is non-empty, and is under 200KB
- [ ] 6.5 Validate backward compatibility: all 20 original phones still present and unchanged
- [ ] 6.6 Run seed script against a local database to confirm all entries load without errors

## 7. Mock Data Update

- [ ] 7.1 Expand MOCK_PHONES array in `phoneguessr/src/mock/data.ts` to include a representative sample (60-80 phones) from the expanded catalog
- [ ] 7.2 Ensure mock data covers all difficulty tiers and a diverse set of brands
- [ ] 7.3 Verify mock data entries have all required metadata fields

## 8. Cleanup and Documentation

- [ ] 8.1 Add `collect-images` npm script to package.json for easy execution
- [ ] 8.2 Add `.staging/` to .gitignore (staging directory should not be committed)
- [ ] 8.3 Remove or update `generate-placeholders.ts` if it conflicts with the new pipeline
- [ ] 8.4 Run final end-to-end test: scrape -> process -> generate -> validate -> seed
