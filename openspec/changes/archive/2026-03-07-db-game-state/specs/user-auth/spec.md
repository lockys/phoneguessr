## MODIFIED Requirements

### Requirement: Anonymous play support
The system SHALL allow users to play the daily puzzle without authentication. Anonymous users SHALL have full gameplay functionality with results stored in localStorage only. Authenticated users SHALL use the database as their primary game state storage.

#### Scenario: Anonymous user plays
- **WHEN** a user loads the game without being authenticated
- **THEN** the game is fully playable with results stored in localStorage only

#### Scenario: Authenticated user plays
- **WHEN** an authenticated user plays the game
- **THEN** game state is stored in and restored from the database, with no localStorage writes for game state
