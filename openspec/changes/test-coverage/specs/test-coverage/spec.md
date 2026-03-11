## ADDED Requirements

### Requirement: Game.tsx unit tests
The project SHALL include unit tests for the Game component covering all state transitions, fetch orchestration, guess submission, and state restoration from both localStorage and database.

#### Scenario: Initial loading state
- **WHEN** Game renders before API responses arrive
- **THEN** it displays the loading indicator

#### Scenario: Ready state for new game
- **WHEN** puzzle and phone data load and no saved state exists
- **THEN** Game transitions to the "ready" state with a Start button visible

#### Scenario: Start game
- **WHEN** the user clicks the Start button
- **THEN** Game transitions to "playing" state, the timer starts, and the autocomplete input appears

#### Scenario: Submit a correct guess
- **WHEN** the user submits a guess and the API returns "correct" feedback
- **THEN** Game transitions to "won" state, the timer stops, and the result is saved

#### Scenario: Exhaust all guesses
- **WHEN** the user submits 6 wrong guesses
- **THEN** Game transitions to "lost" state, the timer stops, and the result is saved

#### Scenario: Restore completed game from localStorage
- **WHEN** Game loads and localStorage contains a completed game for today's puzzle date
- **THEN** Game restores the guesses and elapsed time, sets the correct win/loss state, and shows the result modal

#### Scenario: Restore game from database for authenticated user
- **WHEN** Game loads with an authenticated user and `/api/puzzle/state` returns game data
- **THEN** Game restores from the database response instead of localStorage

#### Scenario: Database fetch failure falls back to localStorage
- **WHEN** Game loads with an authenticated user but `/api/puzzle/state` fails
- **THEN** Game falls back to checking localStorage

#### Scenario: Show onboarding for first-time users
- **WHEN** Game loads in "ready" state and the user has not been onboarded
- **THEN** the Onboarding overlay is displayed

### Requirement: API endpoint unit tests
The project SHALL include unit tests for all API endpoint handlers, testing business logic with mocked database and auth dependencies.

#### Scenario: GET /api/puzzle/today returns puzzle data
- **WHEN** the puzzle today handler is called
- **THEN** it returns puzzleId, puzzleNumber, puzzleDate, and imageUrl

#### Scenario: GET /api/puzzle/image returns base64 image
- **WHEN** the puzzle image handler is called and the image file exists
- **THEN** it returns a base64-encoded image data string with the correct MIME type

#### Scenario: GET /api/puzzle/image returns 404 for missing image
- **WHEN** the puzzle image handler is called and the image file does not exist
- **THEN** it returns HTTP 404

#### Scenario: GET /api/puzzle/yesterday returns previous puzzle
- **WHEN** the puzzle yesterday handler is called and yesterday's puzzle exists
- **THEN** it returns phone details and aggregate stats

#### Scenario: GET /api/puzzle/state requires authentication
- **WHEN** an unauthenticated request is made to /api/puzzle/state
- **THEN** it returns HTTP 401

#### Scenario: GET /api/puzzle/state returns completed game
- **WHEN** an authenticated user has guesses and a result for today's puzzle
- **THEN** it returns guesses with phoneName and feedback, elapsed time, and won status

#### Scenario: GET /api/puzzle/state returns in-progress game
- **WHEN** an authenticated user has guesses but no result for today's puzzle
- **THEN** it returns guesses without elapsed or won fields

#### Scenario: POST /api/guess returns correct feedback
- **WHEN** the guessed phone matches the answer phone
- **THEN** the handler returns feedback "correct"

#### Scenario: POST /api/guess returns right_brand feedback
- **WHEN** the guessed phone has the same brand but different model as the answer
- **THEN** the handler returns feedback "right_brand"

#### Scenario: POST /api/guess returns wrong_brand feedback
- **WHEN** the guessed phone has a different brand than the answer
- **THEN** the handler returns feedback "wrong_brand"

#### Scenario: POST /api/guess saves guess for authenticated user
- **WHEN** an authenticated user submits a guess
- **THEN** the handler inserts a record into the guesses table

#### Scenario: POST /api/guess returns 404 for invalid puzzle
- **WHEN** a guess references a non-existent puzzleId
- **THEN** the handler returns HTTP 404

#### Scenario: POST /api/result requires authentication
- **WHEN** an unauthenticated request submits a result
- **THEN** the handler returns HTTP 401

#### Scenario: POST /api/result prevents duplicate submissions
- **WHEN** an authenticated user submits a result for a puzzle they already submitted
- **THEN** the handler returns HTTP 409

#### Scenario: POST /api/result calculates score correctly
- **WHEN** an authenticated user submits a winning result
- **THEN** the handler calculates score as elapsedSeconds + (guessCount - 1) * 10

#### Scenario: GET /api/phones returns active phones
- **WHEN** the phones handler is called
- **THEN** it returns all active phones with id, brand, and model fields

#### Scenario: GET /api/leaderboard/daily returns ranked entries
- **WHEN** the daily leaderboard is requested
- **THEN** it returns winning entries ranked by score ascending

#### Scenario: GET /api/leaderboard with invalid period returns 400
- **WHEN** the leaderboard is requested with an invalid period parameter
- **THEN** it returns HTTP 400

