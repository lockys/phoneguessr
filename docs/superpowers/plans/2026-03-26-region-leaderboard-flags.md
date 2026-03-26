# Region Selection & Leaderboard Flags Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users optionally pick a region (country) in their profile; show the corresponding flag emoji before their name on all leaderboard tabs.

**Architecture:** A new `region.ts` utility holds the country list and flag conversion. The `users` table gains a nullable `region` varchar(2) column. Three API handlers (me, profile, leaderboard) are updated to include region. ProfilePanel adds a Region `<select>` and Leaderboard renders the flag.

**Tech Stack:** TypeScript, React 19, Drizzle ORM (PostgreSQL), Vercel serverless functions, Vitest + @testing-library/react, Biome linter.

**Spec:** `docs/superpowers/specs/2026-03-26-region-leaderboard-flags-design.md`

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `phoneguessr/src/lib/region.ts` | `countryCodeToFlag`, `COUNTRY_LIST`, `COUNTRY_CODES` |
| Create | `phoneguessr/src/lib/region.test.ts` | Unit tests for countryCodeToFlag |
| Modify | `phoneguessr/src/db/schema.ts` | Add `region` column to users table |
| Create | `phoneguessr/drizzle/<ts>_add_region.sql` | Migration (auto-generated) |
| Modify | `api/auth.ts` | Select + return `users.region` in `handleMe` |
| Modify | `api/profile.ts` | Accept + validate `region` in POST handler |
| Create | `phoneguessr/tests/profile-update.test.ts` | Tests for region validation in profile POST |
| Modify | `api/leaderboard.ts` | Join `users.region`; add to GROUP BY; include in response |
| Modify | `phoneguessr/src/lib/auth-context.tsx` | Add `region?: string \| null` to User interface |
| Modify | `phoneguessr/src/components/ProfilePanel.tsx` | Add region state + selector + update handleSave |
| Modify | `phoneguessr/src/components/Leaderboard.tsx` | Update interfaces; render flag before displayName |
| Modify | `phoneguessr/src/locales/en.json` | Add `profile.region` |
| Modify | `phoneguessr/src/locales/zh-TW.json` | Add `profile.region` |
| Modify | `phoneguessr/src/locales/zh-CN.json` | Add `profile.region` |
| Modify | `phoneguessr/src/locales/ja.json` | Add `profile.region` |
| Modify | `phoneguessr/src/locales/ko.json` | Add `profile.region` |

---

## Task 1: region.ts utility + unit tests

**Files:**
- Create: `phoneguessr/src/lib/region.ts`
- Create: `phoneguessr/src/lib/region.test.ts`

- [ ] **Step 1.1: Install `countries-list`**

```bash
cd /path/to/repo/phoneguessr && npm install countries-list
```

`countries-list` is a zero-dependency package (~16KB) that exports a typed map of all ISO 3166-1 alpha-2 country codes and names.

- [ ] **Step 1.2: Write the failing tests first**

Create `phoneguessr/src/lib/region.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { COUNTRY_CODES, COUNTRY_LIST, countryCodeToFlag } from './region';

describe('countryCodeToFlag', () => {
  it('converts TW to Taiwan flag', () => {
    expect(countryCodeToFlag('TW')).toBe('🇹🇼');
  });

  it('converts US to US flag', () => {
    expect(countryCodeToFlag('US')).toBe('🇺🇸');
  });

  it('converts JP to Japan flag', () => {
    expect(countryCodeToFlag('JP')).toBe('🇯🇵');
  });

  it('lowercases input correctly', () => {
    expect(countryCodeToFlag('tw')).toBe('🇹🇼');
  });

  it('returns empty string for null', () => {
    expect(countryCodeToFlag(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(countryCodeToFlag(undefined)).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(countryCodeToFlag('')).toBe('');
  });

  it('returns empty string for 3-letter code', () => {
    expect(countryCodeToFlag('USA')).toBe('');
  });
});

describe('COUNTRY_LIST', () => {
  it('is sorted alphabetically by name', () => {
    expect(COUNTRY_LIST[0].name < COUNTRY_LIST[1].name).toBe(true);
  });

  it('contains Taiwan', () => {
    expect(COUNTRY_LIST.some(c => c.code === 'TW')).toBe(true);
  });

  it('contains United States', () => {
    expect(COUNTRY_LIST.some(c => c.code === 'US')).toBe(true);
  });

  it('all codes are 2 uppercase letters', () => {
    for (const c of COUNTRY_LIST) {
      expect(c.code).toMatch(/^[A-Z]{2}$/);
    }
  });
});

describe('COUNTRY_CODES', () => {
  it('is derived from COUNTRY_LIST', () => {
    expect(COUNTRY_CODES).toEqual(COUNTRY_LIST.map(c => c.code));
  });

  it('contains TW', () => {
    expect(COUNTRY_CODES.includes('TW')).toBe(true);
  });
});
```

