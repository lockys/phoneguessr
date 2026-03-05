## ADDED Requirements

### Requirement: Mock puzzle endpoint
The mock API SHALL return a fixed daily puzzle with a placeholder image path when `GET /api/puzzle/today` is called.

#### Scenario: Fetch today's puzzle in mock mode
- **WHEN** a request is made to `GET /api/puzzle/today` with `MOCK_API=true`
- **THEN** the response includes puzzleId, puzzleNumber, puzzleDate, and imagePath pointing to a placeholder SVG

### Requirement: Mock phones endpoint
The mock API SHALL return the full list of mock phones with brand, model, and id when `GET /api/phones` is called.

#### Scenario: Fetch phone list in mock mode
- **WHEN** a request is made to `GET /api/phones` with `MOCK_API=true`
- **THEN** the response includes an array of 20 phones with id, brand, and model fields

### Requirement: Mock guess endpoint
The mock API SHALL evaluate guesses against the daily puzzle answer using in-memory state and return correct feedback (wrong_brand, right_brand, correct).

#### Scenario: Submit a correct guess in mock mode
- **WHEN** a player submits a guess matching the daily puzzle answer
- **THEN** the response includes `feedback: "correct"`

#### Scenario: Submit a wrong brand guess in mock mode
- **WHEN** a player submits a guess with a different brand than the answer
- **THEN** the response includes `feedback: "wrong_brand"`

#### Scenario: Submit a right brand wrong model guess in mock mode
- **WHEN** a player submits a guess with the same brand but different model
- **THEN** the response includes `feedback: "right_brand"`

### Requirement: Mock result endpoint
The mock API SHALL accept result submissions and return success without database persistence.

#### Scenario: Submit result in mock mode
- **WHEN** a result is submitted to `POST /api/result` with `MOCK_API=true`
- **THEN** the response includes `success: true` and a calculated score

### Requirement: Mock auth endpoints
The mock API SHALL simulate authentication by returning a fake user without requiring Google OAuth credentials.

#### Scenario: Check auth status in mock mode
- **WHEN** `GET /api/auth/me` is called with `MOCK_API=true`
- **THEN** the response includes a mock user with id, displayName, and avatarUrl

#### Scenario: Login redirect in mock mode
- **WHEN** `GET /api/auth/login` is called with `MOCK_API=true`
- **THEN** the system sets a mock session cookie and redirects to `/`

### Requirement: Mock leaderboard endpoints
The mock API SHALL return sample leaderboard data for all four time periods.

#### Scenario: Fetch daily leaderboard in mock mode
- **WHEN** `GET /api/leaderboard/daily` is called with `MOCK_API=true`
- **THEN** the response includes sample entries with rank, displayName, score, and guessCount

#### Scenario: Fetch aggregate leaderboard in mock mode
- **WHEN** `GET /api/leaderboard/weekly` (or monthly/all-time) is called with `MOCK_API=true`
- **THEN** the response includes sample entries with rank, displayName, and totalWins

### Requirement: Mock image endpoint
The mock API SHALL serve puzzle images as base64 data URLs matching the production endpoint format.

#### Scenario: Mock image endpoint
- **WHEN** the client requests the puzzle image in mock mode
- **THEN** the mock API SHALL read the image file from `config/public/phones/`, encode it as base64, and return it in the same format as the production endpoint

### Requirement: Mock profile stats endpoint
The mock API SHALL return realistic static profile statistics for local development.

#### Scenario: Mock profile stats endpoint
- **WHEN** the client requests profile stats in mock mode
- **THEN** the mock API SHALL return realistic static stats (e.g., games played: 10, wins: 7, etc.)

### Requirement: Placeholder phone images
The system SHALL include SVG placeholder images for all phones in the mock dataset, stored in `public/phones/`.

#### Scenario: Placeholder image loads
- **WHEN** the game UI requests a phone image in mock mode
- **THEN** an SVG placeholder with the phone's brand and model text is served

### Requirement: Dev script
The project SHALL include a `pnpm dev:mock` script that starts the dev server with `MOCK_API=true`.

#### Scenario: Starting mock dev server
- **WHEN** a developer runs `pnpm dev:mock`
- **THEN** the Modern.js dev server starts with all API endpoints returning mock data
