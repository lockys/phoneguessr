## MODIFIED Requirements

### Requirement: Difficulty field in puzzle response
The GET /api/puzzle/today endpoint SHALL include a `difficulty` field indicating the day's puzzle difficulty tier.

#### Scenario: Easy puzzle day
- **WHEN** a user requests today's puzzle on a Monday
- **THEN** the response includes `"difficulty": "easy"` alongside existing fields

#### Scenario: Hard puzzle day
- **WHEN** a user requests today's puzzle on a Wednesday
- **THEN** the response includes `"difficulty": "hard"`

### Requirement: Difficulty values
The `difficulty` field SHALL be one of three string values: `"easy"`, `"medium"`, or `"hard"`.

### Requirement: Daily difficulty rotation
The system SHALL rotate difficulty by day of the week (UTC):
- Monday, Thursday: easy (flagship phones everyone recognizes)
- Tuesday, Friday: medium (mid-range and less common phones)
- Wednesday, Saturday: hard (obscure, regional, or niche phones)
- Sunday: random (any difficulty)

#### Scenario: Sunday random difficulty
- **WHEN** the puzzle is generated for a Sunday
- **THEN** the difficulty is randomly selected from easy/medium/hard

### Requirement: Phone difficulty column
The `phones` table SHALL include a `difficulty` column (varchar, nullable) with values: `"easy"`, `"medium"`, `"hard"`. Puzzle selection filters by the day's required difficulty.

#### Scenario: Puzzle selection filters by difficulty
- **WHEN** the system selects a phone for a Monday puzzle
- **THEN** only phones with `difficulty = 'easy'` are eligible

#### Scenario: Null difficulty treated as medium
- **WHEN** a phone has no difficulty assigned (`null`)
- **THEN** it is treated as `"medium"` for selection purposes

### Requirement: Mock mode difficulty
In mock mode, the system SHALL derive the difficulty from the day of the week and include it in the puzzle response.

#### Scenario: Mock puzzle with difficulty
- **WHEN** `IS_MOCK` is true
- **THEN** the mock puzzle response includes a `difficulty` field based on the current day of the week