- [ ] **Step 1.3: Run tests — expect FAIL (file doesn't exist yet)**

```bash
cd phoneguessr && npx vitest run src/lib/region.test.ts 2>&1 | head -10
```

Expected: error about missing module.

- [ ] **Step 1.4: Create `phoneguessr/src/lib/region.ts`**

```ts
import { countries } from 'countries-list';

export function countryCodeToFlag(code: string | null | undefined): string {
  if (!code || code.length !== 2) return '';
  const upper = code.toUpperCase();
  return [...upper]
    .map(c => String.fromCodePoint(c.charCodeAt(0) - 65 + 0x1f1e6))
    .join('');
}

export const COUNTRY_LIST: { code: string; name: string }[] = (
  Object.entries(countries) as [string, { name: string }][]
)
  .map(([code, country]) => ({ code, name: country.name }))
  .sort((a, b) => a.name.localeCompare(b.name));

export const COUNTRY_CODES: string[] = COUNTRY_LIST.map(c => c.code);
```

- [ ] **Step 1.5: Run tests — expect all pass**

```bash
cd phoneguessr && npx vitest run src/lib/region.test.ts --reporter=verbose 2>&1 | grep -E "✓|✗|PASS|FAIL"
```

Expected: all 12 tests pass.

- [ ] **Step 1.6: Lint**

```bash
cd phoneguessr && npx biome check src/lib/region.ts src/lib/region.test.ts
```

Fix any issues.

- [ ] **Step 1.7: Commit**

```bash
git add phoneguessr/src/lib/region.ts phoneguessr/src/lib/region.test.ts phoneguessr/package.json phoneguessr/package-lock.json
git commit -m "feat(region): add countryCodeToFlag utility and country list"
```

---

## Task 2: DB schema + migration

**Files:**
- Modify: `phoneguessr/src/db/schema.ts`

- [ ] **Step 2.1: Add `region` column to users table**

In `phoneguessr/src/db/schema.ts`, find the `users` pgTable definition. It currently ends with:

```ts
  isAdmin: boolean('is_admin').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
```

Add `region` before `createdAt`:

```ts
  isAdmin: boolean('is_admin').notNull().default(false),
  region: varchar('region', { length: 2 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
```

`region` is nullable with no default — existing rows will have `null`.

- [ ] **Step 2.2: Generate the migration**

```bash
cd phoneguessr && npm run db:generate
```

This creates a new file in `phoneguessr/drizzle/` with an `ALTER TABLE users ADD COLUMN region varchar(2)` statement. Verify the generated SQL looks correct.

- [ ] **Step 2.3: Apply the migration**

```bash
cd phoneguessr && npm run db:migrate
```

Expected: migration applies without error.

- [ ] **Step 2.4: Lint**

```bash
cd phoneguessr && npx biome check src/db/schema.ts
```

- [ ] **Step 2.5: Commit**

```bash
git add phoneguessr/src/db/schema.ts phoneguessr/drizzle/
git commit -m "feat(region): add region column to users table"
```

---

## Task 3: API — auth/me includes region

**Files:**
- Modify: `api/auth.ts`

`/api/auth/me` is handled by the private `handleMe` function inside `api/auth.ts` (line 67). There is no separate `api/auth/me.ts` file. The current `select({})` only fetches `displayName`, `avatarUrl`, `isAdmin`. Add `region`.

- [ ] **Step 3.1: Modify `handleMe` in `api/auth.ts`**

Find the `db.select({...}).from(users)` block inside `handleMe` (around line 74). Change:

```ts
  const [dbUser] = await db
    .select({
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      isAdmin: users.isAdmin,
    })
```

To:

```ts
  const [dbUser] = await db
    .select({
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      isAdmin: users.isAdmin,
      region: users.region,
    })
```

Then update the `return Response.json({ user: { ... } })` inside `handleMe` to include region:

```ts
  return Response.json({
    user: {
      id: session.userId,
      displayName: dbUser?.displayName ?? session.displayName,
      avatarUrl: dbUser?.avatarUrl ?? session.avatarUrl,
      email: session.email ?? null,
      isAdmin: dbUser?.isAdmin ?? false,
      region: dbUser?.region ?? null,
    },
  });
```

- [ ] **Step 3.2: Lint**

```bash
cd phoneguessr && npx biome check ../api/auth.ts
```

- [ ] **Step 3.3: Run existing tests**

```bash
cd phoneguessr && npm run test 2>&1 | tail -5
```

Expected: all tests that were passing before still pass.

- [ ] **Step 3.4: Commit**

```bash
git add api/auth.ts
git commit -m "feat(region): include region in auth/me response"
```

---

## Task 4: API — `POST /api/profile` accepts region

**Files:**
- Modify: `api/profile.ts`
- Create: `phoneguessr/tests/profile-update.test.ts`

**Mock queue order:** The POST handler calls `getAuth` (reads cookie + verifies JWT — no DB query) then `db.update` (1 query). So: 0 `mockDb` queries for auth, 1 for the update. Tests that reach the update need 1 `mockDb.mockQuery(...)`.

- [ ] **Step 4.1: Write failing tests**

Create `phoneguessr/tests/profile-update.test.ts`:

```ts
// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockDb } from '../src/test/mock-db.js';

const mockDb = createMockDb();
vi.mock('../src/db/index.js', () => ({ db: mockDb }));

const mockVerifySessionToken = vi.fn();
vi.mock('../src/lib/auth.js', () => ({
  COOKIE_NAME: 'phoneguessr_session',
  verifySessionToken: mockVerifySessionToken,
}));

const { POST } = await import('../../api/profile.js');

const SESSION = { userId: 1, googleId: 'g1', displayName: 'Test' };

function makeReq(body: object) {
  return new Request('http://localhost/api/profile/update', {
    method: 'POST',
    headers: {
      cookie: 'phoneguessr_session=valid',
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

describe('POST /api/profile — region field', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.reset();
    mockVerifySessionToken.mockResolvedValue(SESSION);
  });

  it('returns 401 when not authenticated', async () => {
    mockVerifySessionToken.mockResolvedValueOnce(null);
    const res = await POST(makeReq({ region: 'TW' }));
    expect(res.status).toBe(401);
  });

  it('saves valid region code', async () => {
    mockDb.mockQuery([]);  // db.update returns empty (no .returning())
    const res = await POST(makeReq({ region: 'TW' }));
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
    expect(mockDb.update).toHaveBeenCalledOnce();
  });

  it('normalizes region code to uppercase before saving', async () => {
    mockDb.mockQuery([]);
    const res = await POST(makeReq({ region: 'tw' }));
    expect(res.status).toBe(200);
  });

  it('clears region when null is sent', async () => {
    mockDb.mockQuery([]);
    const res = await POST(makeReq({ region: null }));
    expect(res.status).toBe(200);
    expect(mockDb.update).toHaveBeenCalledOnce();
  });

  it('clears region when empty string is sent', async () => {
    mockDb.mockQuery([]);
    const res = await POST(makeReq({ region: '' }));
    expect(res.status).toBe(200);
  });

  it('returns 400 for invalid region code', async () => {
    const res = await POST(makeReq({ region: 'XX' }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/region/i);
  });

  it('returns 400 for 3-letter code', async () => {
    const res = await POST(makeReq({ region: 'USA' }));
    expect(res.status).toBe(400);
  });

  it('no-op success when body is empty object', async () => {
    const res = await POST(makeReq({}));
    expect(res.status).toBe(200);
    expect(mockDb.update).not.toHaveBeenCalled();
  });

  it('saves both displayName and region together', async () => {
    mockDb.mockQuery([]);
    const res = await POST(makeReq({ displayName: 'NewName', region: 'JP' }));
    expect(res.status).toBe(200);
    expect(mockDb.update).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 4.2: Run tests — expect FAIL**

```bash
cd phoneguessr && npx vitest run tests/profile-update.test.ts 2>&1 | head -15
```

Expected: failures (handler doesn't support region yet).

- [ ] **Step 4.3: Update `api/profile.ts` POST handler**

Replace the entire `export async function POST` with:

```ts
export async function POST(request: Request) {
  const session = await getAuth(request);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as {
    displayName?: string;
    region?: string | null;
  };
  const updates: { displayName?: string; region?: string | null } = {};

  if ('displayName' in body) {
    const result = validateDisplayName(body.displayName);
    if (!result.valid) {
      return Response.json({ error: result.error }, { status: 400 });
    }
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
    return Response.json({ success: true });
  }

  await db.update(users).set(updates).where(eq(users.id, session.userId));
  return Response.json({ success: true });
}
```

Also add the import at the top of `api/profile.ts` (alongside existing imports):

```ts
import { COUNTRY_CODES } from '../phoneguessr/src/lib/region.js';
```

- [ ] **Step 4.4: Run tests — expect all pass**

```bash
cd phoneguessr && npx vitest run tests/profile-update.test.ts --reporter=verbose 2>&1 | grep -E "✓|✗|PASS|FAIL"
```

Expected: all 9 tests pass.

- [ ] **Step 4.5: Lint**

```bash
cd phoneguessr && npx biome check ../api/profile.ts tests/profile-update.test.ts
```

- [ ] **Step 4.6: Commit**

```bash
git add api/profile.ts phoneguessr/tests/profile-update.test.ts
git commit -m "feat(region): accept region field in profile POST handler"
```

---

## Task 5: API — leaderboard includes region

**Files:**
- Modify: `api/leaderboard.ts`

Add `region: users.region` to both the daily and aggregate leaderboard queries, and include it in the response entries. The aggregate query also needs `users.region` added to the `groupBy` clause (PostgreSQL requires all non-aggregate selected columns in GROUP BY).

- [ ] **Step 5.1: Update daily leaderboard query**

In `getDailyLeaderboard()`, change the `db.select({...})` to:

```ts
  const entries = await db
    .select({
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      region: users.region,
      score: results.score,
      guessCount: results.guessCount,
    })
```

And update the `.map()` in the return:

```ts
  return Response.json({
    entries: entries.map((e, i) => ({
      rank: i + 1,
      displayName: e.displayName,
      avatarUrl: e.avatarUrl,
      region: e.region,
      score: e.score,
      guessCount: e.guessCount,
    })),
  });
```

- [ ] **Step 5.2: Update aggregate leaderboard query**

In `getAggregateLeaderboard()`, change the `db.select({...})` to:

```ts
  const entries = await db
    .select({
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      region: users.region,
      totalWins: sql<number>`count(*)`.as('total_wins'),
    })
```

Change `.groupBy(users.id, users.displayName, users.avatarUrl)` to:

```ts
    .groupBy(users.id, users.displayName, users.avatarUrl, users.region)
```

Update the `.map()`:

```ts
  return Response.json({
    entries: entries.map((e, i) => ({
      rank: i + 1,
      displayName: e.displayName,
      avatarUrl: e.avatarUrl,
      region: e.region,
      totalWins: e.totalWins,
    })),
  });
```

- [ ] **Step 5.3: Lint**

```bash
cd phoneguessr && npx biome check ../api/leaderboard.ts
```

- [ ] **Step 5.4: Run full test suite**

```bash
cd phoneguessr && npm run test 2>&1 | tail -5
```

Expected: all tests pass.

- [ ] **Step 5.5: Commit**

```bash
git add api/leaderboard.ts
git commit -m "feat(region): include region in leaderboard responses"
```

---

## Task 6: Frontend — User interface + i18n keys

**Files:**
- Modify: `phoneguessr/src/lib/auth-context.tsx`
- Modify: `phoneguessr/src/locales/en.json`
- Modify: `phoneguessr/src/locales/zh-TW.json`
- Modify: `phoneguessr/src/locales/zh-CN.json`
- Modify: `phoneguessr/src/locales/ja.json`
- Modify: `phoneguessr/src/locales/ko.json`

These are small, low-risk changes — bundle them in one commit.

- [ ] **Step 6.1: Add `region` to User interface in `auth-context.tsx`**

Find the `interface User` (or `type User`) definition. Add `region?: string | null`:

```ts
interface User {
  id: number;
  displayName: string;
  avatarUrl?: string;
  email?: string | null;
  isAdmin?: boolean;
  region?: string | null;   // ADD THIS
}
```

- [ ] **Step 6.2: Add `profile.region` to all 5 locale files**

In `phoneguessr/src/locales/en.json`, add inside the `profile` object (after `profile.language` is a good place):

```json
"region": "Region"
```

In `phoneguessr/src/locales/zh-TW.json`:
```json
"region": "地區"
```

In `phoneguessr/src/locales/zh-CN.json`:
```json
"region": "地区"
```

In `phoneguessr/src/locales/ja.json`:
```json
"region": "地域"
```

In `phoneguessr/src/locales/ko.json`:
```json
"region": "지역"
```

- [ ] **Step 6.3: Lint**

```bash
cd phoneguessr && npx biome check src/lib/auth-context.tsx src/locales/
```

- [ ] **Step 6.4: Commit**

```bash
git add phoneguessr/src/lib/auth-context.tsx phoneguessr/src/locales/
git commit -m "feat(region): add region to User type and i18n keys"
```

---

## Task 7: Frontend — ProfilePanel region selector

**Files:**
- Modify: `phoneguessr/src/components/ProfilePanel.tsx`

- [ ] **Step 7.1: Add imports + state**

At the top of `ProfilePanel.tsx`, add the region import alongside existing imports:

```ts
import { COUNTRY_LIST, countryCodeToFlag } from '@/lib/region';
```

Inside `ProfilePanel()`, add a `regionValue` state after the existing state declarations:

```ts
const [regionValue, setRegionValue] = useState('');
```

- [ ] **Step 7.2: Initialize regionValue from user**

In the existing `useEffect` that initializes `displayName` from `user`, also initialize `regionValue`:

```ts
useEffect(() => {
  if (user) {
    setDisplayName(user.displayName || '');
    setRegionValue(user.region ?? '');   // ADD THIS LINE
    // ... rest of existing effect unchanged
  }
  // ...
}, [user]);
```

- [ ] **Step 7.3: Update `handleSave` to send region**

In `handleSave`, change the `body` to include `region`:

```ts
const handleSave = async () => {
  try {
    const res = await fetch('/api/profile/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        displayName,
        region: regionValue === '' ? null : regionValue,
      }),
    });
    if (res.ok) {
      await refreshUser();
    }
  } catch {
    /* mock mode - save locally */
  }
  setSaved(true);
  setTimeout(() => setSaved(false), 2000);
};
```

- [ ] **Step 7.4: Add Region selector to the form**

In the `{user && (...)}` form section, add the Region `<div>` right after the Language selector and before the Save button:

```tsx
<div className="profile-form-field">
  <label className="profile-form-label" htmlFor="profile-region">
    {t('profile.region')}
  </label>
  <select
    id="profile-region"
    className="profile-form-input"
    value={regionValue}
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

