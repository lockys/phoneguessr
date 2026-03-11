## ADDED Requirements

### Requirement: Game state retrieval API
The system SHALL provide a `GET /api/puzzle/state` endpoint that returns the authenticated user's game state for today's puzzle from the database.

#### Scenario: Authenticated user with completed game
- **WHEN** an authenticated user requests `/api/puzzle/state` and has a result record for today's puzzle
- **THEN** the system returns `{ guesses: [{phoneName, feedback}], elapsed, won }` with HTTP 200

#### Scenario: Authenticated user with in-progress game
- **WHEN** an authenticated user requests `/api/puzzle/state` and has guesses but no result for today's puzzle
- **THEN** the system returns `{ guesses: [{phoneName, feedback}] }` without elapsed or won fields

#### Scenario: Authenticated user with no game data
- **WHEN** an authenticated user requests `/api/puzzle/state` and has no guesses for today's puzzle
- **THEN** the system returns `null` with HTTP 200

#### Scenario: Unauthenticated request
- **WHEN** an unauthenticated user requests `/api/puzzle/state`
- **THEN** the system returns HTTP 401

### Requirement: Guess reconstruction from database
The system SHALL reconstruct guess display names by joining the `guesses` table with the `phones` table, concatenating `brand` and `model` fields to produce the `phoneName`.

#### Scenario: Guess name format
- **WHEN** the system retrieves guesses from the database
- **THEN** each guess's `phoneName` SHALL be formatted as `"<brand> <model>"` (e.g., "Apple iPhone 16 Pro")

### Requirement: Guess ordering
The system SHALL return guesses ordered by `guessNumber` ascending to preserve the original guess sequence.

#### Scenario: Multiple guesses returned in order
- **WHEN** a user made 3 guesses in order (guess 1, guess 2, guess 3)
- **THEN** the API returns them in that exact order
