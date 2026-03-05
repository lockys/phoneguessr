## MODIFIED Requirements

### Requirement: Wordle-style share text
The system SHALL generate a shareable text result after game completion using emoji indicators. The format SHALL be spoiler-free (no phone name revealed).

#### Scenario: Winning share text
- **WHEN** a player wins the puzzle on guess 4 with feedback wrong_brand, wrong_brand, right_brand, correct on a Medium difficulty puzzle with 1 hint used and a 5-day streak
- **THEN** the system generates text:
  ```
  PhoneGuessr #<puzzle_number> 4/6 🟡 Medium
  🔥5

  🟥🟥🟨🟩
  💡×1 | ⏱️ 45.0s

  phoneguessr.com
  ```

#### Scenario: DNF share text
- **WHEN** a player fails the puzzle with feedback wrong_brand, right_brand, wrong_brand, wrong_brand, right_brand, wrong_brand on an Easy puzzle with 0 hints
- **THEN** the system generates text:
  ```
  PhoneGuessr #<puzzle_number> X/6 🟢 Easy

  🟥🟨🟥🟥🟨🟥

  phoneguessr.com
  ```

#### Scenario: Share with no streak
- **WHEN** a player has a streak of 0 or 1
- **THEN** the streak line (🔥N) is omitted from the share text

#### Scenario: Share with no hints
- **WHEN** a player used 0 hints
- **THEN** the hint indicator (💡×N) is omitted from the footer line

## ADDED Requirements

### Requirement: Emoji grid uses colored squares
The share text SHALL use colored square emojis for the guess grid: 🟥 for wrong_brand, 🟨 for right_brand, 🟩 for correct.

#### Scenario: Square emoji rendering
- **WHEN** the share text is generated
- **THEN** guess feedback uses square emojis (🟥🟨🟩) not icon emojis (❌🟡✅)

### Requirement: Difficulty indicator in share
The share text SHALL include the puzzle's difficulty tier with a color-coded circle emoji.

#### Scenario: Easy difficulty indicator
- **WHEN** the puzzle difficulty is Easy
- **THEN** the share text header includes "🟢 Easy"

#### Scenario: Medium difficulty indicator
- **WHEN** the puzzle difficulty is Medium
- **THEN** the share text header includes "🟡 Medium"

#### Scenario: Hard difficulty indicator
- **WHEN** the puzzle difficulty is Hard
- **THEN** the share text header includes "🔴 Hard"

### Requirement: Streak in share
The share text SHALL include the player's current streak if it is 2 or greater.

#### Scenario: Streak displayed
- **WHEN** a player with a 15-day streak shares their result
- **THEN** the share text includes "🔥15" on its own line below the header

### Requirement: Time and hints footer
The share text SHALL include a footer line with elapsed time and hint count (if any).

#### Scenario: Footer with time and hints
- **WHEN** a player finishes in 32.5 seconds using 2 hints
- **THEN** the footer line reads "💡×2 | ⏱️ 32.5s"

#### Scenario: Footer with time only
- **WHEN** a player finishes in 18.0 seconds using 0 hints
- **THEN** the footer line reads "⏱️ 18.0s"