#### Scenario: GET /api/profile/stats requires authentication
- **WHEN** an unauthenticated request fetches profile stats
- **THEN** it returns HTTP 401

#### Scenario: GET /api/profile/stats returns player statistics
- **WHEN** an authenticated user requests profile stats
- **THEN** it returns gamesPlayed, wins, winRate, currentStreak, and bestStreak

#### Scenario: POST /api/profile/update validates display name
- **WHEN** a display name with HTML characters is submitted
- **THEN** the handler returns HTTP 400 with a validation error

#### Scenario: POST /api/hint requires authentication
- **WHEN** an unauthenticated request submits a hint request
- **THEN** the handler returns HTTP 401

#### Scenario: POST /api/hint returns hint data
- **WHEN** an authenticated user requests a valid hint type
- **THEN** the handler returns the hint value, penalty, and hints remaining

#### Scenario: POST /api/hint enforces max hints per puzzle
- **WHEN** an authenticated user has already used 2 hints for the puzzle
- **THEN** the handler returns HTTP 409 with "max_hints_reached"

### Requirement: Auth utility unit tests
The project SHALL include unit tests for session token creation, verification, and cookie handling.

#### Scenario: Create and verify session token
- **WHEN** a session token is created with valid session data
- **THEN** verifying the token returns the same session data

#### Scenario: Reject tampered session token
- **WHEN** a session token is modified after creation
- **THEN** verification returns null

#### Scenario: Reject expired session token
- **WHEN** a session token has expired
- **THEN** verification returns null

#### Scenario: Session cookie options are correct
- **WHEN** getSessionCookieOptions is called
- **THEN** it returns httpOnly: true, sameSite: "Lax", path: "/", and maxAge for 30 days

#### Scenario: Cookie parsing handles multiple cookies
- **WHEN** a cookie header contains multiple name=value pairs
- **THEN** parseCookies returns all pairs correctly decoded

#### Scenario: Cookie serialization includes all options
- **WHEN** serializeCookie is called with httpOnly, secure, sameSite, path, and maxAge
- **THEN** the output string includes all option directives

### Requirement: Auth endpoint unit tests
The project SHALL include unit tests for the auth endpoints (login, callback, logout, me).

#### Scenario: GET /api/auth/login redirects to Google OAuth
- **WHEN** the login handler is called
- **THEN** it returns HTTP 302 with a Location header pointing to Google's OAuth authorization URL

#### Scenario: GET /api/auth/callback exchanges code for token
- **WHEN** the callback handler receives a valid authorization code
- **THEN** it exchanges the code with Google, upserts the user, sets a session cookie, and redirects to /

#### Scenario: GET /api/auth/callback handles missing code
- **WHEN** the callback handler is called without a code parameter
- **THEN** it redirects to /?error=no_code

#### Scenario: GET /api/auth/logout clears session cookie
- **WHEN** the logout handler is called
- **THEN** it sets the session cookie with maxAge=0 and redirects to /

#### Scenario: GET /api/auth/me returns user for valid session
- **WHEN** a request with a valid session cookie calls /api/auth/me
- **THEN** it returns the user object with id, displayName, avatarUrl, and email

#### Scenario: GET /api/auth/me returns null for no session
- **WHEN** a request without a session cookie calls /api/auth/me
- **THEN** it returns { user: null }

### Requirement: High-value component tests
The project SHALL include unit tests for ResultModal, PhoneAutocomplete, AuthButton, and Leaderboard components.

#### Scenario: ResultModal displays win state
- **WHEN** ResultModal renders with won=true
- **THEN** it shows the win title, guess count, score, elapsed time, and share button

#### Scenario: ResultModal displays loss state
- **WHEN** ResultModal renders with won=false
- **THEN** it shows the loss title, "X/6" for guesses, no score, and share button

#### Scenario: ResultModal share button copies text
- **WHEN** the user clicks the share button
- **THEN** generateShareText is called and the result is copied to clipboard

#### Scenario: ResultModal shows sign-in prompt for anonymous users
- **WHEN** ResultModal renders without an authenticated user
- **THEN** it shows a sign-in prompt with a login button

#### Scenario: PhoneAutocomplete filters phone list
- **WHEN** the user types 2+ characters in the input
- **THEN** the dropdown shows phones matching the query

#### Scenario: PhoneAutocomplete keyboard navigation
- **WHEN** the user presses ArrowDown, ArrowUp, and Enter
- **THEN** the selection moves through the dropdown and Enter selects the highlighted item

#### Scenario: AuthButton shows sign-in when logged out
- **WHEN** AuthButton renders with no authenticated user
- **THEN** it shows a sign-in button

#### Scenario: AuthButton shows user info when logged in
- **WHEN** AuthButton renders with an authenticated user
- **THEN** it shows the user's avatar, display name, and a sign-out button

#### Scenario: AuthButton displays auth error from URL
- **WHEN** AuthButton renders and the URL contains an error query parameter
- **THEN** it shows an error message that auto-dismisses after 5 seconds

#### Scenario: Leaderboard fetches and displays daily entries
- **WHEN** Leaderboard renders with the daily tab active
- **THEN** it fetches /api/leaderboard/daily and displays ranked entries

#### Scenario: Leaderboard switches tabs
- **WHEN** the user clicks the weekly tab
- **THEN** it fetches /api/leaderboard/weekly and updates the display
