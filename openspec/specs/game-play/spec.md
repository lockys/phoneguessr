## ADDED Requirements

### Requirement: Progressive image reveal
The system SHALL display a cropped region of the phone's stock photo initially. On each wrong guess, the visible region SHALL expand to reveal more of the phone image. The system SHALL use 6 progressive crop levels from tightest to full image.

#### Scenario: Initial crop on puzzle load
- **WHEN** a player loads the daily puzzle
- **THEN** the system displays the tightest crop (level 1 of 6) of the phone image

#### Scenario: Crop expands on wrong guess
- **WHEN** a player submits a wrong guess on crop level N (where N < 6)
- **THEN** the visible region expands to crop level N+1

#### Scenario: Full reveal on game end
- **WHEN** a player guesses correctly OR exhausts all 6 guesses
- **THEN** the system reveals the full uncropped phone image
- **AND** the result SHALL be displayed in a modal overlay instead of inline

### Requirement: Client-side crop masking
The system SHALL implement image cropping on the client side using CSS techniques (clip-path or object-position). The full image SHALL be loaded once and masked progressively.

#### Scenario: Single image load
- **WHEN** the puzzle loads
- **THEN** only one image file is fetched from the server, with CSS controlling the visible region

### Requirement: Autocomplete guess input
The system SHALL provide a text input with autocomplete suggestions drawn from the phone dataset. Players SHALL select a phone from the autocomplete list to submit a guess. The full list of phones in the dataset SHALL NOT be browsable - only matching results appear during typing.

#### Scenario: Typing triggers suggestions
- **WHEN** a player types 2 or more characters in the guess input
- **THEN** the system displays matching phones from the dataset (filtered by brand and model name)

#### Scenario: Submitting a guess
- **WHEN** a player selects a phone from the autocomplete suggestions
- **THEN** the guess is submitted and evaluated

#### Scenario: No free text submission
- **WHEN** a player types text that doesn't match any phone in the autocomplete list
- **THEN** the system SHALL NOT allow submission

### Requirement: Guess feedback
The system SHALL provide feedback on each guess with three possible outcomes:
- **Wrong brand**: The guessed phone's brand does not match the answer's brand
- **Right brand, wrong model**: The guessed phone's brand matches but the model does not
- **Correct**: The guessed phone exactly matches the answer

#### Scenario: Wrong brand feedback
- **WHEN** a player guesses a phone with a different brand than the answer
- **THEN** the system displays "Wrong brand" feedback with ❌ indicator

#### Scenario: Right brand wrong model feedback
- **WHEN** a player guesses a phone with the correct brand but wrong model
- **THEN** the system displays "Right brand, wrong model" feedback with 🟡 indicator

#### Scenario: Correct guess feedback
- **WHEN** a player guesses the exact correct phone
- **THEN** the system displays "Correct!" feedback with ✅ indicator

### Requirement: Six guess limit
The system SHALL allow a maximum of 6 guesses per daily puzzle. After 6 incorrect guesses, the game ends in a loss (DNF).

#### Scenario: Sixth wrong guess
- **WHEN** a player submits their 6th incorrect guess
- **THEN** the game ends, the answer is revealed, and the result is recorded as DNF

### Requirement: Timer
The system SHALL start a visible countdown timer when the puzzle loads. The timer SHALL stop when the player guesses correctly or exhausts all guesses.

#### Scenario: Timer starts on load
- **WHEN** the daily puzzle page finishes loading and the first crop is displayed
- **THEN** a visible timer begins counting up from 0

#### Scenario: Timer stops on correct guess
- **WHEN** a player submits a correct guess
- **THEN** the timer stops and the elapsed time is recorded

#### Scenario: Timer stops on DNF
- **WHEN** a player exhausts all 6 guesses
- **THEN** the timer stops (time is recorded but not used for ranking)

### Requirement: Single play per day
The system SHALL prevent a player from replaying the same daily puzzle. For authenticated users, this is enforced server-side. For anonymous users, this is enforced via localStorage.

#### Scenario: Authenticated user revisits
- **WHEN** an authenticated user who has completed today's puzzle loads the game
- **THEN** the system displays their result (guesses, time, outcome) instead of a playable puzzle

#### Scenario: Anonymous user revisits
- **WHEN** an anonymous user who has completed today's puzzle (per localStorage) loads the game
- **THEN** the system displays their result instead of a playable puzzle

### Requirement: Compact guess history display
The guess history rows SHALL use a compact layout to minimize vertical space usage, keeping the autocomplete input visible on small screens.

#### Scenario: Guess row dimensions
- **WHEN** guess history rows are rendered
- **THEN** each row SHALL use reduced padding (6px 10px) and font size (13px)
- **AND** empty placeholder rows SHALL have a minimum height of 30px

#### Scenario: Guess history fits above input
- **WHEN** the game is being played on a mobile screen
- **THEN** the guess history and autocomplete input SHALL both be visible without scrolling on typical mobile viewports (>600px height)

### Requirement: Remaining guesses indicator
The guess history SHALL visually indicate remaining guesses with a frosted glass treatment and a count label.

#### Scenario: Empty slots with frosted style
- **WHEN** the player has made fewer than 6 guesses
- **THEN** unfilled guess slots SHALL display with a frosted/blurred background effect

#### Scenario: Guess count label
- **WHEN** there are remaining guesses
- **THEN** the first empty slot SHALL display "N guesses left" where N is the number of remaining attempts

#### Scenario: All guesses used
- **WHEN** the player has used all 6 guesses
- **THEN** no empty slots or remaining count SHALL be displayed
