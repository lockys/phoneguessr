## ADDED Requirements

### Requirement: Horizontal swipeable panel container
The app SHALL render a horizontal scroll-snap container with two full-width panels: "Game" (default/first) and "Leaderboard" (second). Users SHALL be able to swipe left/right to navigate between panels.

#### Scenario: Default panel on load
- **WHEN** the app loads
- **THEN** the Game panel SHALL be visible as the active panel
- **AND** the Leaderboard panel SHALL be off-screen to the right

#### Scenario: Swipe to leaderboard
- **WHEN** the user swipes left on the Game panel
- **THEN** the view SHALL snap to the Leaderboard panel

#### Scenario: Swipe back to game
- **WHEN** the user swipes right on the Leaderboard panel
- **THEN** the view SHALL snap back to the Game panel

#### Scenario: Panel snap behavior
- **WHEN** the user releases a swipe gesture
- **THEN** the container SHALL snap to the nearest panel boundary using CSS scroll-snap

### Requirement: Page indicator toast on panel change
The app SHALL display a translucent indicator showing the current page name when the user switches panels.

#### Scenario: Indicator appears on swipe
- **WHEN** the user swipes to a different panel
- **THEN** a translucent toast SHALL appear showing the panel name (e.g., "Game" or "Leaderboard")
- **AND** the toast SHALL be centered on screen

#### Scenario: Indicator auto-dismisses
- **WHEN** the page indicator toast appears
- **THEN** it SHALL fade out automatically after approximately 1.5 seconds

#### Scenario: No indicator on initial load
- **WHEN** the app first loads on the Game panel
- **THEN** no page indicator SHALL be shown

### Requirement: Game state preservation across swipes
The game panel SHALL preserve all game state (guesses, timer, image zoom level) when the user swipes away and back.

#### Scenario: Swipe away and back during gameplay
- **WHEN** the user swipes to leaderboard and back during an active game
- **THEN** all game state (guesses made, timer position, image zoom) SHALL be exactly as before
