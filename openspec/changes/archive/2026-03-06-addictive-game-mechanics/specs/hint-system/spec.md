## ADDED Requirements

### Requirement: Hint types
The system SHALL offer three hint types during gameplay: brand reveal, release year reveal, and price tier reveal. Each hint reveals one piece of metadata about the daily puzzle's answer phone.

#### Scenario: Brand hint
- **WHEN** a player requests a brand hint
- **THEN** the system reveals the answer phone's brand name (e.g., "Samsung")

#### Scenario: Release year hint
- **WHEN** a player requests a release year hint
- **THEN** the system reveals the answer phone's release year (e.g., "2024")

#### Scenario: Price tier hint
- **WHEN** a player requests a price tier hint
- **THEN** the system reveals the answer phone's price tier (e.g., "Flagship")

### Requirement: Hint limit per game
The system SHALL allow a maximum of 2 hints per daily puzzle. Each hint type SHALL be usable at most once.

#### Scenario: First hint
- **WHEN** a player has used 0 hints and requests a hint
- **THEN** the hint is granted and the hint counter shows "1/2 hints used"

#### Scenario: Second hint
- **WHEN** a player has used 1 hint and requests a hint of a different type
- **THEN** the hint is granted and the hint counter shows "2/2 hints used"

#### Scenario: Hint limit reached
- **WHEN** a player has used 2 hints and attempts to request another
- **THEN** all remaining hint buttons SHALL be disabled

#### Scenario: Duplicate hint type
- **WHEN** a player has already used the brand hint and attempts to request brand again
- **THEN** the brand hint button SHALL be disabled regardless of total hints used

### Requirement: Hint score penalty
Each hint used SHALL add a 15-second penalty to the player's elapsed time for scoring purposes. The penalty SHALL be applied immediately when the hint is used.

#### Scenario: Single hint penalty
- **WHEN** a player uses 1 hint and finishes in 20.0 seconds with 2 wrong guesses
- **THEN** the score is 55.0 (20.0 + 15.0 hint penalty + 2 × 10 guess penalty)

#### Scenario: Double hint penalty
- **WHEN** a player uses 2 hints and finishes in 15.0 seconds with 0 wrong guesses
- **THEN** the score is 45.0 (15.0 + 30.0 hint penalty + 0 guess penalty)

### Requirement: Hints available during gameplay only
The system SHALL display hint buttons only while the game is in the "playing" state. Hints SHALL NOT be available before the game starts or after the game ends.

#### Scenario: Hints hidden before start
- **WHEN** the player has not started the game
- **THEN** no hint buttons are visible

#### Scenario: Hints hidden after game over
- **WHEN** the player has completed the puzzle (win or DNF)
- **THEN** hint buttons are removed from the UI

#### Scenario: Hints visible during play
- **WHEN** the player is actively playing (at least one guess remains)
- **THEN** hint buttons are visible below the autocomplete input

### Requirement: Hint confirmation
The system SHALL display the score penalty before a player confirms using a hint. The player SHALL explicitly confirm the hint usage.

#### Scenario: Hint confirmation prompt
- **WHEN** a player taps a hint button
- **THEN** the system displays "+15s penalty" and requires confirmation before revealing the hint

### Requirement: Hint persistence
The system SHALL persist hint usage for the current puzzle. If a player refreshes the page, previously used hints SHALL remain revealed and counted.

#### Scenario: Page refresh with hints used
- **WHEN** a player has used the brand hint and refreshes the page
- **THEN** the brand hint is shown as revealed and the hint counter reflects 1 hint used

### Requirement: Hint display in share card
Used hints SHALL be reflected in the share card. The share text SHALL indicate how many hints were used.

#### Scenario: Share with hints
- **WHEN** a player completes the puzzle having used 1 hint
- **THEN** the share text includes a hint indicator (e.g., "💡×1")

### Requirement: Hint API endpoint
The system SHALL provide a POST /api/hint endpoint that accepts a puzzle ID and hint type, validates the request, and returns the hint value.

#### Scenario: Valid hint request
- **WHEN** an authenticated player POSTs { puzzleId, hintType: "brand" } to /api/hint
- **THEN** the response includes { hint: "Samsung", penalty: 15, hintsUsed: 1 }

#### Scenario: Hint limit exceeded via API
- **WHEN** a player has already used 2 hints and POSTs a hint request
- **THEN** the API returns HTTP 400 with error "hint_limit_reached"

#### Scenario: Mock mode hint
- **WHEN** IS_MOCK is true and a hint is requested
- **THEN** the system returns hint data from MOCK_PHONES without database access
