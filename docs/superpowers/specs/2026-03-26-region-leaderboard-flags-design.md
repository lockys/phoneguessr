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
- `POST /api/profile` extended to accept `region` alongside existing `displayName`
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

After changing `schema.ts`, run `npm run db:generate` to create the migration file, then `npm run db:migrate` to apply it.

---

## API

### Routing note

`vercel.json` rewrites `/api/profile/:path*` → `/api/profile`. All profile requests hit the single `POST` export in `api/profile.ts` — there is no pathname-based dispatch in the POST handler. No `vercel.json` changes needed.

`vercel.json` also rewrites `/api/leaderboard/:period` → `/api/leaderboard?period=:period`. No routing change needed for adding `region`.

### `POST /api/profile` (in `api/profile.ts`)

**Current state:** handler requires `displayName` in body and always updates it.

**New behavior:** make both fields optional with merge semantics. The new handler logic:

```ts
const body = await request.json() as { displayName?: string; region?: string | null };
const updates: { displayName?: string; region?: string | null } = {};

if ('displayName' in body) {
  const result = validateDisplayName(body.displayName);
  if (!result.valid) return Response.json({ error: result.error }, { status: 400 });
  updates.displayName = result.value;
}

if ('region' in body) {
  const r = body.region;
  if (r === null || r === '' || r === undefined) {
    updates.region = null;
  } else if (typeof r !== 'string' || !COUNTRY_CODES.includes(r.toUpperCase())) {
    return Response.json({ error: 'Invalid region code' }, { status: 400 });
  } else {
    updates.region = r.toUpperCase();
  }
}

if (Object.keys(updates).length === 0) {
  return Response.json({ success: true }); // no-op
}

await db.update(users).set(updates).where(eq(users.id, session.userId));
return Response.json({ success: true });
```

`COUNTRY_CODES` is imported from `../phoneguessr/src/lib/region.js`. This import path follows the existing pattern (`api/profile.ts` already imports from `'../phoneguessr/src/db/index.js'`). `region.ts` must not import React, i18next, or any browser-only dependency — it exports only pure data and functions.

### `GET /api/auth/me` (in `api/auth/me.ts`)

Add `region: users.region` to the `select({})` object. The existing pattern returns:

```json
{ "user": { "id": 1, "displayName": "calvinjeng", "avatarUrl": "...", "isAdmin": false } }
```

After change:

```json
{ "user": { "id": 1, "displayName": "calvinjeng", "avatarUrl": "...", "isAdmin": false, "region": "TW" } }
```

`region` is `string | null`. Fallback expression: `region: dbUser?.region ?? null` — there is no session-level region to fall back to (unlike `displayName`).

### `GET /api/leaderboard` (all tabs — `api/leaderboard.ts`)

Each entry in `entries[]` gains a `region` field (`string | null`):

**Daily entry:**
```json
{ "displayName": "calvinjeng", "region": "TW", "score": 950, "guessCount": 2, "avatarUrl": "..." }
```

**Aggregate (weekly/all-time) entry:**
```json
{ "displayName": "calvinjeng", "region": "TW", "totalWins": 42, "avatarUrl": "..." }
```

**Implementation:**
- Daily: add `region: users.region` to the `select({})` object; map `region` in the entries array
- Aggregate: add `region: users.region` to the `select({})` object; add `users.region` to `.groupBy(users.id, users.displayName, users.avatarUrl)` — PostgreSQL requires all non-aggregate selected columns in `GROUP BY`; map `region` in the entries array

---

## Frontend

### `phoneguessr/src/lib/region.ts` (new file)

Pure TypeScript — no React, no i18next imports.

**Exports:**

```ts
export function countryCodeToFlag(code: string | null | undefined): string {
  if (!code || code.length !== 2) return '';
  const upper = code.toUpperCase();
  return [...upper]
    .map(c => String.fromCodePoint(c.charCodeAt(0) - 65 + 0x1f1e6))
    .join('');
}

// 249 entries, sorted alphabetically by name, sourced from ISO 3166-1
// (use the list from https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)
export const COUNTRY_LIST: { code: string; name: string }[] = [
  { code: 'AF', name: 'Afghanistan' },
  // ... all 249 entries ...
  { code: 'ZW', name: 'Zimbabwe' },
];

// Derived from COUNTRY_LIST — single source of truth for API validation
export const COUNTRY_CODES: string[] = COUNTRY_LIST.map(c => c.code);
```

Codes are uppercase 2-letter strings. Include `TW` (Taiwan) and `XK` (Kosovo) as they are commonly used codes.

### `phoneguessr/src/lib/auth-context.tsx`

Add `region?: string | null` to the `User` interface.

### ProfilePanel (`phoneguessr/src/components/ProfilePanel.tsx`)

Add Region `<select>` below the Language selector, same full-width style.

```tsx
import { COUNTRY_LIST, countryCodeToFlag } from '@/lib/region';

// In the form:
<div>
  <label>{t('profile.region')}</label>
  <select
    value={regionValue}          // local state, initialized from user.region ?? ''
    onChange={e => setRegionValue(e.target.value)}
  >
    <option value="">— No region —</option>
    {COUNTRY_LIST.map(c => (
      <option key={c.code} value={c.code}>
        {countryCodeToFlag(c.code)} {c.name}
      </option>
    ))}
  </select>
</div>
```

