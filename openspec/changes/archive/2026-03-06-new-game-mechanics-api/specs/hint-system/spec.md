## ADDED Requirements

### Requirement: Hint request endpoint
The system SHALL provide a POST /api/hint endpoint that returns a hint about the daily puzzle's answer phone. The hint reveals one attribute of the phone based on the requested hint type.

#### Scenario: Request a brand hint
- **WHEN** an authenticated user sends `POST /api/hint` with `{ "puzzleId": 42, "hintType": "brand" }`
- **THEN** the system returns `{ "hint": "Samsung", "penalty": 15, "hintsUsed": 1, "hintsRemaining": 1 }`

#### Scenario: Request a year hint
- **WHEN** an authenticated user sends `POST /api/hint` with `{ "puzzleId": 42, "hintType": "year" }`
- **THEN** the system returns `{ "hint": "2024", "penalty": 15, "hintsUsed": 2, "hintsRemaining": 0 }`

#### Scenario: Request a price tier hint
- **WHEN** an authenticated user sends `POST /api/hint` with `{ "puzzleId": 42, "hintType": "price_tier" }`
- **THEN** the system returns `{ "hint": "flagship", "penalty": 15, "hintsUsed": 1, "hintsRemaining": 1 }`

### Requirement: Maximum two hints per puzzle
The system SHALL enforce a limit of 2 hints per user per puzzle. Each hint type can only be used once per puzzle.

#### Scenario: Third hint attempt
- **WHEN** a user who has already used 2 hints sends `POST /api/hint`
- **THEN** the system returns `409 { "error": "max_hints_reached" }`

#### Scenario: Duplicate hint type
- **WHEN** a user requests a hint type they already used on this puzzle
- **THEN** the system returns `409 { "error": "max_hints_reached" }`

### Requirement: Hint authentication
The system SHALL require authentication for the hint endpoint. Anonymous users handle hints client-side only.

#### Scenario: Unauthenticated hint request
- **WHEN** an unauthenticated user sends `POST /api/hint`
- **THEN** the system returns `401`

### Requirement: Hint on completed puzzle
The system SHALL reject hint requests for puzzles the user has already completed.

#### Scenario: Hint after game over
- **WHEN** a user who has already submitted a result for this puzzle sends `POST /api/hint`
- **THEN** the system returns `409 { "error": "puzzle_completed" }`

### Requirement: Hint input validation
The system SHALL validate that the hint type is one of the allowed values.

#### Scenario: Invalid hint type
- **WHEN** a user sends `POST /api/hint` with `{ "hintType": "color" }`
- **THEN** the system returns `400 { "error": "invalid_hint_type" }`

### Requirement: Hint score penalty
Each hint used SHALL add a 15-second penalty to the player's final score. The penalty is applied when the game result is submitted via POST /api/result, not in the hint endpoint itself.

#### Scenario: Score with hints
- **WHEN** a player uses 2 hints and guesses correctly on attempt 3 in 25 seconds
- **THEN** the score is `25 + (2 × 10) + (2 × 15) = 75`

### Requirement: Hints table schema
The system SHALL store hints in a `hints` table with columns: id (serial PK), user_id (FK users), puzzle_id (FK daily_puzzles), hint_type (varchar), created_at (timestamp). A unique index on (user_id, puzzle_id, hint_type) prevents duplicate hint types.

### Requirement: Mock mode hint behavior
In mock mode, the hint endpoint SHALL return hint data derived from `MOCK_PHONES` without accessing the database or Hono context.

#### Scenario: Mock hint request
- **WHEN** `IS_MOCK` is true and a hint is requested
- **THEN** the system returns a mock hint value based on the mock puzzle's phone data
