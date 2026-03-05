## ADDED Requirements

### Requirement: Curated phone dataset
The system SHALL maintain a curated dataset of ~100-150 flagship phones from the last 4-5 years. Each phone record SHALL include brand, model name, and a stock press photo.

#### Scenario: Phone record structure
- **WHEN** a phone is added to the dataset
- **THEN** it includes: brand (string), model (string), image file path (string), and an active flag (boolean)

### Requirement: Brand coverage
The dataset SHALL include flagship phones from major brands including but not limited to: Apple, Samsung, Google, OnePlus, Xiaomi, Nothing, and Sony.

#### Scenario: Multi-brand coverage
- **WHEN** the phone dataset is queried
- **THEN** phones from at least 5 distinct brands are present

### Requirement: Stock press photos
Each phone SHALL have one high-quality stock press photo showing the back of the device. Photos SHALL have consistent framing and similar visual style where possible.

#### Scenario: Image availability
- **WHEN** the daily puzzle loads a phone
- **THEN** a high-quality image file is available and loadable for that phone

### Requirement: Autocomplete search
The system SHALL support searching phones by brand name, model name, or combined "brand model" string. Search SHALL be case-insensitive and match partial strings.

#### Scenario: Search by brand
- **WHEN** a player types "Sam"
- **THEN** all Samsung phones in the dataset appear as suggestions

#### Scenario: Search by model
- **WHEN** a player types "Pixel"
- **THEN** all Google Pixel phones appear as suggestions

#### Scenario: Search by full name
- **WHEN** a player types "iPhone 16"
- **THEN** iPhone 16, iPhone 16 Plus, iPhone 16 Pro, and iPhone 16 Pro Max appear as suggestions

#### Scenario: Minimum character threshold
- **WHEN** a player types fewer than 2 characters
- **THEN** no autocomplete suggestions are shown

### Requirement: Phone active flag
Each phone SHALL have an active flag. Only active phones SHALL appear in autocomplete suggestions and be eligible for daily puzzle selection.

#### Scenario: Deactivated phone
- **WHEN** a phone's active flag is set to false
- **THEN** it does not appear in autocomplete and is not selected for daily puzzles