- [ ] **Step 7.5: Lint**

```bash
cd phoneguessr && npx biome check src/components/ProfilePanel.tsx
```

Fix any issues (Biome may warn about `useExhaustiveDependencies` if `regionValue` needs to be in a dep array — check and add if needed).

- [ ] **Step 7.6: Commit**

```bash
git add phoneguessr/src/components/ProfilePanel.tsx
git commit -m "feat(region): add region selector to profile panel"
```

---

## Task 8: Frontend — Leaderboard flag rendering

**Files:**
- Modify: `phoneguessr/src/components/Leaderboard.tsx`

- [ ] **Step 8.1: Add import**

At the top of `Leaderboard.tsx`, add:

```ts
import { countryCodeToFlag } from '@/lib/region';
```

- [ ] **Step 8.2: Update TypeScript interfaces**

Replace both interface definitions:

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

- [ ] **Step 8.3: Render flag before displayName**

Find the `<span className="lb-name">` render block. It currently starts with `{entry.displayName}`. Change it to prepend the flag:

```tsx
<span className="lb-name">
  {countryCodeToFlag(entry.region) ? `${countryCodeToFlag(entry.region)} ` : ''}
  {entry.displayName}
  {tab === 'all-time' && entry.rank === 1 && (
    <span className="lb-title"> · {t('leaderboard.title1')}</span>
  )}
  {tab === 'all-time' && entry.rank === 2 && (
    <span className="lb-title"> · {t('leaderboard.title2')}</span>
  )}
  {tab === 'all-time' && entry.rank === 3 && (
    <span className="lb-title"> · {t('leaderboard.title3')}</span>
  )}
</span>
```

