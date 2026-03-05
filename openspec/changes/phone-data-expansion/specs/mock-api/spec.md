## MODIFIED Requirements

### Requirement: Mock phones endpoint
The mock API SHALL return the full list of mock phones with brand, model, id, releaseYear, priceTier, formFactor, and difficulty when `GET /api/phones` is called.

#### Scenario: Fetch phone list in mock mode
- **WHEN** a request is made to `GET /api/phones` with `MOCK_API=true`
- **THEN** the response includes an array of 50+ phones with id, brand, model, releaseYear, priceTier, formFactor, and difficulty fields

## ADDED Requirements

### Requirement: MockPhone interface includes metadata
The MockPhone interface SHALL include all phone metadata fields: id, brand, model, imagePath, releaseYear, priceTier, formFactor, and difficulty.

#### Scenario: MockPhone type definition
- **WHEN** the MockPhone interface is used in mock data
- **THEN** each entry includes releaseYear (number), priceTier (string), formFactor (string), and difficulty (string) in addition to existing fields

### Requirement: Mock phone catalog size
The MOCK_PHONES array SHALL contain at least 50 phone entries covering all 15+ approved brands for meaningful local development and testing.

#### Scenario: Mock catalog brand coverage
- **WHEN** MOCK_PHONES is used for local development
- **THEN** at least 15 distinct brands are represented in the array

#### Scenario: Mock catalog size
- **WHEN** the MOCK_PHONES array length is checked
- **THEN** it contains at least 50 entries

### Requirement: Mock data metadata completeness
Every entry in the MOCK_PHONES array SHALL have all metadata fields populated with realistic values matching the phone's real-world characteristics.

#### Scenario: No null metadata in mock data
- **WHEN** any phone in MOCK_PHONES is examined
- **THEN** releaseYear, priceTier, formFactor, and difficulty are all present and non-null
