## ADDED Requirements

### Requirement: About panel
The system SHALL provide an about panel accessible via swipe navigation that displays game information and credits.

#### Scenario: Viewing about page
- **WHEN** a player swipes to the about panel
- **THEN** the panel SHALL display: game title, game description, how-to-play rules, and author/credits information

#### Scenario: About page is static
- **WHEN** the about panel is rendered
- **THEN** all content SHALL be hardcoded in the component with no API calls required