- [ ] **Step 8.4: Lint**

```bash
cd phoneguessr && npx biome check src/components/Leaderboard.tsx
```

- [ ] **Step 8.5: Commit**

```bash
git add phoneguessr/src/components/Leaderboard.tsx
git commit -m "feat(region): render country flag on leaderboard entries"
```

---

## Task 9: Full suite + smoke test

- [ ] **Step 9.1: Run full test suite**

```bash
cd phoneguessr && npm run test 2>&1 | tail -10
```

All tests must pass. If any fail due to the new changes, fix them before continuing.

- [ ] **Step 9.2: Run lint**

```bash
cd phoneguessr && npm run lint
```

Fix any remaining lint issues.

- [ ] **Step 9.3: Build**

```bash
cd phoneguessr && npm run build 2>&1 | tail -15
```

Expected: clean build with no TypeScript errors.

- [ ] **Step 9.4: Commit any fixes**

If step 9.1–9.3 required changes:

```bash
git add -A
git commit -m "fix(region): resolve test/lint/build issues"
```

- [ ] **Step 9.5: Smoke test (manual)**

Start the dev server (`npm run dev` from repo root). Navigate to the profile page and verify:
- Region selector appears below Language
- Selecting a country and saving persists on refresh
- Leaderboard shows flag before names for users who have set a region
- Users without region show no flag (no placeholder)
