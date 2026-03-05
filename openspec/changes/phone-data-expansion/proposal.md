## Why

PhoneGuessr currently has only 20 phones from 5 brands — enough for just 20 days of unique daily puzzles before repeating. For a daily puzzle game to retain players, it needs months of fresh content. Additionally, the phone records lack metadata (release year, price tier, form factor) needed for planned features: hint system, difficulty tiers, and "almost" feedback. Without expanding the catalog and enriching the data, the game cannot ship its v1 feature set.

## What Changes

- **Expand phone catalog target** from 20 to 120+ phones across 15+ brands, providing 4+ months of unique daily puzzles
- **Add phone metadata fields**: release year, price tier (budget/mid/flagship), form factor (bar/flip/fold), and difficulty rating (easy/medium/hard)
- **Define image standards** for phone photos: resolution, aspect ratio, background, angle, and file naming convention
- **Define data curation pipeline** for adding new phones to the catalog (sourcing, validation, review process)
- **Expand mock data** to 50+ phones with full metadata for realistic local development
- **Update MockPhone interface** to include new metadata fields

## Capabilities

### New Capabilities
- `phone-metadata`: Extended phone record fields (releaseYear, priceTier, formFactor, difficulty) with validation rules and allowed values
- `phone-catalog-targets`: Catalog size, brand coverage, and distribution requirements for sustainable daily puzzle content
- `phone-image-standards`: Image quality, format, naming, and sourcing requirements for phone photos
- `phone-curation-pipeline`: Process for adding, validating, and reviewing new phone entries

### Modified Capabilities
- `phone-data`: Update existing phone record structure requirement to include new metadata fields; update brand coverage requirement from 5 to 15+ brands
- `mock-api`: MockPhone interface must include new metadata fields; MOCK_PHONES array must grow to 50+ entries covering all brands

## Impact

- **Database schema**: `phones` table gains 4 new columns (releaseYear, priceTier, formFactor, difficulty)
- **Seed data**: `phoneguessr/src/db/phone-data.json` grows from 20 to 120+ entries with new fields
- **Mock data**: `phoneguessr/src/mock/data.ts` MockPhone interface and MOCK_PHONES array updated
- **API responses**: `GET /api/phones` response shape may include new fields for hint system consumers
- **Image assets**: `config/public/phones/` grows from 20 to 120+ image files
- **Migration**: New Drizzle migration needed for schema changes (handled by downstream BE task)
