## ADDED Requirements

### Requirement: Guess history is scrollable on mobile
The guess history area SHALL be constrained to a maximum height on mobile viewports and SHALL scroll vertically when content exceeds the available space.

#### Scenario: Guess history with many guesses
- **WHEN** the user has submitted 4+ guesses on a mobile device
- **THEN** the guess history area scrolls vertically and does not push the autocomplete input off-screen

### Requirement: Only actual guesses are rendered
The guess history SHALL only render rows for submitted guesses plus a remaining-count indicator. Empty placeholder rows SHALL NOT be rendered.

#### Scenario: Game start with zero guesses
- **WHEN** the game starts and no guesses have been submitted
- **THEN** only a remaining-count indicator is shown (no empty placeholder rows)

#### Scenario: After submitting guesses
- **WHEN** the user has submitted 3 guesses
- **THEN** 3 guess rows and a remaining-count indicator are displayed

### Requirement: Auto-scroll to latest guess
The guess history SHALL automatically scroll to show the most recently added guess.

#### Scenario: New guess added while scrolled up
- **WHEN** the user submits a new guess
- **THEN** the guess history scrolls to reveal the new entry

### Requirement: Autocomplete input stays visible on mobile
The phone autocomplete input SHALL remain visible when the mobile keyboard is open.

#### Scenario: Keyboard opens on mobile
- **WHEN** the user taps the autocomplete input on a mobile device and the keyboard appears
- **THEN** the input remains visible above the keyboard
