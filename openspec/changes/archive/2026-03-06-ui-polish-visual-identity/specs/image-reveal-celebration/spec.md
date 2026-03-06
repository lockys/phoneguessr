## ADDED Requirements

### Requirement: Radial glow on win reveal
When the player guesses correctly, a radial glow effect SHALL appear behind the phone image to enhance the celebration moment.

#### Scenario: Glow appears on correct guess
- **WHEN** the player guesses correctly and the zoom-out reveal animation begins
- **THEN** a radial gradient glow SHALL fade in behind the crop container
- **AND** the glow SHALL use the accent color (#e94560) at 0.3 opacity
- **AND** the glow SHALL extend to 120% of the container size, centered

#### Scenario: Glow timing
- **WHEN** the zoom-out animation is in progress
- **THEN** the glow SHALL fade in over 0.6s (reaching peak at the midpoint of the 1.2s zoom)
- **AND** the glow SHALL hold at peak for approximately 1s
- **AND** the glow SHALL fade out over 2s after the hold

#### Scenario: No glow on loss
- **WHEN** the player exhausts all 6 guesses (loss)
- **THEN** no glow effect SHALL be applied during the fast reveal

### Requirement: Glow implementation constraints
The glow effect SHALL be implemented without impacting canvas rendering performance.

#### Scenario: DOM structure
- **WHEN** the glow effect is rendered
- **THEN** it SHALL be implemented as a CSS pseudo-element or sibling div behind the canvas
- **AND** it SHALL NOT modify the canvas element or its rendering context
- **AND** it SHALL use `will-change: opacity` for GPU compositing

#### Scenario: Z-index layering
- **WHEN** the glow element is present
- **THEN** the z-index order SHALL be: glow (bottom) → canvas → block grid (top)
- **AND** the glow SHALL NOT obscure the phone image or block grid

### Requirement: Reduced motion support
The glow animation SHALL respect the user's reduced motion preference.

#### Scenario: Reduced motion enabled
- **WHEN** the user has `prefers-reduced-motion: reduce` set
- **THEN** no glow animation SHALL be displayed
