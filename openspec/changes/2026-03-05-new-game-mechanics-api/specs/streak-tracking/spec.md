## ADDED Requirements

### Requirement: Streak data endpoint
The system SHALL provide a GET /api/streak endpoint that returns the authenticated user's current streak, best streak, last played date, and milestone achievements.

#### Scenario: Active streak
- **WHEN** an authenticated user who has played 7 consecutive days sends `GET /api/streak`
- **THEN** the system returns:
  ```json
  {
    "currentStreak": 7,
    "bestStreak": 14,
    "lastPlayedDate": "2026-03-05",
    "milestones": { "7day": true, "30day": false, "100day": false }
  }
  ```

#### Scenario: Broken streak
- **WHEN** an authenticated user who last played 2 days ago sends `GET /api/streak`
- **THEN** `currentStreak` is 0 and `lastPlayedDate` reflects their last game date

### Requirement: Streak calculation from results
The system SHALL derive streak data from the `results` table by counting consecutive UTC dates with a winning result, walking backwards from today. No separate streaks table is needed.

#### Scenario: Streak includes only wins
- **WHEN** a user played Mon (win), Tue (DNF), Wed (win)
- **THEN** the current streak on Wednesday is 1 (DNF broke the streak)

#### Scenario: Streak requires consecutive days
- **WHEN** a user played Mon (win), skipped Tue, played Wed (win)
- **THEN** the current streak on Wednesday is 1 (skipped day broke the streak)

### Requirement: Best streak tracking
The system SHALL calculate the best streak as the maximum consecutive winning days the user has ever achieved.

#### Scenario: Best streak higher than current
- **WHEN** a user had a 14-day streak in the past but current streak is 3
- **THEN** `bestStreak` is 14 and `currentStreak` is 3

### Requirement: Milestone flags
The system SHALL return boolean milestone flags for 7-day, 30-day, and 100-day streaks. A milestone is true if the user's best streak has ever reached that threshold.

#### Scenario: 7-day milestone achieved
- **WHEN** a user's best streak is 8
- **THEN** `milestones.7day` is true, `milestones.30day` is false, `milestones.100day` is false

### Requirement: Anonymous streak response
The system SHALL return zeroed streak data for unauthenticated users. Anonymous streak tracking is handled client-side via localStorage.

#### Scenario: Anonymous user
- **WHEN** an unauthenticated user sends `GET /api/streak`
- **THEN** the system returns `{ "currentStreak": 0, "bestStreak": 0, "lastPlayedDate": null, "milestones": { "7day": false, "30day": false, "100day": false } }`

### Requirement: UTC date alignment
The system SHALL use UTC dates for streak calculation, matching the `dailyPuzzles.puzzleDate` date format.

#### Scenario: Date boundary
- **WHEN** a user plays at 11:59 PM UTC on March 4 and 12:01 AM UTC on March 5
- **THEN** these count as two consecutive days

### Requirement: Mock mode streak behavior
In mock mode, the streak endpoint SHALL return hardcoded streak data without database access.

#### Scenario: Mock streak
- **WHEN** `IS_MOCK` is true
- **THEN** the system returns `{ "currentStreak": 5, "bestStreak": 12, "lastPlayedDate": "<today>", "milestones": { "7day": true, "30day": false, "100day": false } }`
