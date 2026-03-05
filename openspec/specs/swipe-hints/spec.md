## ADDED Requirements

### Requirement: Swipe navigation hints
The system SHALL display contextual navigation hints at the bottom edges of the screen showing the names of adjacent panels.

#### Scenario: Hints show adjacent panel names
- **WHEN** the user is on a panel with adjacent panels
- **THEN** a left hint SHALL show the name of the panel to the left (if any)
- **AND** a right hint SHALL show the name of the panel to the right (if any)

#### Scenario: Hints auto-fade
- **WHEN** the hints are displayed
- **THEN** they SHALL automatically fade out after a brief duration (~3 seconds)

#### Scenario: Hints appear on panel switch
- **WHEN** the user swipes to a different panel
- **THEN** the hints SHALL briefly reappear showing the new adjacent panel names

#### Scenario: No hint for non-existent adjacent panel
- **WHEN** the user is on the first panel
- **THEN** no left hint SHALL be displayed
- **AND** only the right hint SHALL be shown
