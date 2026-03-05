## ADDED Requirements

### Requirement: Language selector UI
The system SHALL provide a language selector control in the app header for manual language switching.

#### Scenario: Selector visibility
- **WHEN** the app renders
- **THEN** a language selector SHALL be visible in the app header area

#### Scenario: Switching language
- **WHEN** a user selects a different language from the selector
- **THEN** all UI text SHALL immediately update to the selected language
- **AND** the preference SHALL be persisted to localStorage

#### Scenario: Current language indicated
- **WHEN** the language selector is displayed
- **THEN** the currently active language SHALL be visually indicated
