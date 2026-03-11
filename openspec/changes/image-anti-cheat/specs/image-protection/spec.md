## MODIFIED Requirements

### Requirement: Backend image serving
The system SHALL serve puzzle images through a backend API endpoint that returns only the visible crop region at the player's current guess level, instead of the full base64-encoded image. The full image SHALL only be served after the game ends.

#### Scenario: Fetching puzzle image during gameplay
- **WHEN** the client requests the puzzle image at a given guess level
- **THEN** the server SHALL return a JSON response containing a base64 data URL of ONLY the cropped region visible at that level
- **AND** no phone name, model, or identifying information SHALL appear in the URL or response headers
- **AND** the response SHALL NOT contain image data beyond the cropped region

#### Scenario: Fetching puzzle image after game completion
- **WHEN** the client requests the puzzle image after the game has ended (win or loss)
- **THEN** the server SHALL return the full image as a base64 data URL
- **AND** this SHALL be the only time the full image is transmitted

#### Scenario: Image URL in puzzle response
- **WHEN** the puzzle today API returns puzzle data
- **THEN** the response SHALL contain an opaque image URL (e.g., `/api/puzzle/image`) instead of a direct file path
- **AND** the URL SHALL NOT contain the phone name or model

### Requirement: No client-exposed phone identifiers
The system SHALL NOT expose phone-identifying information to the client before the game ends.

#### Scenario: Network inspection during gameplay
- **WHEN** a player inspects network requests during gameplay (before game completion)
- **THEN** no request URL, response header, or response body SHALL reveal the phone name or model
- **AND** the image data in the response SHALL be a cropped region too small to reliably identify the phone via reverse-image-search

#### Scenario: Network inspection after game completion
- **WHEN** a player inspects network requests after the game ends
- **THEN** the full image MAY be visible in the network tab (the game is over, so this is acceptable)

#### Scenario: DOM inspection
- **WHEN** a player inspects the DOM elements in devtools
- **THEN** no element attribute SHALL contain the base64 image data or any reference to the phone identity
- **AND** the canvas element SHALL NOT expose its drawn content through any inspectable property

#### Scenario: DevTools image preview
- **WHEN** a player hovers over or inspects the image rendering element in DevTools
- **THEN** DevTools SHALL NOT show a visual preview of the full phone image

#### Scenario: Direct API manipulation
- **WHEN** a player manually calls the image API with a level parameter higher than their actual game progress
- **THEN** the server SHALL reject the request and NOT return the wider crop
