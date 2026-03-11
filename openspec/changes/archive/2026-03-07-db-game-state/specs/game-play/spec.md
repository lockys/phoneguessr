## MODIFIED Requirements

### Requirement: Game state restoration on page load
The system SHALL restore game state on page load. For authenticated users, the system SHALL fetch state from the database via `/api/puzzle/state`. For anonymous users, the system SHALL read from localStorage (`phoneguessr_YYYY-MM-DD`). If the database fetch fails for an authenticated user, the system SHALL fall back to localStorage.

#### Scenario: Authenticated user reloads completed game
- **WHEN** an authenticated user reloads the page after completing today's puzzle
- **THEN** the system fetches game state from the database and displays the completed game with guesses, elapsed time, and result modal

#### Scenario: Authenticated user reloads mid-game
- **WHEN** an authenticated user reloads the page with in-progress guesses but no result
- **THEN** the system fetches guesses from the database and resumes in playing state with the timer running

#### Scenario: Authenticated user with no game data
- **WHEN** an authenticated user loads the page with no database records for today's puzzle
- **THEN** the system shows the ready state for a new game

#### Scenario: Anonymous user reloads completed game
- **WHEN** an anonymous user reloads the page after completing today's puzzle
- **THEN** the system reads game state from localStorage and displays the completed game

#### Scenario: Database fetch failure fallback
- **WHEN** the database fetch fails for an authenticated user
- **THEN** the system falls back to checking localStorage for saved state

### Requirement: Game result persistence
The system SHALL persist game results differently based on authentication state. Authenticated users SHALL have results saved to the database only. Anonymous users SHALL have results saved to localStorage only.

#### Scenario: Authenticated user completes game
- **WHEN** an authenticated user finishes a puzzle (win or loss)
- **THEN** the result is saved to the database via `POST /api/result` and NOT written to localStorage

#### Scenario: Anonymous user completes game
- **WHEN** an anonymous user finishes a puzzle (win or loss)
- **THEN** the result is saved to localStorage only

#### Scenario: Mock mode result persistence
- **WHEN** a user completes a puzzle in mock mode (regardless of auth state)
- **THEN** the result is saved to localStorage only
