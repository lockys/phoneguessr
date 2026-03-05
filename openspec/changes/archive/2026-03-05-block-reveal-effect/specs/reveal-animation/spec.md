## ADDED Requirements

### Requirement: Block grid overlay during gameplay
The CropReveal component SHALL render a 6x6 grid of opaque blocks over the phone image. Blocks SHALL use the app background color (`--bg`) and completely cover the image at the start of gameplay.

#### Scenario: Initial game state (0 guesses)
- **WHEN** the game loads with no guesses made
- **THEN** all 36 blocks SHALL be visible, fully covering the image
- **AND** the image SHALL be hidden behind the block grid

#### Scenario: Block sizing and positioning
- **WHEN** blocks are rendered
- **THEN** each block SHALL be exactly 1/6th of the container width and height
- **AND** blocks SHALL tile without gaps to completely cover the image area

### Requirement: Progressive block removal on wrong guesses
Each wrong guess SHALL remove a batch of ~6 blocks from the grid, progressively exposing the image underneath. The removal order SHALL be deterministic per puzzle (seeded by puzzle date).

#### Scenario: First wrong guess
- **WHEN** the player makes their first wrong guess
- **THEN** approximately 6 blocks SHALL animate away with a staggered fade-out
- **AND** 30 blocks SHALL remain visible

#### Scenario: Fifth wrong guess
- **WHEN** the player makes their fifth wrong guess
- **THEN** approximately 6 more blocks SHALL animate away
- **AND** approximately 6 blocks SHALL remain visible

#### Scenario: Block removal animation
- **WHEN** a batch of blocks is removed after a wrong guess
- **THEN** each block in the batch SHALL fade out with `opacity: 0` over 0.3s
- **AND** blocks within the batch SHALL have staggered start times (~30ms apart)

### Requirement: Cascade block reveal on correct guess
When the player guesses correctly, all remaining blocks SHALL cascade away with a dramatic staggered animation.

#### Scenario: Correct guess cascade
- **WHEN** the player guesses correctly
- **THEN** remaining blocks SHALL animate out with `scale(1.3)` and `opacity: 0`
- **AND** blocks SHALL have staggered start times (~40ms apart) for a wave/cascade effect
- **AND** the total cascade duration SHALL approximately match the zoom-out duration (~1.2s)

### Requirement: Fast block clear on loss
When the player loses, remaining blocks SHALL clear quickly without dramatic animation.

#### Scenario: Loss block clear
- **WHEN** the player exhausts all 6 guesses
- **THEN** all remaining blocks SHALL fade out simultaneously over ~0.3s
- **AND** no scale or stagger effects SHALL be applied

### Requirement: No blocks on completed puzzle
When returning to a previously completed puzzle, blocks SHALL not be shown.

#### Scenario: Revisiting a completed puzzle
- **WHEN** the player loads a puzzle they already completed (won or lost)
- **THEN** no block overlay SHALL be rendered
- **AND** the image SHALL be fully visible immediately
