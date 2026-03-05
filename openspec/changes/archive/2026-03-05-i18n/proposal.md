## Why

PhoneGuessr targets a global audience but all UI text is hardcoded in English. Adding i18n support for East Asian languages (Traditional Chinese, Simplified Chinese, Japanese, Korean) significantly expands the potential player base.

## What Changes

- Install `i18next` and `react-i18next` for translation infrastructure
- Create locale files for 5 languages: `en`, `zh-TW`, `zh-CN`, `ja`, `ko`
- Extract ~40 hardcoded strings from 8 component files into translation keys
- Add language selector UI in the app header
- Auto-detect browser language with fallback to English
- Persist language preference in localStorage

## Capabilities

### New Capabilities

- `i18n-framework`: Translation infrastructure, locale files, language detection, and persistence
- `language-selector`: UI control for switching languages

### Modified Capabilities

(none — this is purely additive; no existing spec-level behavior changes)

## Impact

- All components with user-facing text (~8 files): replace hardcoded strings with `t()` calls
- `src/routes/page.tsx`: i18n provider setup
- `package.json`: new deps (`i18next`, `react-i18next`, `i18next-browser-languagedetector`)
- New locale files: `src/locales/{en,zh-TW,zh-CN,ja,ko}.json`
