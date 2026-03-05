## MODIFIED Requirements

### Requirement: Mock API coverage
The mock API SHALL provide endpoints that mirror all production API endpoints for local development without a database. Mock responses SHALL use realistic static data.

#### Scenario: Mock image endpoint
- **WHEN** the client requests the puzzle image in mock mode
- **THEN** the mock API SHALL read the image file from `config/public/phones/`, encode it as base64, and return it in the same format as the production endpoint

#### Scenario: Mock profile stats endpoint
- **WHEN** the client requests profile stats in mock mode
- **THEN** the mock API SHALL return realistic static stats (e.g., games played: 10, wins: 7, etc.)
