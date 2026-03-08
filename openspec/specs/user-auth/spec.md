## ADDED Requirements

### Requirement: Google OAuth login
The system SHALL support Google OAuth 2.0 as the authentication method. Users SHALL be able to sign in with their Google account.

#### Scenario: Successful login
- **WHEN** a user clicks "Sign in with Google" and completes the OAuth flow
- **THEN** the system creates or retrieves their user record and establishes a session

#### Scenario: Returning user login
- **WHEN** a user who has previously signed in completes the OAuth flow
- **THEN** the system retrieves their existing user record with all historical data intact

### Requirement: Anonymous play support
The system SHALL allow users to play the daily puzzle without authentication. Anonymous users SHALL have full gameplay functionality with results stored in localStorage only. Authenticated users SHALL use the database as their primary game state storage.

#### Scenario: Anonymous user plays
- **WHEN** a user loads the game without being authenticated
- **THEN** the game is fully playable with results stored in localStorage only

#### Scenario: Authenticated user plays
- **WHEN** an authenticated user plays the game
- **THEN** game state is stored in and restored from the database, with no localStorage writes for game state

### Requirement: Auth prompt on game completion
The system SHALL prompt anonymous users to sign in after completing a puzzle, explaining that signing in saves their score to the leaderboard.

#### Scenario: Anonymous user finishes puzzle
- **WHEN** an anonymous user completes the daily puzzle (win or loss)
- **THEN** the system displays a non-blocking prompt to sign in to save their score

### Requirement: User display name
The system SHALL use the user's Google account display name on leaderboards. Users SHALL NOT be able to customize their display name in v1.

#### Scenario: Leaderboard name display
- **WHEN** an authenticated user appears on a leaderboard
- **THEN** their Google account display name is shown

### Requirement: Session persistence
The system SHALL maintain user sessions across page reloads using secure HTTP-only cookies.

#### Scenario: Page reload while authenticated
- **WHEN** an authenticated user reloads the page
- **THEN** they remain authenticated without needing to sign in again
