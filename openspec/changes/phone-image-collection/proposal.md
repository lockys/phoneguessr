## Why

The game currently has only 20 phones with real images. To make the game engaging and replayable, we need a much larger catalog covering the full range of phone brands. Users provided a list of 130+ brands to source images for.

## What Changes

- Create a scraping/collection script to download phone images from GSMArena (or similar public sources) for all requested brands
- Process and normalize images (consistent dimensions, file format, compression)
- Update `phone-data.json` with new phone entries including brand, model, and image paths
- Seed the database with new phone records
- Only include phones that have high-quality, identifiable stock photos suitable for the guessing game

## Capabilities

### New Capabilities
- `phone-image-pipeline`: Automated script to fetch, process, and catalog phone images from web sources

### Modified Capabilities
- `phone-data`: Expanding the phone catalog from 20 to hundreds of phones across 130+ brands

## Impact

- **Data**: Significant expansion of `phoneguessr/src/db/phone-data.json` and `phoneguessr/config/public/phones/` directory
- **Storage**: Image files will increase repository/deployment size substantially
- **Database**: New phone records seeded via existing seed script
- **Scripts**: New `scripts/collect-images.ts` for automated image collection
- **Testing**: Mock data and tests will need updating for expanded phone catalog
