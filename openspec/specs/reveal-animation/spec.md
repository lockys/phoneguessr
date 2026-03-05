## ADDED Requirements

### Requirement: Zoomed-in image during gameplay
The CropReveal component SHALL display the phone image zoomed-in using CSS `transform: scale(X)` where X corresponds to the current guess level. The container's `overflow: hidden` SHALL crop the zoomed image to the container bounds.

#### Scenario: Initial game state (0 guesses)
- **WHEN** the game loads with no guesses made
- **THEN** the image SHALL be displayed at approximately 4.17x zoom (showing ~24% of the image area, centered)

#### Scenario: After each wrong guess
- **WHEN** the player makes a wrong guess
- **THEN** the zoom level SHALL decrease (revealing more of the image) with a 0.4s ease-out transition
- **AND** the scale factor SHALL follow the progression: 4.17 → 2.50 → 1.79 → 1.39 → 1.14 → 1.00

### Requirement: Cinematic zoom-out reveal on correct guess
When the player guesses correctly, the CropReveal component SHALL animate a smooth zoom-out from the current scale level to scale(1) (full image), creating a camera pull-back effect.

#### Scenario: Correct guess at level 0 (first guess)
- **WHEN** the player guesses correctly on their first attempt
- **THEN** the image SHALL zoom out from ~4.17x to 1.0x over approximately 1.2 seconds
- **AND** the transition SHALL use a smooth easing curve (ease-out or custom cubic-bezier)

#### Scenario: Correct guess at level 3
- **WHEN** the player guesses correctly after 3 wrong guesses
- **THEN** the image SHALL zoom out from ~1.39x to 1.0x over approximately 1.2 seconds

### Requirement: Fast reveal on loss
When the player exhausts all 6 guesses without a correct answer, the image SHALL reveal with a faster, less dramatic animation.

#### Scenario: Player loses after 6 wrong guesses
- **WHEN** the player makes their 6th wrong guess (game over, loss)
- **THEN** the image SHALL zoom out to scale(1) over approximately 0.5 seconds with ease-out timing
- **AND** no celebratory animation effects SHALL be applied

### Requirement: Delayed game-over UI after reveal
The game-over statistics, share button, and leaderboard SHALL NOT appear until the reveal animation completes.

#### Scenario: Game-over UI appears after win animation
- **WHEN** the player guesses correctly and the zoom-out animation begins
- **THEN** the GameOver component and Leaderboard SHALL remain hidden during the 1.2s animation
- **AND** they SHALL appear after the animation completes

#### Scenario: Game-over UI appears after loss animation
- **WHEN** the player loses and the fast reveal animation begins
- **THEN** the GameOver component and Leaderboard SHALL appear after the 0.5s animation completes

### Requirement: Returning to completed puzzle
When a player returns to a puzzle they already completed, the image SHALL be shown fully revealed without animation.

#### Scenario: Revisiting a won puzzle
- **WHEN** the player loads a puzzle they previously completed (won or lost)
- **THEN** the image SHALL display at scale(1) immediately with no animation
- **AND** the game-over UI SHALL be visible immediately

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