On save: the existing `handleSave` always sends both `displayName` and `region` in the POST body:

```ts
body: JSON.stringify({
  displayName: displayNameValue,
  region: regionValue === '' ? null : regionValue,
})
```

This is safe because the API uses merge semantics — sending the same displayName as before is a no-op update. Initial `regionValue` state: `user?.region ?? ''`.

### Leaderboard (`phoneguessr/src/components/Leaderboard.tsx`)

**Update interfaces** (both need `region` and `avatarUrl` — `avatarUrl` is already in the API response but missing from the TS interfaces):

```ts
interface DailyEntry {
  rank: number;
  displayName: string;
  region: string | null;
  score: number;
  guessCount: number;
  avatarUrl: string | null;
}

interface AggregateEntry {
  rank: number;
  displayName: string;
  region: string | null;
  totalWins: number;
  avatarUrl: string | null;
}
```

**Render the flag** before displayName:

```tsx
import { countryCodeToFlag } from '@/lib/region';

// In the entry render:
const flag = countryCodeToFlag(entry.region);
<span>{flag ? `${flag} ` : ''}{entry.displayName}</span>
```

### i18n

Add `profile.region` to all 5 locale files:

| File | Key | Value |
|------|-----|-------|
| `phoneguessr/src/locales/en.json` | `profile.region` | `"Region"` |
| `phoneguessr/src/locales/zh-TW.json` | `profile.region` | `"地區"` |
| `phoneguessr/src/locales/zh-CN.json` | `profile.region` | `"地区"` |
| `phoneguessr/src/locales/ja.json` | `profile.region` | `"地域"` |
| `phoneguessr/src/locales/ko.json` | `profile.region` | `"지역"` |

---

## Testing

### `phoneguessr/src/lib/region.test.ts`

Unit tests for `countryCodeToFlag`:
- `countryCodeToFlag('TW')` → `'🇹🇼'`
- `countryCodeToFlag('US')` → `'🇺🇸'`
- `countryCodeToFlag(null)` → `''`
- `countryCodeToFlag(undefined)` → `''`
- `countryCodeToFlag('')` → `''`
- `countryCodeToFlag('USA')` → `''` (wrong length)
- `countryCodeToFlag('tw')` → `'🇹🇼'` (lowercase normalized)

Also test `COUNTRY_CODES` contains `'TW'`, `'US'`, `'XK'` and does not contain `''`.

### `phoneguessr/tests/profile-handler.test.ts` (new or existing)

Using the mock-db queue pattern (same as other handler tests):

- `POST` with `{ region: 'TW' }` → 200 success, db.update called with `{ region: 'TW' }`
- `POST` with `{ region: '' }` → 200 success, db.update called with `{ region: null }`
- `POST` with `{ region: null }` → 200 success, db.update called with `{ region: null }`
- `POST` with `{ region: 'XX' }` (invalid code) → 400
- `POST` with `{}` (no fields) → 200 success, db.update NOT called
- `POST` with `{ displayName: 'foo', region: 'TW' }` → 200, both fields updated

---

## Modified Files

| Action | File | Change |
|--------|------|--------|
| Modify | `phoneguessr/src/db/schema.ts` | Add `region` column to users |
| Create | `phoneguessr/drizzle/<timestamp>_add_region.sql` | Migration (auto-generated) |
| Create | `phoneguessr/src/lib/region.ts` | `countryCodeToFlag`, `COUNTRY_LIST`, `COUNTRY_CODES` |
| Create | `phoneguessr/src/lib/region.test.ts` | Unit tests for countryCodeToFlag |
| Modify | `api/profile.ts` | Make both fields optional; add region validation + update |
| Modify | `api/auth/me.ts` | Select + return `users.region` |
| Modify | `api/leaderboard.ts` | Select `users.region`; add to GROUP BY; include in response |
| Modify | `phoneguessr/src/lib/auth-context.tsx` | Add `region?: string \| null` to `User` interface |
| Modify | `phoneguessr/src/components/ProfilePanel.tsx` | Add Region selector, update handleSave |
| Modify | `phoneguessr/src/components/Leaderboard.tsx` | Update interfaces; render flag before displayName |
| Modify | `phoneguessr/src/locales/en.json` | Add `profile.region` |
| Modify | `phoneguessr/src/locales/zh-TW.json` | Add `profile.region` |
| Modify | `phoneguessr/src/locales/zh-CN.json` | Add `profile.region` |
| Modify | `phoneguessr/src/locales/ja.json` | Add `profile.region` |
| Modify | `phoneguessr/src/locales/ko.json` | Add `profile.region` |

---

## Error Handling

| Scenario | Behaviour |
|----------|-----------|
| Invalid region code in POST | `400 { "error": "Invalid region code" }` |
| Region not set | No flag shown; no error |
| Flag emoji not supported (old device) | Falls back to blank — graceful |
