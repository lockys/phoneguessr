## ADDED Requirements

### Requirement: Animated guess row insertion
When a player submits a guess, the resulting guess row SHALL animate into the guess history instead of appearing instantly.

#### Scenario: New guess row appears
- **WHEN** the player submits a guess (correct, right_brand, or wrong_brand)
- **THEN** the new guess row SHALL slide in from the right over 0.3s with ease-out timing
- **AND** the row SHALL start with opacity 0 and translateX(20px), ending at opacity 1 and translateX(0)

#### Scenario: Existing rows are not re-animated
- **WHEN** the guess history re-renders (e.g., component re-mount or state change)
- **THEN** previously submitted guess rows SHALL appear instantly without animation
- **AND** only the most recently added row SHALL animate

### Requirement: Delayed color reveal on guess rows
After the slide-in animation, the guess row border SHALL transition from neutral to the feedback color.

#### Scenario: Color reveal timing
- **WHEN** a new guess row finishes its slide-in animation
- **THEN** the row border SHALL transition from `var(--border)` to the feedback color over 0.2s
- **AND** the color transition SHALL begin 0.15s after the slide-in starts
- **AND** the feedback colors SHALL be: `var(--red)` for wrong_brand, `var(--yellow)` for right_brand, `var(--green)` for correct

### Requirement: Wrong guess shake effect
When a guess is wrong (wrong_brand), the row SHALL shake briefly after the color reveal.

#### Scenario: Shake animation on wrong_brand
- **WHEN** a wrong_brand guess row completes its color reveal
- **THEN** the row SHALL play a horizontal shake animation (±3px, 2 cycles, 0.3s)
- **AND** the shake SHALL use transform only (GPU composited)

#### Scenario: No shake on right_brand
- **WHEN** a right_brand guess row completes its color reveal
- **THEN** no shake animation SHALL be applied

### Requirement: Correct guess pulse effect
When a guess is correct, the row SHALL pulse to celebrate.

#### Scenario: Pulse animation on correct
- **WHEN** a correct guess row completes its color reveal
- **THEN** the row SHALL play a scale pulse (1.0 → 1.05 → 1.0, 0.3s ease)

### Requirement: Reduced motion support
All guess feedback animations SHALL respect the user's reduced motion preference.

#### Scenario: Reduced motion enabled
- **WHEN** the user has `prefers-reduced-motion: reduce` set
- **THEN** guess rows SHALL appear instantly without slide-in, shake, or pulse animations
- **AND** the border color SHALL change instantly without transition

### Requirement: Haptic feedback on guess result
The game SHALL provide haptic feedback when a guess result is revealed.

#### Scenario: Haptic on wrong guess
- **WHEN** a wrong_brand guess is submitted
- **THEN** a light haptic pulse SHALL be triggered via web-haptics

#### Scenario: Haptic on right brand guess
- **WHEN** a right_brand guess is submitted
- **THEN** a medium haptic pulse SHALL be triggered

#### Scenario: Haptic on correct guess
- **WHEN** a correct guess is submitted
- **THEN** a heavy/success haptic pulse SHALL be triggered
