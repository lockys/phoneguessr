## MODIFIED Requirements

### Requirement: Language selector UI
The system SHALL provide a language selector control in the Profile panel for manual language switching.

#### Scenario: Selector location
- **WHEN** the app renders
- **THEN** the language selector SHALL be located in the Profile panel, not in the app header

#### Scenario: Switching language
- **WHEN** a user selects a different language from the selector
- **THEN** all UI text SHALL immediately update to the selected language
- **AND** the preference SHALL be persisted to localStorage

#### Scenario: Current language indicated
- **WHEN** the language selector is displayed
- **THEN** the currently active language SHALL be visually indicated
