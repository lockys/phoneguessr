## MODIFIED Requirements

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
