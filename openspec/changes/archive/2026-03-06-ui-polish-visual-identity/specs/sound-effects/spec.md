## ADDED Requirements

### Requirement: Audio feedback for game events
The system SHALL provide optional sound effects for key game events.

#### Scenario: Block reveal sound
- **WHEN** a block is removed from the grid (after a wrong guess)
- **THEN** a short "tick" sound (~100ms) SHALL play if sound is enabled

#### Scenario: Wrong guess sound
- **WHEN** the player submits a wrong_brand guess
- **THEN** a low "buzz" sound (~200ms) SHALL play if sound is enabled

#### Scenario: Right brand sound
- **WHEN** the player submits a right_brand guess
- **THEN** a medium "ding" sound (~200ms) SHALL play if sound is enabled

#### Scenario: Correct guess sound
- **WHEN** the player guesses correctly
- **THEN** an ascending "chime" sound (~400ms) SHALL play if sound is enabled

#### Scenario: Confetti sound
- **WHEN** confetti particles are triggered on a win
- **THEN** a brief "pop" sound (~150ms) SHALL play if sound is enabled

### Requirement: Muted by default
Sound effects SHALL be disabled by default out of respect for users in public settings.

#### Scenario: First visit
- **WHEN** a player opens PhoneGuessr for the first time
- **THEN** all sound effects SHALL be muted
- **AND** no audio SHALL play without explicit opt-in

### Requirement: Sound toggle in Profile panel
The Profile panel SHALL include a toggle to enable or disable sound effects.

#### Scenario: Sound toggle display
- **WHEN** the player views the Profile panel
- **THEN** a sound toggle SHALL be visible
- **AND** the toggle SHALL indicate the current state (on/off)

#### Scenario: Enabling sound
- **WHEN** the player enables sound via the toggle
- **THEN** sound effects SHALL begin playing for subsequent game events
- **AND** the preference SHALL persist to `localStorage` as `phoneguessr_sound: "true"`

#### Scenario: Disabling sound
- **WHEN** the player disables sound via the toggle
- **THEN** all sound effects SHALL stop immediately
- **AND** no sounds SHALL play for subsequent events
- **AND** the preference SHALL persist to `localStorage` as `phoneguessr_sound: "false"`

### Requirement: Lazy audio loading
Sound files SHALL be loaded lazily to avoid impacting initial page load.

#### Scenario: Audio initialization
- **WHEN** the app loads
- **THEN** no audio files SHALL be fetched or Audio objects created
- **AND** Audio objects SHALL only be created when sound is first enabled or a sound event fires with sound enabled

#### Scenario: Audio file constraints
- **WHEN** audio files are included in the build
- **THEN** total audio file size SHALL be under 20KB
- **AND** files SHALL be stored in `public/sounds/` directory
- **AND** files SHALL be in a widely supported format (MP3 or WAV)

### Requirement: Internationalization
Sound-related labels SHALL be translated.

#### Scenario: i18n keys
- **WHEN** the sound toggle renders
- **THEN** labels SHALL use i18n keys (`settings.sound`, `settings.on`, `settings.off`)
- **AND** keys SHALL be present in all 5 locale files (en, zh-TW, zh-CN, ja, ko)
