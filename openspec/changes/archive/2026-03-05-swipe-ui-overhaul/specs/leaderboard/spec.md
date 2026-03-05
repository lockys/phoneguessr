## MODIFIED Requirements

### Requirement: Leaderboard accessible to all
The system SHALL allow both authenticated and anonymous users to view leaderboards. Only authenticated users' scores appear on leaderboards. The leaderboard SHALL be displayed as a separate swipeable panel rather than inline below the game results.

#### Scenario: Anonymous user views leaderboard
- **WHEN** an anonymous user swipes to the leaderboard panel
- **THEN** the leaderboard is displayed but the anonymous user's results are not included

#### Scenario: Leaderboard available during gameplay
- **WHEN** a player swipes to the leaderboard panel during an active game
- **THEN** the leaderboard SHALL be viewable with current standings
