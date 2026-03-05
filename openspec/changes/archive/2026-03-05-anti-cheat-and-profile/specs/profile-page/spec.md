## ADDED Requirements

### Requirement: Profile panel with personal stats
The system SHALL provide a profile panel accessible via swipe navigation that displays the player's personal game statistics.

#### Scenario: Viewing profile stats
- **WHEN** a player swipes to the profile panel
- **THEN** the panel SHALL display: total games played, total wins, win rate percentage, current streak, and best streak

#### Scenario: Anonymous user profile
- **WHEN** an anonymous user views the profile panel
- **THEN** stats SHALL be derived from localStorage game history
- **AND** a prompt to sign in SHALL be shown for persistent stats

#### Scenario: Authenticated user profile
- **WHEN** an authenticated user views the profile panel
- **THEN** stats SHALL be fetched from the server via API
- **AND** the user's display name SHALL be shown

### Requirement: Profile stats API
The system SHALL provide an API endpoint for authenticated users to retrieve their personal game statistics.

#### Scenario: Fetching profile stats
- **WHEN** an authenticated user requests their profile stats
- **THEN** the server SHALL return: games played, wins, win rate, current streak, best streak
