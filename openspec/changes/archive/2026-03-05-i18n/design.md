## Context

PhoneGuessr has ~40 hardcoded English strings across 8 component files. The app targets a global audience, especially East Asian markets. No i18n infrastructure exists currently.

## Goals / Non-Goals

**Goals:**
- Support 5 languages: English, Traditional Chinese, Simplified Chinese, Japanese, Korean
- Auto-detect browser language preference
- Allow manual language switching via UI
- Persist language choice in localStorage

**Non-Goals:**
- Translating phone names (they stay in English as brand names)
- RTL language support
- Server-side locale negotiation
- Translating meta tags dynamically (SEO is secondary for a game)

## Decisions

### 1. i18next + react-i18next
**Decision**: Use `i18next` with `react-i18next` bindings and `i18next-browser-languagedetector` for detection.

**Rationale**: i18next is the most widely used i18n library in the React ecosystem with excellent TypeScript support. `react-i18next` provides the `useTranslation` hook which fits our functional component style. Alternatives like `react-intl` are heavier and more opinionated.

### 2. JSON locale files with flat key structure
**Decision**: Store translations in `src/locales/{lang}.json` with dot-notation flat keys grouped by component (e.g., `game.loading`, `result.win`, `leaderboard.title`).

**Rationale**: Flat keys are simpler to search and maintain than nested objects. Grouping by component makes it easy to find which keys belong where.

### 3. Language selector in app header
**Decision**: Add a compact language picker (dropdown or button group) in the app header next to the auth button.

**Rationale**: The header is always visible regardless of which panel is active. A small selector doesn't compete with game content.

### 4. Browser language detection with localStorage override
**Decision**: On first visit, detect browser language via `i18next-browser-languagedetector`. Store selection in localStorage key `phoneguessr_lang`. Subsequent visits use the stored preference.

**Rationale**: Auto-detection gives a good default experience. localStorage persistence means the choice survives page reloads without requiring auth.

## Risks / Trade-offs

- **Translation accuracy** → Initial translations will be AI-generated. Native speaker review recommended before launch. Clearly non-blocking for development.
- **Bundle size** → JSON locale files are small (~2-3KB each). i18next adds ~15KB gzipped. Acceptable for the benefit.
- **String extraction completeness** → Must audit all components carefully. Use grep for remaining hardcoded strings after implementation.
