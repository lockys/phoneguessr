## ADDED Requirements

### Requirement: Backend image serving
The system SHALL serve puzzle images through a backend API endpoint instead of as static files. The endpoint SHALL return base64-encoded image data so that the phone identity is never revealed through the image URL or filename.

#### Scenario: Fetching puzzle image
- **WHEN** the client requests the puzzle image
- **THEN** the server SHALL return a JSON response containing a base64 data URL (e.g., `data:image/jpeg;base64,...`)
- **AND** no phone name, model, or identifying information SHALL appear in the URL or response headers

#### Scenario: Image URL in puzzle response
- **WHEN** the puzzle today API returns puzzle data
- **THEN** the response SHALL contain an opaque image URL (e.g., `/api/puzzle/image`) instead of a direct file path
- **AND** the URL SHALL NOT contain the phone name or model

### Requirement: No client-exposed phone identifiers
The system SHALL NOT expose phone-identifying information to the client before the game ends.

#### Scenario: Network inspection
- **WHEN** a player inspects network requests during gameplay
- **THEN** no request URL, response header, or response body SHALL reveal the phone name or model (except the guess feedback API after submission)

#### Scenario: DOM inspection
- **WHEN** a player inspects the DOM elements in devtools
- **THEN** no element attribute SHALL contain the base64 image data or any reference to the phone identity
- **AND** the canvas element SHALL NOT expose its drawn content through any inspectable property

#### Scenario: DevTools image preview
- **WHEN** a player hovers over or inspects the image rendering element in DevTools
- **THEN** DevTools SHALL NOT show a visual preview of the full phone image
