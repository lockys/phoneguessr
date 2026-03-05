## ADDED Requirements

### Requirement: Proximity signals on wrong guesses
The system SHALL display proximity badges on wrong guesses that indicate how close the guessed phone is to the answer along multiple dimensions. Proximity signals supplement the existing wrong_brand/right_brand feedback.

#### Scenario: Same release year
- **WHEN** a player guesses a phone from the same release year as the answer
- **THEN** a "Same Year" badge is shown on that guess row

#### Scenario: Same price tier
- **WHEN** a player guesses a phone from the same price tier as the answer (budget/mid-range/flagship)
- **THEN** a "Same Tier" badge is shown on that guess row

#### Scenario: Same form factor
- **WHEN** a player guesses a phone with the same form factor as the answer (bar/flip/fold)
- **THEN** a "Same Style" badge is shown on that guess row

#### Scenario: No proximity match
- **WHEN** a player guesses a phone that shares no metadata with the answer
- **THEN** no proximity badges are shown (only the standard wrong_brand/right_brand feedback)

#### Scenario: Multiple proximity matches
- **WHEN** a player guesses a phone that matches the answer's year and price tier but not form factor
- **THEN** both "Same Year" and "Same Tier" badges are shown

### Requirement: Proximity only on wrong guesses
Proximity badges SHALL only appear on wrong_brand and right_brand guesses. Correct guesses do not need proximity information.

#### Scenario: Correct guess has no proximity
- **WHEN** a player guesses correctly
- **THEN** no proximity badges are shown (the "Correct!" indicator is sufficient)

### Requirement: Proximity graceful degradation
The system SHALL not show proximity badges for metadata dimensions that are missing from either the guessed phone or the answer phone.

#### Scenario: Missing release year
- **WHEN** the answer phone has no releaseYear metadata
- **THEN** the "Same Year" badge is never shown for any guess in that puzzle

#### Scenario: Missing price tier on guess
- **WHEN** the guessed phone has no priceTier metadata
- **THEN** no "Same Tier" badge is shown for that guess row

### Requirement: Proximity in API response
The POST /api/guess endpoint SHALL include proximity data in its response alongside the existing feedback field.

#### Scenario: Guess response with proximity
- **WHEN** a player submits a wrong guess and the guessed phone shares the answer's release year
- **THEN** the API response includes { feedback: "wrong_brand", proximity: { sameYear: true, sameTier: false, sameFormFactor: false } }

#### Scenario: Guess response without metadata
- **WHEN** phone metadata is unavailable for proximity calculation
- **THEN** the API response includes { feedback: "wrong_brand", proximity: { sameYear: null, sameTier: null, sameFormFactor: null } }

### Requirement: Proximity badge styling
Proximity badges SHALL use a compact pill-shaped design that does not increase the guess row height significantly.

#### Scenario: Badge appearance
- **WHEN** a guess row has proximity badges
- **THEN** badges appear as small pills (e.g., "📅 Same Year") in a subtle color below the phone name
- **AND** the guess row height increases by at most 20px
