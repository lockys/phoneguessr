## MODIFIED Requirements

### Requirement: Curated phone dataset
The system SHALL maintain a curated dataset of 400-650+ phones spanning all eras of mobile phone history. Each phone record SHALL include brand, model name, a stock product photo, release year, price tier, form factor, and difficulty rating.

#### Scenario: Phone record structure
- **WHEN** a phone is added to the dataset
- **THEN** it includes: brand (string), model (string), imagePath (string), releaseYear (integer or null for very old phones), priceTier (string: budget|mid|flagship), formFactor (string: bar|flip|fold), difficulty (string: easy|medium|hard), and active flag (boolean)

#### Scenario: Expanded catalog size
- **WHEN** the phone dataset is queried
- **THEN** at least 400 active phone entries are present

### Requirement: Brand coverage
The dataset SHALL include phones from at least 130 brands spanning major manufacturers, regional brands, and historical phone makers. This includes but is not limited to: Acer, Alcatel, Allview, Amazon, Apple, Archos, Asus, AT&T, Benefon, BenQ, BenQ-Siemens, Bird, BlackBerry, Blackview, BLU, Bosch, BQ, Casio, Cat, Celkon, Coolpad, Cubot, Dell, Doogee, Emporia, Energizer, Ericsson, Fairphone, Fujitsu Siemens, Garmin-Asus, Gigabyte, Gionee, Google, Haier, HMD, Honor, HP, HTC, Huawei, i-mate, i-mobile, Icemobile, Infinix, Innostream, iNQ, Intex, itel, Jolla, Karbonn, Kyocera, Lava, LeEco, Lenovo, LG, Maxon, Maxwest, Meizu, Micromax, Microsoft, Mitsubishi, Motorola, NEC, Neonode, NIU, Nokia, Nothing, Nvidia, O2, OnePlus, Oppo, Orange, Palm, Panasonic, Pantech, Philips, Plum, Prestigio, QMobile, Razer, Realme, Sagem, Samsung, Sendo, Sharp, Siemens, Sonim, Sony, Sony Ericsson, Spice, T-Mobile, TCL, Tecno, Thuraya, Toshiba, Ulefone, Umidigi, Vertu, vivo, Vodafone, Wiko, Xiaomi, XOLO, Yezz, Yota, YU, ZTE.

#### Scenario: Multi-brand coverage
- **WHEN** the phone dataset is queried
- **THEN** phones from at least 100 distinct brands are present

#### Scenario: Per-brand minimum
- **WHEN** the phone dataset is queried for any included brand
- **THEN** at least 2 phone entries exist for that brand

#### Scenario: Major brand depth
- **WHEN** the phone dataset is queried for Apple, Samsung, Nokia, or Motorola
- **THEN** at least 5 phone entries exist for that brand

### Requirement: Era diversity
The dataset SHALL include phones from multiple decades of mobile phone history, not just recent flagships.

#### Scenario: Historical coverage
- **WHEN** the phone dataset is queried
- **THEN** phones with releaseYear values spanning at least 15 different years are present

#### Scenario: Classic phones included
- **WHEN** the phone dataset is queried for phones with releaseYear before 2010
- **THEN** at least 50 entries are present (classic Nokia, Motorola, Sony Ericsson, etc.)

### Requirement: Difficulty distribution
The dataset SHALL have a balanced difficulty distribution to support varied gameplay.

#### Scenario: Easy phones
- **WHEN** the dataset is filtered to difficulty "easy"
- **THEN** at least 20% of total phones are in this tier
- **AND** they include widely recognizable phones from Apple, Samsung, Google, Nokia

#### Scenario: Medium phones
- **WHEN** the dataset is filtered to difficulty "medium"
- **THEN** at least 25% of total phones are in this tier
- **AND** they include phones from well-known but less dominant brands

#### Scenario: Hard phones
- **WHEN** the dataset is filtered to difficulty "hard"
- **THEN** at least 30% of total phones are in this tier
- **AND** they include phones from regional, niche, or obscure brands

### Requirement: Image availability
Every phone in the dataset SHALL have a corresponding image file that exists and is loadable.

#### Scenario: Image file integrity
- **WHEN** the seed data is validated
- **THEN** every phone entry's imagePath resolves to an existing JPEG file in `config/public/phones/`
- **AND** every image file is a valid JPEG that can be decoded

#### Scenario: No broken references
- **WHEN** a phone record references an imagePath
- **THEN** the file at that path exists and is non-empty

### Requirement: Brand name consistency
The dataset SHALL use consistent, canonical brand names matching GSMArena conventions with adjustments for readability.

#### Scenario: Brand name casing
- **WHEN** a phone entry uses a brand name
- **THEN** it matches the canonical casing from the approved brand list (e.g., "OnePlus" not "oneplus", "BlackBerry" not "Blackberry")

#### Scenario: Brand name mapping
- **WHEN** the collection script encounters a brand name variant
- **THEN** it normalizes to the canonical form (e.g., "BenQ-Siemens" stays hyphenated, "Sony Ericsson" stays with space)

### Requirement: Seed data backward compatibility
The expanded phone-data.json SHALL remain compatible with the existing seed script.

#### Scenario: Existing seed script works
- **WHEN** the seed script (`phoneguessr/src/db/seed.ts`) runs against the expanded phone-data.json
- **THEN** all phone records are inserted into the database without errors

#### Scenario: Existing phones preserved
- **WHEN** the expanded phone-data.json is compared to the current 20-phone dataset
- **THEN** all 20 existing phones are still present with their original data intact
