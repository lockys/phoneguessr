## ADDED Requirements

### Requirement: Three difficulty levels
The system SHALL classify each phone in the catalog into one of three difficulty tiers: Easy, Medium, or Hard.

#### Scenario: Easy phones
- **WHEN** a phone is classified as Easy
- **THEN** it is a well-known flagship device from a major brand (e.g., iPhone 16 Pro, Galaxy S25 Ultra)

#### Scenario: Medium phones
- **WHEN** a phone is classified as Medium
- **THEN** it is a mid-range or less-promoted device from a known brand (e.g., Galaxy A55, Pixel 8a)

#### Scenario: Hard phones
- **WHEN** a phone is classified as Hard
- **THEN** it is an obscure, regional, or niche device (e.g., Nothing Phone 2a, ASUS ROG Phone 8)

### Requirement: Difficulty distribution
The phone catalog SHALL maintain a roughly balanced distribution across difficulty tiers: approximately 40% Easy, 35% Medium, 25% Hard.

#### Scenario: Catalog balance check
- **WHEN** the phone catalog is audited
- **THEN** no single difficulty tier represents more than 50% or less than 20% of active phones

### Requirement: Daily puzzle difficulty rotation
The daily puzzle system SHALL rotate through difficulty tiers to provide variety. The rotation SHALL NOT follow a strict repeating pattern to avoid predictability.

#### Scenario: Weekly variety
- **WHEN** a player looks at the last 7 daily puzzles
- **THEN** at least 2 different difficulty levels have appeared

#### Scenario: No consecutive hard puzzles
- **WHEN** a Hard puzzle appears on day N
- **THEN** day N+1 SHALL NOT also be a Hard puzzle

### Requirement: Difficulty indicator
The system SHALL display the current puzzle's difficulty tier to the player before and during gameplay.

#### Scenario: Difficulty badge on puzzle
- **WHEN** a player loads today's puzzle
- **THEN** a difficulty badge (Easy/Medium/Hard) is shown near the puzzle image area

#### Scenario: Difficulty in result modal
- **WHEN** a player completes the puzzle
- **THEN** the result modal includes the difficulty tier

### Requirement: Difficulty in share card
The share card SHALL include the puzzle's difficulty tier so recipients can contextualize the result.

#### Scenario: Share text with difficulty
- **WHEN** a player shares a Hard puzzle result
- **THEN** the share text includes a difficulty indicator (e.g., "🔴 Hard")

### Requirement: Difficulty-based phone selection
The daily puzzle assignment system SHALL select phones from a specific difficulty tier based on the rotation schedule, not purely random.

#### Scenario: Easy day selection
- **WHEN** the rotation schedule indicates an Easy day
- **THEN** the daily puzzle phone SHALL be selected from the Easy tier pool
