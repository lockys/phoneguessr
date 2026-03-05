## ADDED Requirements

### Requirement: Release year field
Each phone record SHALL include a `releaseYear` integer field representing the year the phone was first released commercially.

#### Scenario: Phone with release year
- **WHEN** a phone record is created or queried
- **THEN** the `releaseYear` field contains a 4-digit year between 2020 and 2030

#### Scenario: Release year is required
- **WHEN** a new phone is added to the catalog
- **THEN** the `releaseYear` field MUST be present and non-null

### Requirement: Price tier field
Each phone record SHALL include a `priceTier` field classifying the phone's market segment.

#### Scenario: Valid price tier values
- **WHEN** a phone's `priceTier` is set
- **THEN** the value MUST be one of: `budget`, `mid`, or `flagship`

#### Scenario: Budget tier classification
- **WHEN** a phone has a launch price under $400 USD
- **THEN** its `priceTier` SHALL be `budget`

#### Scenario: Mid tier classification
- **WHEN** a phone has a launch price between $400-$799 USD
- **THEN** its `priceTier` SHALL be `mid`

#### Scenario: Flagship tier classification
- **WHEN** a phone has a launch price of $800 USD or above
- **THEN** its `priceTier` SHALL be `flagship`

### Requirement: Form factor field
Each phone record SHALL include a `formFactor` field describing the phone's physical design.

#### Scenario: Valid form factor values
- **WHEN** a phone's `formFactor` is set
- **THEN** the value MUST be one of: `bar`, `flip`, or `fold`

#### Scenario: Standard slab phone
- **WHEN** a phone has a traditional flat/slab design
- **THEN** its `formFactor` SHALL be `bar`

#### Scenario: Flip phone
- **WHEN** a phone folds vertically into a compact form (e.g., Galaxy Z Flip, Razr)
- **THEN** its `formFactor` SHALL be `flip`

#### Scenario: Foldable phone
- **WHEN** a phone unfolds horizontally into a tablet-sized screen (e.g., Galaxy Z Fold)
- **THEN** its `formFactor` SHALL be `fold`

### Requirement: Difficulty rating field
Each phone record SHALL include a `difficulty` field indicating how hard the phone is to identify visually.

#### Scenario: Valid difficulty values
- **WHEN** a phone's `difficulty` is set
- **THEN** the value MUST be one of: `easy`, `medium`, or `hard`

#### Scenario: Easy difficulty assignment
- **WHEN** a phone is a flagship from Apple, Samsung, or Google with distinctive design
- **THEN** its `difficulty` SHALL be `easy`

#### Scenario: Medium difficulty assignment
- **WHEN** a phone is from a well-known brand (OnePlus, Xiaomi, Nothing, Sony, Motorola) or is a mid-range model
- **THEN** its `difficulty` SHALL be `medium`

#### Scenario: Hard difficulty assignment
- **WHEN** a phone is from a regional brand or has a design similar to many other phones
- **THEN** its `difficulty` SHALL be `hard`

### Requirement: Metadata stored as varchar
The `priceTier`, `formFactor`, and `difficulty` fields SHALL be stored as varchar columns with application-level validation, not PostgreSQL ENUM types.

#### Scenario: Adding a new enum value
- **WHEN** a new value needs to be added to priceTier, formFactor, or difficulty
- **THEN** only application code and TypeScript types need updating, not database migrations
