## ADDED Requirements

### Requirement: Hint button row
The system SHALL display a row of hint buttons below the autocomplete input during gameplay. The row SHALL contain three buttons: "Brand", "Year", "Price Tier".

#### Scenario: Hint buttons during gameplay
- **WHEN** the game is in "playing" state and the player has hints remaining
- **THEN** three hint buttons are displayed below the autocomplete input

#### Scenario: Used hint button state
- **WHEN** a player has used the Brand hint
- **THEN** the Brand button shows the revealed value (e.g., "Brand: Samsung") in a disabled state
- **AND** the other hint buttons remain active

#### Scenario: All hints used
- **WHEN** a player has used 2 hints
- **THEN** all hint buttons are disabled and a "2/2 hints used" label is shown

### Requirement: Proximity badges in guess history
The guess history rows SHALL display proximity badges for wrong guesses that share metadata with the answer.

#### Scenario: Guess row with proximity
- **WHEN** a wrong guess shares the answer's release year and price tier
- **THEN** the guess row displays "Same Year" and "Same Tier" pill badges below the phone name

#### Scenario: Guess row without proximity
- **WHEN** a wrong guess shares no metadata with the answer
- **THEN** the guess row displays only the standard feedback indicator (wrong_brand or right_brand)

### Requirement: Difficulty badge display
The system SHALL display the current puzzle's difficulty tier as a colored badge in the game area.

#### Scenario: Difficulty badge position
- **WHEN** the daily puzzle loads
- **THEN** a difficulty badge (🟢 Easy / 🟡 Medium / 🔴 Hard) is displayed near the puzzle number

### Requirement: Streak counter in game header
The system SHALL display the player's current streak in the game header area.

#### Scenario: Streak visible during play
- **WHEN** the player has an active streak of 5 or more
- **THEN** a flame icon with the streak number is shown in the game header

#### Scenario: Streak hidden for new players
- **WHEN** the player has no streak (0 or first game)
- **THEN** no streak indicator is shown in the header
