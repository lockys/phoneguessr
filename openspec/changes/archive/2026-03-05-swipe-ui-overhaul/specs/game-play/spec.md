## MODIFIED Requirements

### Requirement: Progressive image reveal
The system SHALL display a cropped region of the phone's stock photo initially. On each wrong guess, the visible region SHALL expand to reveal more of the phone image. The system SHALL use 6 progressive crop levels from tightest to full image.

#### Scenario: Initial crop on puzzle load
- **WHEN** a player loads the daily puzzle
- **THEN** the system displays the tightest crop (level 1 of 6) of the phone image

#### Scenario: Crop expands on wrong guess
- **WHEN** a player submits a wrong guess on crop level N (where N < 6)
- **THEN** the visible region expands to crop level N+1

#### Scenario: Full reveal on game end
- **WHEN** a player guesses correctly OR exhausts all 6 guesses
- **THEN** the system reveals the full uncropped phone image
- **AND** the result SHALL be displayed in a modal overlay instead of inline

## ADDED Requirements

### Requirement: Compact guess history display
The guess history rows SHALL use a compact layout to minimize vertical space usage, keeping the autocomplete input visible on small screens.

#### Scenario: Guess row dimensions
- **WHEN** guess history rows are rendered
- **THEN** each row SHALL use reduced padding (6px 10px) and font size (13px)
- **AND** empty placeholder rows SHALL have a minimum height of 30px

#### Scenario: Guess history fits above input
- **WHEN** the game is being played on a mobile screen
- **THEN** the guess history and autocomplete input SHALL both be visible without scrolling on typical mobile viewports (>600px height)
