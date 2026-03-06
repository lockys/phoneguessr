## ADDED Requirements

### Requirement: Yesterday's phone reveal
The system SHALL display yesterday's daily puzzle answer, including the phone's full image, brand, model, and metadata.

#### Scenario: Yesterday's phone visible
- **WHEN** a player views the yesterday's reveal section
- **THEN** the full uncropped phone image, brand name, model name, and release year are displayed

#### Scenario: First day of service
- **WHEN** there is no yesterday puzzle (first day of the game)
- **THEN** the yesterday reveal section is hidden

### Requirement: Fun facts
The system SHALL display 1-3 fun facts about yesterday's phone. Facts SHALL be short (one sentence each) and informative.

#### Scenario: Fun facts display
- **WHEN** yesterday's phone has fun facts in the database
- **THEN** the facts are displayed as a list below the phone image

#### Scenario: No fun facts available
- **WHEN** yesterday's phone has no fun facts in the database
- **THEN** the fun facts section is omitted (no empty state shown)

### Requirement: Community stats
The system SHALL display aggregate statistics for yesterday's puzzle: total players, win rate percentage, and average number of guesses.

#### Scenario: Community stats display
- **WHEN** yesterday's puzzle had 150 players, 120 wins, and average of 3.2 guesses
- **THEN** the section shows "150 players | 80% solved | Avg 3.2 guesses"

#### Scenario: Low participation
- **WHEN** yesterday's puzzle had fewer than 5 players
- **THEN** community stats are hidden to avoid misleading small-sample data

### Requirement: Yesterday reveal accessibility
The yesterday reveal section SHALL be accessible at any time, not gated behind completing today's puzzle.

#### Scenario: Pre-game access
- **WHEN** a player opens the app before playing today's puzzle
- **THEN** yesterday's reveal is accessible from a dedicated section or panel

#### Scenario: Post-game access
- **WHEN** a player has completed today's puzzle
- **THEN** yesterday's reveal remains accessible

### Requirement: Yesterday reveal API
The system SHALL provide a GET /api/puzzle/yesterday endpoint that returns yesterday's puzzle data.

#### Scenario: Yesterday API response
- **WHEN** a client requests GET /api/puzzle/yesterday
- **THEN** the response includes { phone: { brand, model, imageUrl, releaseYear, priceTier }, facts: string[], stats: { totalPlayers, winRate, avgGuesses } }

#### Scenario: No yesterday puzzle
- **WHEN** there is no puzzle from the previous day
- **THEN** the API returns HTTP 404

#### Scenario: Yesterday API caching
- **WHEN** multiple clients request GET /api/puzzle/yesterday within the same UTC day
- **THEN** the response SHALL be cacheable (same data for all users for 24 hours)

#### Scenario: Mock mode yesterday
- **WHEN** IS_MOCK is true
- **THEN** the system returns mock data with a sample phone from MOCK_PHONES and placeholder fun facts

### Requirement: Yesterday in share context
The yesterday reveal SHALL create a "learn something" touchpoint that encourages return visits.

#### Scenario: Discovery moment
- **WHEN** a player reads yesterday's fun facts
- **THEN** the content SHALL be genuinely interesting trivia (release date, notable feature, sales milestone) rather than dry specifications
