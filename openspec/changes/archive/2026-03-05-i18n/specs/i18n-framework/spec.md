## ADDED Requirements

### Requirement: Multi-language support
The system SHALL support 5 languages: English (`en`), Traditional Chinese (`zh-TW`), Simplified Chinese (`zh-CN`), Japanese (`ja`), and Korean (`ko`).

#### Scenario: All UI text is translatable
- **WHEN** the app renders in any supported language
- **THEN** all user-facing text strings SHALL be sourced from locale files, not hardcoded

#### Scenario: Complete translations per language
- **WHEN** a locale file exists for a language
- **THEN** it SHALL contain translations for all UI strings used in the application

### Requirement: Browser language detection
The system SHALL auto-detect the user's preferred language from the browser on first visit.

#### Scenario: Supported language detected
- **WHEN** the browser's language preference matches a supported locale
- **THEN** the app SHALL render in that language

#### Scenario: Unsupported language detected
- **WHEN** the browser's language preference does not match any supported locale
- **THEN** the app SHALL fall back to English (`en`)

### Requirement: Language preference persistence
The system SHALL persist the user's language choice in localStorage.

#### Scenario: Language preference saved
- **WHEN** a user selects a language
- **THEN** the choice SHALL be stored in localStorage

#### Scenario: Language preference restored
- **WHEN** the user revisits the app
- **THEN** the app SHALL use the stored language preference, overriding browser detection
