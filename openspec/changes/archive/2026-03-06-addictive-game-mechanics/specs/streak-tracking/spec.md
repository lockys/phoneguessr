## ADDED Requirements

### Requirement: Streak counter
The system SHALL track consecutive days a player wins the daily puzzle. A streak increments by 1 each day the player wins. A streak resets to 0 if the player misses a day or gets a DNF.

#### Scenario: Streak increment on win
- **WHEN** a player wins today's puzzle and won yesterday's puzzle
- **THEN** the streak counter increments by 1

#### Scenario: Streak reset on miss
- **WHEN** a player wins today's puzzle but did not play yesterday
- **THEN** the streak resets to 1 (today's win starts a new streak)

#### Scenario: Streak reset on DNF
- **WHEN** a player fails today's puzzle (DNF)
- **THEN** the streak resets to 0

#### Scenario: First-time player
- **WHEN** a player wins their first puzzle
- **THEN** the streak is set to 1

### Requirement: Best streak tracking
The system SHALL track the player's all-time best streak alongside the current streak.

#### Scenario: New best streak
- **WHEN** a player's current streak exceeds their previous best streak
- **THEN** the best streak value is updated to match the current streak

#### Scenario: Best streak preserved on reset
- **WHEN** a player's streak resets from 15 to 0 and their best is 15
- **THEN** the best streak remains 15

### Requirement: Streak milestones
The system SHALL recognize streak milestones at 7 days, 30 days, and 100 days. Each milestone SHALL be tracked as achieved permanently (not lost when streak breaks).

#### Scenario: 7-day milestone
- **WHEN** a player's current streak reaches 7
- **THEN** the 7-day milestone is marked as achieved and a milestone notification is shown

#### Scenario: 30-day milestone
- **WHEN** a player's current streak reaches 30
- **THEN** the 30-day milestone is marked as achieved

#### Scenario: Milestone persistence after break
- **WHEN** a player has achieved the 7-day milestone and their streak later resets to 0
- **THEN** the 7-day milestone remains achieved

### Requirement: Streak display in game header
The system SHALL display the current streak count in the game header area with a flame icon during gameplay.

#### Scenario: Active streak display
- **WHEN** a player has a current streak of 5
- **THEN** the header shows a flame icon with "5" next to it

#### Scenario: No streak display
- **WHEN** a player has a streak of 0
- **THEN** no streak indicator is shown in the header

### Requirement: Streak section in profile
The system SHALL display detailed streak information in the Profile panel, including current streak, best streak, and achieved milestones.

#### Scenario: Profile streak details
- **WHEN** a player views their profile with current streak 12 and best streak 25
- **THEN** the profile shows "Current: 12 days" and "Best: 25 days"

#### Scenario: Milestone badges in profile
- **WHEN** a player has achieved the 7-day and 30-day milestones
- **THEN** the profile displays both milestone badges as unlocked and the 100-day badge as locked

### Requirement: Streak break notification
The system SHALL notify a player when their streak has been broken since their last visit.

#### Scenario: Streak break on return
- **WHEN** a player with a streak of 10 returns after missing a day
- **THEN** the system displays a notification: "Your 10-day streak ended. Start a new one today!"

### Requirement: Streak API endpoint
The system SHALL provide a GET /api/streak endpoint that returns the player's streak data.

#### Scenario: Authenticated streak request
- **WHEN** an authenticated player requests GET /api/streak
- **THEN** the response includes { currentStreak, bestStreak, lastPlayedDate, milestones: { day7: bool, day30: bool, day100: bool } }

#### Scenario: Anonymous streak
- **WHEN** an unauthenticated player requests streak data
- **THEN** streak data SHALL be read from localStorage

#### Scenario: Mock mode streak
- **WHEN** IS_MOCK is true
- **THEN** the system returns mock streak data { currentStreak: 5, bestStreak: 12, milestones: { day7: true, day30: false, day100: false } }

### Requirement: Streak update on result submission
The system SHALL update the player's streak when a game result is submitted via POST /api/result.

#### Scenario: Win updates streak
- **WHEN** a player submits a winning result
- **THEN** the streak is recalculated based on the player's last played date and updated in the database

#### Scenario: DNF resets streak
- **WHEN** a player submits a DNF result
- **THEN** the current streak is set to 0 (best streak is preserved)
