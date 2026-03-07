## MODIFIED Requirements

### Requirement: Dev script
The project SHALL include an `npm run dev:mock` script that starts the dev server with `MOCK_API=true`.

#### Scenario: Starting mock dev server
- **WHEN** a developer runs `npm run dev:mock` from the `phoneguessr/` directory
- **THEN** the Modern.js dev server starts with all API endpoints returning mock data
- **AND** no database connection is required

#### Scenario: Mock mode works after BFF removal
- **WHEN** `npm run dev:mock` runs after the BFF plugin has been removed
- **THEN** mock API handlers in `phoneguessr/src/` still intercept API calls
- **AND** the game is fully playable with mock data
