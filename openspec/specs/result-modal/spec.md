## ADDED Requirements

### Requirement: Game result modal overlay
When the game ends (win or loss), the system SHALL display a modal overlay with the game result, replacing the inline game-over section.

#### Scenario: Modal appears on win
- **WHEN** the player guesses correctly and the reveal animation completes
- **THEN** a centered modal overlay SHALL appear with the win result
- **AND** the modal SHALL include: win title, guess count, elapsed time, and share button

#### Scenario: Modal appears on loss
- **WHEN** the player exhausts all 6 guesses and the reveal animation completes
- **THEN** a centered modal overlay SHALL appear with the loss result
- **AND** the modal SHALL include: loss title, DNF status, and the correct answer

#### Scenario: Modal has backdrop
- **WHEN** the result modal is displayed
- **THEN** a semi-transparent backdrop SHALL appear behind the modal
- **AND** the backdrop SHALL blur the background content

### Requirement: Modal dismissal
The result modal SHALL be dismissable by the user.

#### Scenario: Dismiss by backdrop tap
- **WHEN** the user taps the backdrop area outside the modal
- **THEN** the modal SHALL close

#### Scenario: Dismiss by close button
- **WHEN** the user taps the close button on the modal
- **THEN** the modal SHALL close

#### Scenario: Game state after dismissal
- **WHEN** the result modal is dismissed
- **THEN** the game panel SHALL show the fully revealed image and completed guess history
- **AND** the user SHALL be able to swipe to the leaderboard

### Requirement: Auth prompt in modal
If the user is not authenticated, the result modal SHALL include a prompt to sign in to save their score.

#### Scenario: Anonymous user sees auth prompt
- **WHEN** an anonymous user completes a game and the result modal appears
- **THEN** the modal SHALL include a sign-in prompt below the stats

#### Scenario: Authenticated user has no auth prompt
- **WHEN** an authenticated user completes a game and the result modal appears
- **THEN** no auth prompt SHALL be shown in the modal
