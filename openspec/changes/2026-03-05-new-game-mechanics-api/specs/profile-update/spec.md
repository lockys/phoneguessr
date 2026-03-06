## ADDED Requirements

### Requirement: Profile update endpoint
The system SHALL provide a POST /api/profile/update endpoint that allows authenticated users to update their display name.

#### Scenario: Valid display name update
- **WHEN** an authenticated user sends `POST /api/profile/update` with `{ "displayName": "PhoneExpert99" }`
- **THEN** the system updates the user's display name and returns `{ "success": true }`

### Requirement: Authentication required
The profile update endpoint SHALL require authentication.

#### Scenario: Unauthenticated update
- **WHEN** an unauthenticated user sends `POST /api/profile/update`
- **THEN** the system returns `401`

### Requirement: Display name validation
The system SHALL validate the display name: must be 1-50 characters after trimming whitespace, and must not contain HTML tags or script content.

#### Scenario: Empty display name
- **WHEN** a user sends `{ "displayName": "" }`
- **THEN** the system returns `400 { "error": "invalid_display_name" }`

#### Scenario: Display name too long
- **WHEN** a user sends a display name longer than 50 characters
- **THEN** the system returns `400 { "error": "invalid_display_name" }`

#### Scenario: XSS attempt
- **WHEN** a user sends `{ "displayName": "<script>alert('x')</script>" }`
- **THEN** the system returns `400 { "error": "invalid_display_name" }`

### Requirement: Display name sanitization
The system SHALL strip HTML tags and trim whitespace from the display name before validation and storage.

#### Scenario: Whitespace trimming
- **WHEN** a user sends `{ "displayName": "  PhoneExpert99  " }`
- **THEN** the stored display name is `"PhoneExpert99"`

### Requirement: Mock mode profile update
In mock mode, the profile update endpoint SHALL return `{ "success": true }` without database access.

#### Scenario: Mock update
- **WHEN** `IS_MOCK` is true
- **THEN** the system returns `{ "success": true }` (no-op)
