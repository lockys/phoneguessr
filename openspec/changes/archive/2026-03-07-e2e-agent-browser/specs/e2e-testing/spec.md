## ADDED Requirements

### Requirement: E2E test infrastructure
The project SHALL include an `e2e/` directory with shell-based test scripts using `agent-browser` CLI. A runner script (`e2e/run.sh`) SHALL start the mock dev server, execute all tests, and report pass/fail results.

#### Scenario: Run full E2E suite
- **WHEN** `npm run test:e2e` is executed
- **THEN** mock dev server starts, all test scripts run, results are reported, server is stopped, and exit code reflects pass/fail

### Requirement: Gameplay E2E test
The test SHALL cover the core gameplay loop from the game-play, scoring, and reveal-animation specs: load puzzle, start game, submit guesses with autocomplete, receive feedback, and complete the game.

#### Scenario: Complete game with correct guess
- **WHEN** the gameplay test runs against mock mode
- **THEN** it loads the puzzle, clicks Start, types a phone name, selects from autocomplete, verifies guess feedback appears, and verifies game completion

#### Scenario: Exhaust all guesses
- **WHEN** the gameplay test submits 6 wrong guesses
- **THEN** the game ends with a loss state and the result modal appears

### Requirement: Navigation E2E test
The test SHALL verify swipe panel navigation from the swipe-navigation and swipe-hints specs.

#### Scenario: Navigate between panels
- **WHEN** the navigation test runs
- **THEN** it verifies the Game panel loads by default, navigates to Leaderboard panel, and returns to Game panel

### Requirement: Leaderboard E2E test
The test SHALL verify the leaderboard panel displays entries from the leaderboard spec.

#### Scenario: View daily leaderboard
- **WHEN** the leaderboard test navigates to the leaderboard panel
- **THEN** it verifies leaderboard entries are displayed with rank, name, and score

### Requirement: I18n E2E test
The test SHALL verify language switching from the i18n-framework and language-selector specs.

#### Scenario: Switch language
- **WHEN** the i18n test changes the language setting
- **THEN** all visible UI text updates to the selected language

### Requirement: Share E2E test
The test SHALL verify the share card generation from the share-card spec after completing a game.

#### Scenario: Generate share text after win
- **WHEN** the share test completes a game and clicks the share button
- **THEN** the share text is generated in the expected format
