## ADDED Requirements

### Requirement: Guess distribution histogram
The Profile panel SHALL display a horizontal bar chart showing the player's guess distribution across all completed games.

#### Scenario: Histogram displays distribution
- **WHEN** a player views the Profile panel
- **THEN** a "Guess Distribution" section SHALL appear below the stats grid
- **AND** it SHALL show 6 horizontal bars labeled 1 through 6 (guess counts)
- **AND** each bar width SHALL be proportional to the frequency of that guess count
- **AND** each bar SHALL display its count value at the right end

#### Scenario: Current game highlight
- **WHEN** the player has just completed a game (won)
- **THEN** the bar corresponding to their guess count SHALL be highlighted in green (`var(--green)`)
- **AND** all other bars SHALL use the accent color at 40% opacity

#### Scenario: No highlight after loss
- **WHEN** the player has just lost a game
- **THEN** no bar SHALL be highlighted in green
- **AND** all bars SHALL use the accent color at 40% opacity

### Requirement: Data source
The histogram data SHALL be calculated from localStorage game history.

#### Scenario: Data calculation
- **WHEN** the histogram renders
- **THEN** it SHALL read game results from localStorage
- **AND** it SHALL count the frequency of each guess count (1–6) from won games only
- **AND** losses (DNF) SHALL NOT be included in the distribution

#### Scenario: No data state
- **WHEN** the player has no completed games in localStorage
- **THEN** the histogram section SHALL display a "No data yet" message
- **AND** no bars SHALL be rendered

### Requirement: CSS-only implementation
The histogram SHALL be implemented with CSS only, without charting libraries.

#### Scenario: Bar rendering
- **WHEN** bars are rendered
- **THEN** each bar SHALL be a div with percentage-based width
- **AND** the maximum bar (highest frequency) SHALL fill 100% of the available width
- **AND** other bars SHALL scale proportionally
- **AND** bars with zero count SHALL show a minimal sliver (4px) for visual consistency

### Requirement: Internationalization
All histogram labels SHALL be translated.

#### Scenario: i18n keys
- **WHEN** the histogram renders
- **THEN** the section title SHALL use an i18n key (`profile.guessDistribution`)
- **AND** the empty state message SHALL use an i18n key (`profile.noDataYet`)
- **AND** keys SHALL be present in all 5 locale files (en, zh-TW, zh-CN, ja, ko)
