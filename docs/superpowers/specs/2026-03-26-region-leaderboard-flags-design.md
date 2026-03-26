# Region Selection & Leaderboard Flags — Design Spec

**Date:** 2026-03-26
**Status:** Approved

---

## Overview

Users can optionally set their region (country) in the profile personal info section. When set, a flag emoji is shown before their display name on all leaderboard tabs. Region is independent of the UI language setting.

---

## Scope

**In scope:**
- `region` column on `users` table (nullable ISO 3166-1 alpha-2 code)
- Region selector in ProfilePanel (below Language, same style)
- Flag emoji rendered before display name on leaderboard (all tabs)
- `POST /api/profile/update` extended to accept `region`
- `GET /api/auth/me` includes `region` in user object
- All three leaderboard tabs (daily, weekly, all-time) include `region` per entry
- i18n label for "Region" in all 5 locale files

**Out of scope:**
- Country-filtered leaderboard tab
- Auto-detecting region from IP or browser locale
- Translating country names (always English)
- Admin page changes

---

## Data Model

### Schema change: `users` table

Add column:

```ts
region: varchar('region', { length: 2 })  // nullable, no default
```

Stores ISO 3166-1 alpha-2 country code (e.g. `"TW"`, `"US"`, `"JP"`). Null means no region set — no flag shown on leaderboard.

### Migration

Generate via `npm run db:generate` after schema change, apply with `npm run db:migrate`.

---

## API

### `POST /api/profile/update`

**Extended request body:**
```json
{ "displayName": "string (optional)", "region": "string | null (optional)" }
```

**Validation for `region`:**
- If present and non-null: must be a 2-letter uppercase string in the whitelist of valid ISO 3166-1 alpha-2 codes
- Empty string `""` is treated as null (clears the region)
- Invalid code → `400 { "error": "Invalid region code" }`
- If omitted entirely: field is not updated (merge semantics, same as displayName)

**Success → `200 { "success": true }`**

The whitelist is a hardcoded array of ~249 ISO codes in the handler. No external dependency needed.

### `GET /api/auth/me`

Include `region` in the response alongside existing fields:

```json
{
  "userId": 1,
  "displayName": "calvinjeng",
  "avatarUrl": "...",
  "isAdmin": false,
  "region": "TW"
}
```

`region` is `string | null`.

### `GET /api/leaderboard` (all tabs)

Each entry in `entries[]` gains a `region` field:

**Daily entry:**
```json
{ "displayName": "calvinjeng", "region": "TW", "score": 950, "guessCount": 2, "avatarUrl": "..." }
```

**Weekly / All-time entry:**
```json
{ "displayName": "calvinjeng", "region": "TW", "totalWins": 42, "avatarUrl": "..." }
```

`region` is `string | null`. Leaderboard queries join `users.region` for each entry.

---

## Frontend

### Utility: `countryCodeToFlag(code: string | null | undefined): string`

Location: `phoneguessr/src/lib/region.ts`

Converts ISO alpha-2 country code to flag emoji using Regional Indicator Symbols:

```ts
export function countryCodeToFlag(code: string | null | undefined): string {
  if (!code || code.length !== 2) return '';
  const upper = code.toUpperCase();
  return [...upper]
    .map(c => String.fromCodePoint(c.charCodeAt(0) - 65 + 0x1f1e6))
    .join('');
}
```

Returns empty string when code is null/undefined/invalid — no flag shown for unset region.

Also export:

```ts
export const COUNTRY_LIST: { code: string; name: string }[]
```

A sorted array of `{ code, name }` for all ~249 ISO 3166-1 alpha-2 countries, used to populate the profile dropdown.

### `auth-context.tsx`

Add `region?: string | null` to the `User` interface.

### ProfilePanel

- Add a `<select>` for Region below the Language selector
- Same full-width style as Language: `width: 100%`, matching border/padding
- Options: first option is `{ value: '', label: '— No region —' }`, followed by `COUNTRY_LIST` entries rendered as `🇹🇼 Taiwan`
- Pre-fills from `user.region` on mount
- Saved via the existing Save button — `region` included in the `POST /api/profile/update` body alongside `displayName`
- Empty string selection → sends `region: null` to API

### Leaderboard

- Import `countryCodeToFlag` from `@/lib/region`
- For each entry with a `region`, render: `{countryCodeToFlag(entry.region)} {entry.displayName}`
- For entries with `region: null` or `region: undefined`, render just `{entry.displayName}` — no flag, no placeholder

### i18n

Add `profile.region` to all 5 locale files:

| Locale | Value |
|--------|-------|
| en | `"Region"` |
| zh-TW | `"地區"` |
| zh-CN | `"地区"` |
| ja | `"地域"` |
| ko | `"지역"` |

---

## Modified Files

| Action | File | Change |
|--------|------|--------|
| Modify | `phoneguessr/src/db/schema.ts` | Add `region` column to users |
| Create | `phoneguessr/drizzle/<timestamp>_add_region.sql` | Migration (auto-generated) |
| Create | `phoneguessr/src/lib/region.ts` | `countryCodeToFlag` + `COUNTRY_LIST` |
| Modify | `api/profile.ts` | Accept + validate `region` in update handler |
| Modify | `api/auth/me.ts` | Include `region` in response |
| Modify | `api/leaderboard.ts` | Join `users.region`, include in all entry shapes |
| Modify | `phoneguessr/src/lib/auth-context.tsx` | Add `region` to `User` interface |
| Modify | `phoneguessr/src/components/ProfilePanel.tsx` | Add Region selector |
| Modify | `phoneguessr/src/components/Leaderboard.tsx` | Render flag before displayName |
| Modify | `phoneguessr/src/locales/en.json` (×5) | Add `profile.region` key |

---

## Error Handling

| Scenario | Behaviour |
|----------|-----------|
| Invalid region code in PATCH | `400 { "error": "Invalid region code" }` |
| Region not set | No flag shown; no error |
| Flag emoji not supported (old device) | Falls back to 2-letter code or blank — graceful |
