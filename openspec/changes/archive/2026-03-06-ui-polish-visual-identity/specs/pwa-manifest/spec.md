## ADDED Requirements

### Requirement: Web app manifest
The application SHALL include a web app manifest enabling installation to the user's home screen.

#### Scenario: Manifest contents
- **WHEN** the browser reads the manifest
- **THEN** it SHALL contain:
  - `name`: "PhoneGuessr"
  - `short_name`: "PhoneGuessr"
  - `start_url`: "/"
  - `display`: "standalone"
  - `theme_color`: "#1a1a2e"
  - `background_color`: "#1a1a2e"
  - `description`: "Daily phone guessing game"
  - `icons`: array with 192x192 and 512x512 PNG entries

#### Scenario: Manifest link
- **WHEN** the HTML page loads
- **THEN** a `<link rel="manifest" href="/manifest.json">` SHALL be present in the `<head>`

### Requirement: PWA meta tags
The HTML SHALL include meta tags for PWA support on iOS and Android.

#### Scenario: Meta tags present
- **WHEN** the HTML page loads
- **THEN** the `<head>` SHALL contain:
  - `<meta name="theme-color" content="#1a1a2e">`
  - `<meta name="apple-mobile-web-app-capable" content="yes">`
  - `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`

### Requirement: App icons
The application SHALL provide icons for home screen installation.

#### Scenario: Icon sizes
- **WHEN** the manifest is processed
- **THEN** icons SHALL be available in:
  - 192x192 pixels (for Android home screen)
  - 512x512 pixels (for Android splash screen)
- **AND** icons SHALL be PNG format with transparent background
- **AND** the icon design SHALL use the app's accent color (#e94560)

### Requirement: Offline fallback page
The application SHALL display a friendly offline page when the user has no internet connection.

#### Scenario: Offline navigation
- **WHEN** the user navigates to the app without internet connectivity
- **AND** the page is not in the browser cache
- **THEN** a styled offline fallback page SHALL be displayed
- **AND** the page SHALL match the app's dark theme
- **AND** the page SHALL display a message like "You're offline. Connect to the internet to play."

#### Scenario: Offline page styling
- **WHEN** the offline page renders
- **THEN** it SHALL use inline styles matching the app's dark theme (--bg, --text, --accent)
- **AND** it SHALL be a self-contained HTML file with no external dependencies

### Requirement: Minimal service worker
A service worker SHALL be registered to serve the offline fallback page.

#### Scenario: Service worker registration
- **WHEN** the app loads in a browser that supports service workers
- **THEN** the service worker SHALL be registered from `public/sw.js`

#### Scenario: Offline interception
- **WHEN** a navigation request fails due to no network
- **THEN** the service worker SHALL respond with the cached `offline.html` page

#### Scenario: No asset caching
- **WHEN** the service worker is active
- **THEN** it SHALL NOT cache application assets (JS, CSS, images)
- **AND** it SHALL only cache the `offline.html` file during installation
