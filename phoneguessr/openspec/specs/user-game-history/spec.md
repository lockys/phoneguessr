## ADDED Requirements

### Requirement: Store email from Google OAuth
The system SHALL extract the `email` field from Google's userinfo response and store it in the users table. The email column SHALL be nullable and unique.

#### Scenario: New user signs in with Google
- **WHEN** a new user completes Google OAuth login
- **THEN** the system creates a user record with googleId, displayName, avatarUrl, AND email from the userinfo response

#### Scenario: Existing user signs in again
- **WHEN** an existing user (by googleId) signs in via Google OAuth
- **THEN** the system updates their displayName, avatarUrl, AND email with the latest values from Google

### Requirement: Email included in session and auth response
The system SHALL include the user's email in the JWT session token and in the `/api/auth/me` response.

#### Scenario: Auth me returns email
- **WHEN** an authenticated user calls `GET /api/auth/me`
- **THEN** the response SHALL include `email` in the user object (null if not yet captured)

### Requirement: Game history API endpoint
The system SHALL provide `GET /api/profile/history` that returns the authenticated user's game results with puzzle details, ordered by puzzle date descending.

#### Scenario: Authenticated user fetches history
- **WHEN** an authenticated user calls `GET /api/profile/history`
- **THEN** the response SHALL contain an array of result objects, each with: puzzleDate, puzzleNumber, isWin, guessCount, score, phoneBrand, phoneModel

#### Scenario: Paginated history
- **WHEN** the user calls `GET /api/profile/history?limit=20&offset=20`
- **THEN** the response SHALL return the next 20 results starting from offset 20, plus a `total` count

#### Scenario: Unauthenticated user
- **WHEN** an unauthenticated user calls `GET /api/profile/history`
- **THEN** the system SHALL return 401 Unauthorized

#### Scenario: User with no game history
- **WHEN** an authenticated user with no results calls `GET /api/profile/history`
- **THEN** the response SHALL return an empty array with total: 0

### Requirement: Profile panel displays user data and game history
The profile panel SHALL display the user's avatar, display name, and email. Below stats, it SHALL show a scrollable game history list.

#### Scenario: Profile shows Google profile data
- **WHEN** an authenticated user views the profile panel
- **THEN** the panel SHALL display their avatar image, display name, and email address

#### Scenario: Profile shows game history
- **WHEN** an authenticated user views the profile panel
- **THEN** the panel SHALL display a list of past game results showing date, puzzle number, win/loss status, guess count, and score

#### Scenario: Empty game history
- **WHEN** an authenticated user with no game results views the profile panel
- **THEN** the panel SHALL display a message indicating no games played yet

#### Scenario: Load more history
- **WHEN** the user scrolls to the bottom of the game history list and more results exist
- **THEN** the system SHALL fetch and append the next page of results
