## ADDED Requirements

### Requirement: Passkey registration for authenticated users
The system SHALL allow authenticated users to register a WebAuthn passkey linked to their account. Registration SHALL only be available to users who are already signed in via Google OAuth.

#### Scenario: Successful passkey registration
- **WHEN** an authenticated user initiates passkey registration
- **THEN** the server SHALL generate a registration challenge with the user's account info
- **AND** the browser SHALL prompt the user for biometric authentication (Face ID, Touch ID, fingerprint, or platform authenticator)
- **AND** upon successful biometric verification, the credential SHALL be stored in the `passkey_credentials` table linked to the user's account

#### Scenario: Registration when not authenticated
- **WHEN** an unauthenticated user attempts to access the registration endpoint
- **THEN** the server SHALL return a 401 Unauthorized response

#### Scenario: User already has a passkey registered
- **WHEN** an authenticated user who already has a passkey attempts to register another
- **THEN** the server SHALL replace the existing credential with the new one

#### Scenario: Registration challenge expires
- **WHEN** a user takes longer than 60 seconds between requesting registration options and submitting the registration response
- **THEN** the server SHALL reject the registration with an appropriate error

### Requirement: Passkey login
The system SHALL allow users to sign in using a previously registered passkey as an alternative to Google OAuth. Passkey login SHALL create the same session as Google OAuth login.

#### Scenario: Successful passkey login
- **WHEN** a user initiates passkey login and completes biometric verification
- **THEN** the server SHALL verify the WebAuthn assertion against the stored credential
- **AND** the server SHALL create a session token using the existing `createSessionToken()` function
- **AND** the session cookie SHALL be set identically to Google OAuth login

#### Scenario: Passkey login with no registered credential
- **WHEN** a user attempts passkey login but has no registered passkey
- **THEN** the browser SHALL show no matching credentials
- **AND** the user SHALL be directed to use Google OAuth instead

#### Scenario: Passkey login with invalid assertion
- **WHEN** a user submits a passkey response that fails server-side verification
- **THEN** the server SHALL return an authentication error
- **AND** no session SHALL be created

#### Scenario: Authenticator counter mismatch
- **WHEN** the authenticator counter in the assertion is less than or equal to the stored counter
- **THEN** the server SHALL reject the authentication (potential cloned authenticator)

### Requirement: Passkey credential storage
The system SHALL store WebAuthn credentials in a `passkey_credentials` database table with the credential ID, public key, signature counter, transports, and a foreign key to the user.

#### Scenario: Credential data integrity
- **WHEN** a passkey credential is stored
- **THEN** it SHALL include: credential ID (base64url), public key (base64url), counter (integer), transports (text array), user ID (foreign key), and creation timestamp

#### Scenario: Counter update on login
- **WHEN** a user successfully authenticates with a passkey
- **THEN** the server SHALL update the stored counter to the new value from the authenticator

### Requirement: Passkey API endpoints
The system SHALL expose four API endpoints for WebAuthn operations under `/api/auth/passkey/`.

#### Scenario: GET /api/auth/passkey/register-options
- **WHEN** an authenticated user requests registration options
- **THEN** the server SHALL return a PublicKeyCredentialCreationOptions object including a fresh challenge, the relying party info, and the user's account info

#### Scenario: POST /api/auth/passkey/register
- **WHEN** an authenticated user submits a registration response
- **THEN** the server SHALL verify the response against the stored challenge and save the credential

#### Scenario: POST /api/auth/passkey/login-options
- **WHEN** a client requests login options with an optional email hint
- **THEN** the server SHALL return a PublicKeyCredentialRequestOptions object with a fresh challenge and the user's allowed credentials (if email provided)

#### Scenario: POST /api/auth/passkey/login
- **WHEN** a client submits an authentication response
- **THEN** the server SHALL verify the assertion, update the counter, and return a session cookie

### Requirement: Passkey UI in frontend
The system SHALL provide UI elements for passkey registration and login, with feature detection for browser support.

#### Scenario: Passkey login button on auth screen
- **WHEN** the browser supports WebAuthn (`window.PublicKeyCredential` is available)
- **THEN** a "Sign in with Passkey" button SHALL be displayed alongside the existing Google OAuth button

#### Scenario: Browser does not support WebAuthn
- **WHEN** the browser does not support WebAuthn
- **THEN** no passkey-related UI SHALL be shown
- **AND** Google OAuth SHALL remain the only login option

#### Scenario: Passkey registration prompt in profile
- **WHEN** an authenticated user views their profile panel and has no passkey registered
- **THEN** a "Set up Passkey" button SHALL be displayed
- **AND** the button SHALL explain the benefit (faster biometric login)

#### Scenario: Passkey already registered indicator
- **WHEN** an authenticated user views their profile panel and has a passkey registered
- **THEN** the UI SHALL show that a passkey is set up with the registration date
- **AND** an option to re-register (replace) the passkey SHALL be available

### Requirement: Mock API support for passkey endpoints
The system SHALL provide mock implementations of all passkey endpoints for local development mode.

#### Scenario: Mock passkey login
- **WHEN** the app is running in mock mode and a user clicks "Sign in with Passkey"
- **THEN** the mock API SHALL simulate a successful passkey login and return the mock user session

#### Scenario: Mock passkey registration
- **WHEN** the app is running in mock mode and an authenticated user initiates passkey registration
- **THEN** the mock API SHALL simulate a successful registration
