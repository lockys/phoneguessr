## ADDED Requirements

### Requirement: 3-step tutorial overlay for first-time players
The system SHALL display a tutorial overlay for players who have never played PhoneGuessr before.

#### Scenario: Step 1 — Explain the image puzzle
- **WHEN** the tutorial is active on step 1
- **THEN** a spotlight SHALL highlight the crop container (phone image area)
- **AND** tooltip text SHALL explain: "A phone is hidden behind blocks"
- **AND** Next and Skip buttons SHALL be displayed

#### Scenario: Step 2 — Explain the guessing mechanic
- **WHEN** the player advances to step 2
- **THEN** a spotlight SHALL highlight the autocomplete input
- **AND** tooltip text SHALL explain: "Type to guess the phone model"
- **AND** Next and Skip buttons SHALL be displayed

#### Scenario: Step 3 — Explain the scoring
- **WHEN** the player advances to step 3
- **THEN** a spotlight SHALL highlight the guess history area
- **AND** tooltip text SHALL explain: "Fewer guesses = higher score!"
- **AND** a "Got it!" button SHALL be displayed (replacing Next)

### Requirement: Tutorial trigger conditions
The tutorial SHALL only show for first-time players.

#### Scenario: First-time player
- **WHEN** a player dismisses the start overlay for the first time
- **AND** `localStorage.getItem('phoneguessr_onboarded')` is null
- **THEN** the tutorial overlay SHALL appear

#### Scenario: Returning player
- **WHEN** a player has `phoneguessr_onboarded` set to `"true"` in localStorage
- **THEN** the tutorial SHALL NOT appear

#### Scenario: Player with game history
- **WHEN** a player has game history in localStorage (previous completions)
- **THEN** the tutorial SHALL NOT appear regardless of the onboarded flag

### Requirement: Tutorial dismissal
The tutorial SHALL be dismissable at any step.

#### Scenario: Skip button
- **WHEN** the player clicks the "Skip" button on any step
- **THEN** the tutorial SHALL close immediately
- **AND** `phoneguessr_onboarded` SHALL be set to `"true"` in localStorage

#### Scenario: Complete tutorial
- **WHEN** the player clicks "Got it!" on step 3
- **THEN** the tutorial SHALL close
- **AND** `phoneguessr_onboarded` SHALL be set to `"true"` in localStorage

### Requirement: Spotlight overlay implementation
The tutorial overlay SHALL use a semi-transparent backdrop with a cutout highlighting the target element.

#### Scenario: Overlay appearance
- **WHEN** the tutorial is active
- **THEN** a dark overlay (rgba(0,0,0,0.7)) SHALL cover the entire viewport
- **AND** a rectangular cutout with rounded corners SHALL expose the target element
- **AND** the cutout position SHALL be calculated using `getBoundingClientRect()`

#### Scenario: Tooltip positioning
- **WHEN** the spotlight is active
- **THEN** a tooltip card SHALL appear adjacent to the spotlight cutout
- **AND** the tooltip SHALL avoid going off-screen (viewport-aware positioning)

#### Scenario: Viewport changes
- **WHEN** the viewport size changes while the tutorial is active
- **THEN** the spotlight cutout position SHALL update to match the target element's new position

### Requirement: Reduced motion support
Tutorial transitions SHALL respect the user's reduced motion preference.

#### Scenario: Reduced motion enabled
- **WHEN** the user has `prefers-reduced-motion: reduce` set
- **THEN** step transitions SHALL be instant (no fade or slide)
- **AND** the spotlight cutout SHALL appear without animation

### Requirement: Internationalization
All tutorial text SHALL be translated.

#### Scenario: i18n keys
- **WHEN** the tutorial renders
- **THEN** step descriptions SHALL use i18n keys (`onboarding.step1`, `onboarding.step2`, `onboarding.step3`)
- **AND** button labels SHALL use i18n keys (`onboarding.next`, `onboarding.skip`, `onboarding.done`)
- **AND** keys SHALL be present in all 5 locale files (en, zh-TW, zh-CN, ja, ko)
