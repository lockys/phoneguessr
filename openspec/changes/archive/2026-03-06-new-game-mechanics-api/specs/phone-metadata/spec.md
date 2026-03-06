## MODIFIED Requirements

### Requirement: Extended phone schema
The `phones` table SHALL include additional metadata columns for enhanced feedback and difficulty features.

#### Scenario: Phone record with metadata
- **WHEN** a phone is added or updated
- **THEN** it may include: `releaseYear` (integer), `priceTier` (varchar: 'budget' | 'mid' | 'flagship'), `formFactor` (varchar: 'bar' | 'flip' | 'fold'), `difficulty` (varchar: 'easy' | 'medium' | 'hard')

### Requirement: Nullable metadata columns
All new metadata columns SHALL be nullable to maintain backward compatibility with existing phone records.

#### Scenario: Existing phone without metadata
- **WHEN** a phone record predates the schema migration
- **THEN** all new metadata columns are null and the phone continues to function in the system

### Requirement: Release year
The `releaseYear` column SHALL store the phone's release year as a 4-digit integer (e.g., 2024).

### Requirement: Price tier
The `priceTier` column SHALL categorize phones into one of three tiers:
- `"budget"`: phones under $400 at launch
- `"mid"`: phones $400-799 at launch
- `"flagship"`: phones $800+ at launch

### Requirement: Form factor
The `formFactor` column SHALL categorize phones by physical form:
- `"bar"`: standard slab/candy bar form factor
- `"flip"`: clamshell folding phones
- `"fold"`: book-style folding phones

### Requirement: Difficulty classification
The `difficulty` column SHALL categorize phones for daily puzzle selection:
- `"easy"`: widely recognized flagship phones (e.g., iPhone 16 Pro, Galaxy S25 Ultra)
- `"medium"`: known but less iconic phones (e.g., Pixel 9, OnePlus 12)
- `"hard"`: niche, regional, or obscure phones (e.g., Realme GT 5 Pro, Nubia Z60 Ultra)

## ADDED Requirements

### Requirement: Phone facts table
The system SHALL maintain a `phone_facts` table storing interesting facts about phones for the yesterday's reveal feature.

#### Scenario: Phone fact record
- **WHEN** a fact is added for a phone
- **THEN** it includes: `phone_id` (FK phones), `fact_text` (text), `fact_type` (varchar: 'spec' | 'history' | 'trivia')

### Requirement: Hints table
The system SHALL maintain a `hints` table tracking hint usage per user per puzzle.

#### Scenario: Hint record
- **WHEN** a user requests a hint
- **THEN** a record is created with: `user_id` (FK users), `puzzle_id` (FK daily_puzzles), `hint_type` (varchar), `created_at` (timestamp)

#### Scenario: Unique constraint on hints
- **WHEN** a user tries to request the same hint type for the same puzzle
- **THEN** the unique index on (user_id, puzzle_id, hint_type) prevents duplicate records

### Requirement: Mock data expansion
The `MOCK_PHONES` array SHALL include `releaseYear`, `priceTier`, `formFactor`, and `difficulty` fields for all mock phones to support enhanced feedback and difficulty features in local development.

#### Scenario: Mock phone with metadata
- **WHEN** mock mode is active
- **THEN** each mock phone has all metadata fields populated (e.g., `{ id: 1, brand: "Apple", model: "iPhone 16 Pro", imagePath: "...", releaseYear: 2024, priceTier: "flagship", formFactor: "bar", difficulty: "easy" }`)
