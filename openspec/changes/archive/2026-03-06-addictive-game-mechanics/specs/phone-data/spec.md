## ADDED Requirements

### Requirement: Release year metadata
Each phone record SHALL include a releaseYear field (integer, e.g., 2024) indicating the year the phone was commercially released.

#### Scenario: Release year present
- **WHEN** a phone is added to the dataset
- **THEN** the releaseYear field is populated with the year of initial commercial availability

#### Scenario: Release year used for proximity
- **WHEN** a player guesses a phone and the system computes proximity feedback
- **THEN** the releaseYear field is compared between the guess and the answer

### Requirement: Price tier metadata
Each phone record SHALL include a priceTier field with one of three values: "budget", "mid-range", or "flagship".

#### Scenario: Price tier classification
- **WHEN** a phone is classified by price tier
- **THEN** "budget" means sub-$300, "mid-range" means $300-$700, "flagship" means $700+

#### Scenario: Price tier used for proximity and hints
- **WHEN** a player requests a price tier hint
- **THEN** the system returns the priceTier value (e.g., "Flagship")

### Requirement: Form factor metadata
Each phone record SHALL include a formFactor field with one of three values: "bar", "flip", or "fold".

#### Scenario: Bar phone
- **WHEN** a phone has a traditional slab/candy bar design
- **THEN** formFactor is "bar"

#### Scenario: Flip phone
- **WHEN** a phone has a vertically folding clamshell design (e.g., Galaxy Z Flip)
- **THEN** formFactor is "flip"

#### Scenario: Fold phone
- **WHEN** a phone has a horizontally folding book-style design (e.g., Galaxy Z Fold)
- **THEN** formFactor is "fold"

### Requirement: Difficulty tag
Each phone record SHALL include a difficulty field with one of three values: "easy", "medium", or "hard".

#### Scenario: Difficulty assignment
- **WHEN** a phone is added to the catalog
- **THEN** the difficulty field is set based on the phone's recognizability: "easy" for widely-known flagships, "medium" for mid-range or lesser-known models, "hard" for obscure or regional devices

### Requirement: Phone facts
The system SHALL support storing fun facts about phones in a separate phone_facts table. Each fact is a short text string associated with a phone ID.

#### Scenario: Phone with facts
- **WHEN** a phone has associated fun facts
- **THEN** the facts are retrievable by phone ID for the yesterday reveal feature

#### Scenario: Phone without facts
- **WHEN** a phone has no associated fun facts
- **THEN** the system gracefully handles the absence (no error, empty array returned)
