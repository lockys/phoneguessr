## ADDED Requirements

### Requirement: Time-based score with guess penalty
The system SHALL calculate a player's score as: `score = elapsed_seconds + (wrong_guesses × 10)`. Lower scores are better.

#### Scenario: Perfect guess
- **WHEN** a player guesses correctly on their first attempt in 12.4 seconds
- **THEN** the score is 12.4 (12.4 + 0 × 10)

#### Scenario: Multiple wrong guesses
- **WHEN** a player guesses correctly on their 4th attempt in 35.2 seconds
- **THEN** the score is 65.2 (35.2 + 3 × 10)

### Requirement: DNF scoring
The system SHALL record a DNF (Did Not Finish) for players who exhaust all 6 guesses without a correct answer. DNF results SHALL NOT receive a numeric score and SHALL NOT appear on daily leaderboards.

#### Scenario: Player fails all guesses
- **WHEN** a player submits 6 incorrect guesses
- **THEN** the result is recorded as DNF with no numeric score

### Requirement: Score persistence for authenticated users
The system SHALL persist scores to the database for authenticated users only. Anonymous users' scores SHALL exist only in localStorage.

#### Scenario: Authenticated user completes puzzle
- **WHEN** an authenticated user finishes the daily puzzle (win or DNF)
- **THEN** the result (score, guess count, outcome) is saved to the database

#### Scenario: Anonymous user completes puzzle
- **WHEN** an anonymous user finishes the daily puzzle
- **THEN** the result is stored in localStorage only and NOT saved to the database
