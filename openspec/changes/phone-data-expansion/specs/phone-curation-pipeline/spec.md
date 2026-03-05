## ADDED Requirements

### Requirement: Manual curation process
New phones SHALL be added through manual curation by the development team. The process involves adding an entry to the seed JSON file and placing the corresponding image in the images directory.

#### Scenario: Adding a new phone
- **WHEN** a curator wants to add a new phone to the catalog
- **THEN** they add an entry to `phoneguessr/src/db/phone-data.json` with all required fields (brand, model, imagePath, releaseYear, priceTier, formFactor, difficulty) and place the image file in `config/public/phones/`

### Requirement: Seed file as source of truth
The `phoneguessr/src/db/phone-data.json` file SHALL be the single source of truth for the phone catalog. The database is populated from this file via the seed script.

#### Scenario: Database seeded from JSON
- **WHEN** the seed script runs
- **THEN** the `phones` table is populated with all entries from `phone-data.json`

### Requirement: Validation checklist for new entries
Each new phone entry SHALL pass these validation checks before being merged:
1. All required fields are present and non-empty
2. Brand matches an approved brand name (exact casing)
3. priceTier is one of: budget, mid, flagship
4. formFactor is one of: bar, flip, fold
5. difficulty is one of: easy, medium, hard
6. releaseYear is between 2020 and current year + 1
7. Image file exists at the specified imagePath
8. No duplicate brand+model combination exists

#### Scenario: Valid phone entry
- **WHEN** a phone entry passes all validation checks
- **THEN** it can be merged into the catalog

#### Scenario: Invalid phone entry
- **WHEN** a phone entry fails any validation check
- **THEN** it SHALL be rejected with a clear error message indicating which check failed

### Requirement: Approved brand names
The catalog SHALL use consistent brand name casing. The approved brand names are: Apple, Samsung, Google, OnePlus, Nothing, Xiaomi, Sony, Motorola, Huawei, OPPO, vivo, Realme, ASUS, Honor, ZTE, Nubia.

#### Scenario: Brand name consistency
- **WHEN** a phone entry uses brand name "Oneplus" or "oneplus"
- **THEN** validation fails because the approved casing is "OnePlus"

### Requirement: No automated scraping for v1
The v1 data pipeline SHALL NOT include automated web scraping or community submission systems. These are future considerations.

#### Scenario: Manual-only pipeline
- **WHEN** the phone catalog needs to be expanded
- **THEN** all additions are made manually through JSON edits and image file additions
