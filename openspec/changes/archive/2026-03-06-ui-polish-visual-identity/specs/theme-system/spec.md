## ADDED Requirements

### Requirement: Light theme color tokens
The system SHALL support a light theme by overriding CSS custom properties when `data-theme="light"` is set on the `<html>` element.

#### Scenario: Light theme colors
- **WHEN** `<html data-theme="light">` is active
- **THEN** the following CSS custom properties SHALL be overridden:
  - `--bg: #f5f5f7` (light gray background)
  - `--surface: #ffffff` (white surface)
  - `--surface-hover: #f0f0f2` (slightly darker hover)
  - `--text: #1a1a2e` (dark text)
  - `--text-muted: #6b6b7e` (medium gray muted text)
  - `--accent: #e94560` (unchanged — brand color)
  - `--green: #16a34a` (darker green for light bg contrast)
  - `--yellow: #ca8a04` (darker yellow for light bg contrast)
  - `--red: #dc2626` (darker red for light bg contrast)
  - `--border: #d4d4d8` (light gray border)

#### Scenario: Dark theme (default)
- **WHEN** no `data-theme` attribute is set or `data-theme="dark"` is set
- **THEN** the existing `:root` color tokens SHALL apply unchanged

### Requirement: Theme toggle in Profile panel
The Profile panel SHALL include a toggle to switch between dark and light themes.

#### Scenario: Theme toggle display
- **WHEN** the player views the Profile panel
- **THEN** a theme toggle button SHALL be visible
- **AND** the button SHALL indicate the current active theme

#### Scenario: Switching theme
- **WHEN** the player clicks the theme toggle
- **THEN** the `data-theme` attribute on `<html>` SHALL update immediately
- **AND** all CSS custom property references SHALL reflect the new theme instantly

### Requirement: Theme persistence
The selected theme SHALL persist across sessions via localStorage.

#### Scenario: Saving theme preference
- **WHEN** the player selects a theme
- **THEN** the choice SHALL be saved to `localStorage` as `phoneguessr_theme` with value `"dark"` or `"light"`

#### Scenario: Loading theme on startup
- **WHEN** the app loads
- **THEN** the system SHALL read `phoneguessr_theme` from localStorage
- **AND** apply the stored theme before the first paint (to prevent flash of wrong theme)

#### Scenario: No stored preference
- **WHEN** no `phoneguessr_theme` exists in localStorage
- **THEN** the dark theme SHALL be used as the default

### Requirement: Frosted glass adjustments for light theme
Frosted glass effects SHALL be visually appropriate for the light theme.

#### Scenario: Light theme backdrop-filter
- **WHEN** the light theme is active
- **THEN** frosted glass overlays (start overlay, empty guess slots, page indicator) SHALL use lighter background colors with appropriate opacity
- **AND** the blur effect SHALL remain functional on light backgrounds

### Requirement: Internationalization
Theme-related labels SHALL be translated.

#### Scenario: i18n keys
- **WHEN** the theme toggle renders
- **THEN** labels SHALL use i18n keys (`settings.theme`, `settings.dark`, `settings.light`)
- **AND** keys SHALL be present in all 5 locale files (en, zh-TW, zh-CN, ja, ko)
