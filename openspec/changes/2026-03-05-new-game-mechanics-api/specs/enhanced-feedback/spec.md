## MODIFIED Requirements

### Requirement: Enhanced guess feedback with attribute details
The POST /api/guess endpoint SHALL return additional `details` comparing the guessed phone's attributes to the answer phone's attributes when the guess is incorrect.

#### Scenario: Wrong brand with attribute comparison
- **WHEN** a player guesses a phone with the wrong brand
- **THEN** the response includes:
  ```json
  {
    "feedback": "wrong_brand",
    "details": {
      "sameYear": true,
      "samePriceTier": false,
      "sameFormFactor": true
    }
  }
  ```

#### Scenario: Right brand with attribute comparison
- **WHEN** a player guesses the correct brand but wrong model
- **THEN** the response includes:
  ```json
  {
    "feedback": "right_brand",
    "details": {
      "sameYear": false,
      "samePriceTier": true,
      "sameFormFactor": true
    }
  }
  ```

#### Scenario: Correct guess omits details
- **WHEN** a player guesses the correct phone
- **THEN** the response is `{ "feedback": "correct" }` with no `details` field

### Requirement: Attribute comparison logic
The system SHALL compare three phone attributes:
- `sameYear`: true if both phones share the same `releaseYear`
- `samePriceTier`: true if both phones share the same `priceTier` (budget/mid/flagship)
- `sameFormFactor`: true if both phones share the same `formFactor` (bar/flip/fold)

#### Scenario: Null metadata handling
- **WHEN** either phone is missing a metadata field (e.g., `releaseYear` is null)
- **THEN** the corresponding detail field is `false` (unknown = not matching)

### Requirement: Backward compatibility
The `details` field SHALL be additive. Existing clients that only read `feedback` SHALL continue to work without modification.

### Requirement: Mock mode enhanced feedback
In mock mode, the system SHALL compute `details` from `MOCK_PHONES` metadata fields.

#### Scenario: Mock feedback with details
- **WHEN** `IS_MOCK` is true and a guess is submitted
- **THEN** the system compares mock phone attributes and returns `details` alongside `feedback`
