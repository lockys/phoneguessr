## 1. Setup

- [x] 1.1 Install `i18next`, `react-i18next`, `i18next-browser-languagedetector`
- [x] 1.2 Create i18n config file (`src/i18n.ts`): initialize i18next with language detector, localStorage persistence key `phoneguessr_lang`, fallback `en`
- [x] 1.3 Import i18n config in app entry point and wrap app with I18nextProvider

## 2. Locale Files

- [x] 2.1 Create `src/locales/en.json` with all ~40 English strings organized by component
- [x] 2.2 Create `src/locales/zh-TW.json` (Traditional Chinese translations)
- [x] 2.3 Create `src/locales/zh-CN.json` (Simplified Chinese translations)
- [x] 2.4 Create `src/locales/ja.json` (Japanese translations)
- [x] 2.5 Create `src/locales/ko.json` (Korean translations)

## 3. Component String Extraction

- [x] 3.1 Update Game.tsx: replace hardcoded strings with `t()` calls
- [x] 3.2 Update AuthButton.tsx: replace hardcoded strings with `t()` calls
- [x] 3.3 Update ResultModal.tsx: replace hardcoded strings with `t()` calls
- [x] 3.4 Update GuessHistory.tsx: replace hardcoded strings with `t()` calls
- [x] 3.5 Update PhoneAutocomplete.tsx: replace placeholder with `t()` call
- [x] 3.6 Update ProfilePanel.tsx: replace hardcoded strings with `t()` calls
- [x] 3.7 Update Leaderboard.tsx: replace hardcoded strings with `t()` calls
- [x] 3.8 Update AboutPanel.tsx: replace hardcoded strings with `t()` calls
- [x] 3.9 Update SwipeContainer.tsx: replace panel names with `t()` calls
- [x] 3.10 Update CropReveal.tsx: replace alt text with `t()` call

## 4. Language Selector

- [x] 4.1 Create LanguageSelector component (compact dropdown in header showing current language)
- [x] 4.2 Add LanguageSelector to app header in page.tsx
- [x] 4.3 Add CSS styles for language selector

## 5. Verification

- [x] 5.1 Verify all 5 languages render correctly with no missing keys
- [x] 5.2 Verify language auto-detection from browser settings
- [x] 5.3 Verify language persists across page reloads via localStorage
- [x] 5.4 Verify build passes with no TypeScript errors
