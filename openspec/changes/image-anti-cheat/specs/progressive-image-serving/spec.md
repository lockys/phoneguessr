## ADDED Requirements

### Requirement: Server-side progressive crop rendering
The system SHALL generate and serve only the visible crop region of the puzzle image at each guess level, using server-side image processing. The full image SHALL NOT be transmitted until the game ends.

#### Scenario: Requesting a crop at level 0 (tightest zoom)
- **WHEN** the client requests `GET /api/puzzle?action=image&level=0`
- **THEN** the server SHALL return a JSON response containing a base64 data URL of the center crop at zoom scale 4.17x (approximately 24% x 24% of the original image dimensions)
- **AND** the response SHALL NOT contain any image data outside the cropped region

#### Scenario: Requesting a crop at level N (0-4)
- **WHEN** the client requests `GET /api/puzzle?action=image&level=N` where N is 0 through 4
- **THEN** the server SHALL extract a center crop of dimensions `(width / ZOOM_LEVELS[N]) x (height / ZOOM_LEVELS[N])` from the original image using `sharp`
- **AND** the server SHALL resize the crop to a consistent output resolution for canvas display
- **AND** the crop SHALL be centered on the image

#### Scenario: Requesting the full image at level 5
- **WHEN** the client requests `GET /api/puzzle?action=image&level=5`
- **AND** the player's game is complete (result exists in database or valid completion token is provided)
- **THEN** the server SHALL return the full image as a base64 data URL

#### Scenario: Requesting level 5 before game completion
- **WHEN** the client requests `GET /api/puzzle?action=image&level=5`
- **AND** the player's game is NOT complete
- **THEN** the server SHALL return a 403 Forbidden response with error `"game_not_complete"`

### Requirement: Server-side level validation for authenticated users
The system SHALL validate that an authenticated user's requested crop level does not exceed their actual game progress, using the guesses table in the database.

#### Scenario: Authenticated user requests valid level
- **WHEN** an authenticated user requests `GET /api/puzzle?action=image&level=N`
- **AND** the user has made at least N guesses for today's puzzle in the `guesses` table
- **THEN** the server SHALL return the crop at level N

#### Scenario: Authenticated user requests level beyond progress
- **WHEN** an authenticated user requests `GET /api/puzzle?action=image&level=N`
- **AND** the user has made fewer than N guesses for today's puzzle
- **THEN** the server SHALL return a 403 Forbidden response with error `"level_not_unlocked"`

#### Scenario: Authenticated user with completed game requests any level
- **WHEN** an authenticated user requests `GET /api/puzzle?action=image&level=N`
- **AND** a result record exists for this user and today's puzzle
- **THEN** the server SHALL return the crop at level N (any level is valid after game completion)

### Requirement: Signed token validation for unauthenticated users
The system SHALL use signed JWT tokens to track crop level progression for unauthenticated users who have no database records.

#### Scenario: First image request without authentication
- **WHEN** an unauthenticated user requests `GET /api/puzzle?action=image` with no level parameter and no token
- **THEN** the server SHALL return the level 0 crop
- **AND** the response JSON SHALL include a `token` field containing a signed JWT with claims `{ puzzleId, level: 0, exp }`

#### Scenario: Subsequent image request with valid token
- **WHEN** an unauthenticated user requests `GET /api/puzzle?action=image&level=N&token=<JWT>`
- **AND** the token is valid, not expired, matches today's puzzle, and the token's level claim is >= N-1
- **THEN** the server SHALL return the crop at level N
- **AND** the response SHALL include an updated token with `level: N`

#### Scenario: Image request with invalid or expired token
- **WHEN** a user requests `GET /api/puzzle?action=image&level=N&token=<JWT>`
- **AND** the token is invalid, expired, or for a different puzzle
- **THEN** the server SHALL return a 403 Forbidden response with error `"invalid_token"`

#### Scenario: Token expiration
- **WHEN** a JWT token is issued for an image request
- **THEN** the token SHALL expire at the end of the current puzzle day (midnight UTC)

### Requirement: Sharp-based crop generation
The system SHALL use the `sharp` Node.js library to extract crop regions from the source image.

#### Scenario: Crop extraction
- **WHEN** the server needs to generate a crop at level N
- **THEN** the server SHALL use `sharp` to:
  1. Read the source image from `phoneguessr/config/public/phones/`
  2. Extract a centered region of `(width / scale) x (height / scale)` where scale is `ZOOM_LEVELS[N]`
  3. Encode the result as JPEG (or PNG for PNG sources) and convert to base64

#### Scenario: Zoom level scale factors
- **WHEN** the server calculates crop dimensions
- **THEN** the zoom levels SHALL be: `[4.17, 2.5, 1.79, 1.39, 1.14, 1.0]` matching the existing client-side `ZOOM_LEVELS` array

### Requirement: Mock API progressive crop support
The mock API SHALL support progressive crop rendering identically to the production API.

#### Scenario: Mock image request with level
- **WHEN** the mock API receives an image request with a level parameter
- **THEN** the mock API SHALL use `sharp` to generate the same crop as the production API
- **AND** the mock API SHALL NOT validate levels (mock mode trusts the client for development convenience)
