## ADDED Requirements

### Requirement: Yesterday's puzzle reveal endpoint
The system SHALL provide a GET /api/puzzle/yesterday endpoint that returns yesterday's puzzle answer, phone details, fun facts, and community statistics.

#### Scenario: Yesterday's puzzle exists
- **WHEN** any user sends `GET /api/puzzle/yesterday`
- **THEN** the system returns:
  ```json
  {
    "phone": {
      "brand": "Samsung",
      "model": "Galaxy S24 Ultra",
      "imageUrl": "/api/puzzle/image?date=2026-03-04",
      "releaseYear": 2024,
      "priceTier": "flagship"
    },
    "facts": [
      "First Galaxy S series with a flat display since the S7",
      "Features a built-in S Pen with Bluetooth"
    ],
    "stats": {
      "totalPlayers": 142,
      "winRate": 0.73,
      "avgGuesses": 3.2
    }
  }
  ```

#### Scenario: No yesterday puzzle
- **WHEN** no puzzle exists for yesterday's date (e.g., game just launched)
- **THEN** the system returns `404 { "error": "no_yesterday_puzzle" }`

### Requirement: No authentication required
The system SHALL serve yesterday's reveal to all users regardless of authentication status.

#### Scenario: Anonymous access
- **WHEN** an unauthenticated user sends `GET /api/puzzle/yesterday`
- **THEN** the system returns the same response as for authenticated users

### Requirement: Community statistics
The system SHALL aggregate community stats from the results table: total players who attempted, win rate, and average guess count.

#### Scenario: Stats aggregation
- **WHEN** 100 players attempted yesterday's puzzle, 73 won, average 3.2 guesses
- **THEN** `stats` returns `{ "totalPlayers": 100, "winRate": 0.73, "avgGuesses": 3.2 }`

#### Scenario: No results yet
- **WHEN** yesterday's puzzle exists but no one has played it
- **THEN** `stats` returns `{ "totalPlayers": 0, "winRate": 0, "avgGuesses": 0 }`

### Requirement: Phone facts
The system SHALL include fun facts about the phone from the `phone_facts` table. If no facts exist for the phone, an empty array is returned.

#### Scenario: Phone has facts
- **WHEN** the phone has 3 entries in `phone_facts`
- **THEN** `facts` contains 3 strings

#### Scenario: Phone has no facts
- **WHEN** the phone has no entries in `phone_facts`
- **THEN** `facts` is an empty array `[]`

### Requirement: Phone facts schema
The system SHALL store phone facts in a `phone_facts` table with columns: id (serial PK), phone_id (FK phones), fact_text (text), fact_type (varchar: 'spec' | 'history' | 'trivia'), created_at (timestamp).

### Requirement: Yesterday image URL
The system SHALL provide yesterday's phone image via a date-parameterized image URL. The image endpoint SHALL accept an optional `date` query parameter.

#### Scenario: Image for specific date
- **WHEN** a client requests `/api/puzzle/image?date=2026-03-04`
- **THEN** the system returns the base64 image for that date's puzzle phone

### Requirement: Cacheability
The yesterday endpoint response SHALL be identical for all users and suitable for CDN/edge caching with a 24-hour TTL.

### Requirement: Mock mode yesterday behavior
In mock mode, the system SHALL return the previous mock phone with hardcoded facts and stats.

#### Scenario: Mock yesterday
- **WHEN** `IS_MOCK` is true
- **THEN** the system returns a mock phone with sample facts and fixed stats
