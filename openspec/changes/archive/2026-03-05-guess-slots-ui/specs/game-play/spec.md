## ADDED Requirements

### Requirement: Remaining guesses indicator
The guess history SHALL visually indicate remaining guesses with a frosted glass treatment and a count label.

#### Scenario: Empty slots with frosted style
- **WHEN** the player has made fewer than 6 guesses
- **THEN** unfilled guess slots SHALL display with a frosted/blurred background effect

#### Scenario: Guess count label
- **WHEN** there are remaining guesses
- **THEN** the first empty slot SHALL display "N guesses left" where N is the number of remaining attempts

#### Scenario: All guesses used
- **WHEN** the player has used all 6 guesses
- **THEN** no empty slots or remaining count SHALL be displayed
