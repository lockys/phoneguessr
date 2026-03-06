## MODIFIED Requirements

### Requirement: Time-based score with guess penalty
The system SHALL calculate a player's score as: `score = elapsed_seconds + (wrong_guesses × 10) + (hints_used × 15)`. Lower scores are better.

#### Scenario: Perfect guess no hints
- **WHEN** a player guesses correctly on their first attempt in 12.4 seconds with 0 hints
- **THEN** the score is 12.4 (12.4 + 0 × 10 + 0 × 15)

#### Scenario: Multiple wrong guesses no hints
- **WHEN** a player guesses correctly on their 4th attempt in 35.2 seconds with 0 hints
- **THEN** the score is 65.2 (35.2 + 3 × 10 + 0 × 15)

#### Scenario: Guesses with hints
- **WHEN** a player guesses correctly on their 3rd attempt in 25.0 seconds with 2 hints
- **THEN** the score is 75.0 (25.0 + 2 × 10 + 2 × 15)

#### Scenario: Single hint used
- **WHEN** a player guesses correctly on their 2nd attempt in 18.0 seconds with 1 hint
- **THEN** the score is 43.0 (18.0 + 1 × 10 + 1 × 15)

## ADDED Requirements

### Requirement: Hint penalty transparency
The result modal SHALL show a breakdown of the score including the hint penalty component separately from the guess penalty.

#### Scenario: Score breakdown display
- **WHEN** a player completes a puzzle with time 20.0s, 2 wrong guesses, and 1 hint
- **THEN** the result modal shows: "Time: 20.0s + Guess penalty: 20.0s + Hint penalty: 15.0s = Score: 55.0"

#### Scenario: No hint penalty in breakdown
- **WHEN** a player completes a puzzle with 0 hints
- **THEN** the hint penalty line is omitted from the score breakdown
