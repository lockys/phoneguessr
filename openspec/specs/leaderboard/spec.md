## ADDED Requirements

### Requirement: Daily leaderboard
The system SHALL display a daily leaderboard ranking authenticated players by their score (lowest first) for the current day's puzzle.

#### Scenario: Viewing daily leaderboard
- **WHEN** a player views the daily leaderboard
- **THEN** the system displays authenticated players ranked by score (ascending) for today's puzzle

#### Scenario: DNF excluded from daily ranking
- **WHEN** an authenticated player has a DNF result for today
- **THEN** they do not appear on the daily leaderboard

### Requirement: Weekly leaderboard
The system SHALL display a weekly leaderboard ranking authenticated players by total wins in the current calendar week (Monday–Sunday UTC).

#### Scenario: Viewing weekly leaderboard
- **WHEN** a player views the weekly leaderboard
- **THEN** the system displays players ranked by total wins this week (descending)

### Requirement: Monthly leaderboard
The system SHALL display a monthly leaderboard ranking authenticated players by total wins in the current calendar month (UTC).

#### Scenario: Viewing monthly leaderboard
- **WHEN** a player views the monthly leaderboard
- **THEN** the system displays players ranked by total wins this month (descending)

### Requirement: All-time leaderboard
The system SHALL display an all-time leaderboard ranking authenticated players by total wins across all time.

#### Scenario: Viewing all-time leaderboard
- **WHEN** a player views the all-time leaderboard
- **THEN** the system displays players ranked by total wins (descending)

### Requirement: Leaderboard accessible to all
The system SHALL allow both authenticated and anonymous users to view leaderboards. Only authenticated users' scores appear on leaderboards. The leaderboard SHALL be displayed as a separate swipeable panel rather than inline below the game results.

#### Scenario: Anonymous user views leaderboard
- **WHEN** an anonymous user swipes to the leaderboard panel
- **THEN** the leaderboard is displayed but the anonymous user's results are not included

#### Scenario: Leaderboard available during gameplay
- **WHEN** a player swipes to the leaderboard panel during an active game
- **THEN** the leaderboard SHALL be viewable with current standings

### Requirement: Leaderboard display format
Each leaderboard entry SHALL display the player's rank, display name, guess count (e.g., "3/6"), and score (for daily) or total wins (for weekly/monthly/all-time).

#### Scenario: Daily leaderboard entry
- **WHEN** a player views the daily leaderboard
- **THEN** each entry shows: rank, display name, guess fraction (e.g., "2/6"), and time score

#### Scenario: Aggregate leaderboard entry
- **WHEN** a player views weekly/monthly/all-time leaderboard
- **THEN** each entry shows: rank, display name, and total win count
