## ADDED Requirements

### Requirement: Wordle-style share text
The system SHALL generate a shareable text result after game completion using emoji indicators. The format SHALL be spoiler-free (no phone name revealed).

#### Scenario: Winning share text
- **WHEN** a player wins the puzzle on guess 4 with feedback ❌❌🟡✅
- **THEN** the system generates text:
  ```
  PhoneGuessr #<puzzle_number> 4/6

  ❌❌🟡✅

  phoneguessr.com
  ```

#### Scenario: DNF share text
- **WHEN** a player fails the puzzle with feedback ❌🟡❌❌🟡❌
- **THEN** the system generates text:
  ```
  PhoneGuessr #<puzzle_number> X/6

  ❌🟡❌❌🟡❌

  phoneguessr.com
  ```

### Requirement: Copy to clipboard
The system SHALL provide a "Share" button that copies the share text to the clipboard.

#### Scenario: Clicking share button
- **WHEN** a player clicks the "Share" button after completing a puzzle
- **THEN** the share text is copied to the clipboard and a "Copied!" confirmation is shown

### Requirement: Share available after completion only
The system SHALL display the share button only after the puzzle is completed (win or DNF).

#### Scenario: Mid-game share attempt
- **WHEN** a player has not yet completed the puzzle
- **THEN** no share button is visible
