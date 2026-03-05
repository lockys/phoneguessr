## ADDED Requirements

### Requirement: Canvas-based image rendering
The system SHALL render the puzzle image on an HTML `<canvas>` element instead of an `<img>` element. The image data SHALL be drawn programmatically using the Canvas 2D API.

#### Scenario: Image drawn to canvas
- **WHEN** the puzzle image data is loaded
- **THEN** the system SHALL create an offscreen `Image` object, draw it onto a `<canvas>` element, and NOT attach the `Image` object or base64 data to any DOM attribute

#### Scenario: High-DPI rendering
- **WHEN** the canvas is rendered on a high-DPI display
- **THEN** the canvas SHALL scale its internal resolution by `devicePixelRatio` for crisp rendering

### Requirement: Canvas-based zoom and reveal animation
The system SHALL implement progressive zoom levels and reveal animations using JavaScript-driven canvas redraws instead of CSS transforms/animations.

#### Scenario: Progressive zoom on guess
- **WHEN** the player makes a wrong guess at level N
- **THEN** the canvas SHALL redraw at zoom level N+1 with the same scale factors as the current implementation (4.17x down to 1.0x)

#### Scenario: Win reveal animation
- **WHEN** the player guesses correctly
- **THEN** the canvas SHALL animate from the current zoom level to full view using a JS-driven animation with easing equivalent to the current CSS `zoom-reveal-win` keyframes

#### Scenario: Loss reveal animation
- **WHEN** the player exhausts all guesses
- **THEN** the canvas SHALL animate from the current zoom level to full view using a JS-driven animation with easing equivalent to the current CSS `zoom-reveal-loss` keyframes

### Requirement: Canvas accessibility
The system SHALL provide accessible attributes on the canvas element.

#### Scenario: Screen reader support
- **WHEN** the canvas element is rendered
- **THEN** it SHALL have `role="img"` and an `aria-label` describing its purpose
