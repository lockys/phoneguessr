## ADDED Requirements

### Requirement: Game start overlay
The system SHALL display a frosted glass overlay on the game panel when a player first lands on an unplayed puzzle. The overlay SHALL include a "Start" button. The timer SHALL NOT begin until the player clicks Start.

#### Scenario: First visit to today's puzzle
- **WHEN** a player loads the game for today's puzzle for the first time
- **THEN** the game content (image, blocks) SHALL be visible but blurred behind a frosted overlay
- **AND** a "Start" button SHALL be displayed on the overlay
- **AND** the timer SHALL NOT be running

#### Scenario: Clicking Start
- **WHEN** the player clicks the "Start" button
- **THEN** the overlay SHALL be removed
- **AND** the timer SHALL begin counting

#### Scenario: Returning to completed puzzle
- **WHEN** a player loads the game and has already completed today's puzzle
- **THEN** no overlay SHALL be displayed
- **AND** the result modal SHALL appear as normal
