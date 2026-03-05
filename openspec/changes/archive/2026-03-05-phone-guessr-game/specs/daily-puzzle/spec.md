## ADDED Requirements

### Requirement: One puzzle per day globally
The system SHALL serve exactly one phone puzzle per calendar day (UTC). All players SHALL receive the same puzzle on the same day regardless of timezone.

#### Scenario: Same puzzle for all players
- **WHEN** two players load the game on the same UTC date
- **THEN** both players receive the same phone as the daily puzzle

#### Scenario: New puzzle at UTC midnight
- **WHEN** the UTC date changes from day N to day N+1
- **THEN** the system serves a new puzzle corresponding to day N+1

### Requirement: Deterministic puzzle assignment
The system SHALL use a seeded selection algorithm based on the UTC date to assign phones to days. The puzzle-to-date mapping SHALL be stored in a `daily_puzzles` database table.

#### Scenario: Puzzle assignment is repeatable
- **WHEN** the system restarts or the selection algorithm runs again for a given date
- **THEN** the same phone is assigned to that date

### Requirement: No past puzzle access
The system SHALL NOT allow players to access or play puzzles from previous days. Only the current day's puzzle SHALL be playable.

#### Scenario: Requesting a past puzzle
- **WHEN** a player attempts to load a puzzle from a previous date
- **THEN** the system redirects to the current day's puzzle

### Requirement: Phone repetition handling
The system SHALL cycle through the entire phone pool before repeating a phone. When all phones have been used, the system SHALL begin a new cycle with a re-shuffled order.

#### Scenario: All phones used
- **WHEN** every phone in the pool has been assigned as a daily puzzle
- **THEN** the system begins a new rotation with a different ordering
