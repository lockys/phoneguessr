## MODIFIED Requirements

### Requirement: Daily puzzle API response
The system SHALL serve one puzzle per calendar day (UTC). The puzzle API SHALL return the puzzle metadata including an opaque image URL instead of a direct file path.

#### Scenario: Puzzle response format
- **WHEN** the client requests today's puzzle
- **THEN** the response SHALL include `puzzleId`, `puzzleNumber`, `puzzleDate`, and `imageUrl`
- **AND** `imageUrl` SHALL point to an API endpoint (e.g., `/api/puzzle/image`) that serves the image as base64 data
- **AND** `imageUrl` SHALL NOT contain the phone name or model
