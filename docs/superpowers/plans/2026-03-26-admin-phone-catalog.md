# Admin Phone Catalog Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an admin-only page at `/admin` that lists all phones in the catalog, supports search and pagination, and allows inline editing of brand/model/imageUrl and deletion.

**Architecture:** New serverless function `api/admin/phones.ts` handles GET/PATCH/DELETE using the same `requireAdmin` auth pattern as `api/admin/reset.ts` (JWT cookie → DB isAdmin check + ADMIN_EMAILS fallback). A new Modern.js route at `phoneguessr/src/routes/admin/page.tsx` renders the table UI with client-side search + pagination. Modern.js inherits the parent `routes/layout.tsx` for `routes/admin/page.tsx`, which means `AuthProvider` is active and `useAuth()` works without any extra setup.

**Tech Stack:** TypeScript, React 19, Drizzle ORM (PostgreSQL), Vitest + @testing-library/react, Biome linter, Vercel serverless functions.

**Spec:** `docs/superpowers/specs/2026-03-26-admin-phone-catalog-design.md`

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `phoneguessr/src/test/mock-db.ts` | Add `delete` method to mock (required for DELETE handler tests) |
| Create | `api/admin/phones.ts` | GET all phones, PATCH update, DELETE with puzzle guard |
| Create | `phoneguessr/tests/admin-phones-handler.test.ts` | API handler tests |
| Create | `phoneguessr/src/routes/admin/page.tsx` | Admin React page, auth guard, table + search + pagination |
| Create | `phoneguessr/src/routes/admin/admin.css` | Admin-specific styles |

---

## Task 1: Add `delete` to `createMockDb`

The existing `mock-db.ts` only has `select`, `insert`, `update`. The DELETE handler calls `db.delete(...)`, which would throw `TypeError: mockDb.delete is not a function`. Add it before writing any DELETE tests.

**Files:**
- Modify: `phoneguessr/src/test/mock-db.ts`

- [ ] **Step 1.1: Add `delete` to the mock db object**

In `phoneguessr/src/test/mock-db.ts`, find the `db` object definition (around line 62) and add `delete` alongside the existing methods:

```ts
const db = {
  select: vi.fn((..._args: unknown[]) => makeChain(queue)),
  insert: vi.fn((..._args: unknown[]) => makeChain(queue)),
  update: vi.fn((..._args: unknown[]) => makeChain(queue)),
  delete: vi.fn((..._args: unknown[]) => makeChain(queue)),  // ADD THIS LINE
  // ... rest of the object unchanged
```

- [ ] **Step 1.2: Lint**

```bash
cd phoneguessr && npx biome check src/test/mock-db.ts
```

- [ ] **Step 1.3: Verify existing tests still pass**

```bash
cd phoneguessr && npm run test 2>&1 | tail -5
```
Expected: all existing tests pass.

- [ ] **Step 1.4: Commit**

```bash
git add phoneguessr/src/test/mock-db.ts
git commit -m "test: add delete method to createMockDb"
```

---

## Task 2: API — GET `/api/admin/phones`

**Files:**
- Create: `api/admin/phones.ts`
- Create: `phoneguessr/tests/admin-phones-handler.test.ts`

**Mock queue order for GET tests:** every request hits `requireAdmin` which does exactly one DB query (`SELECT isAdmin, email FROM users WHERE id = session.userId`), then GET does one more (`SELECT ... FROM phones`). So each test that reaches the phone query needs two `mockDb.mockQuery(...)` calls enqueued in order: `[userRow]` then `[phoneRows]`.

- [ ] **Step 2.1: Create the test file**

```ts
// phoneguessr/tests/admin-phones-handler.test.ts
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

const { GET, PATCH, DELETE: DEL } = await import('../../api/admin/phones.js');

const ADMIN_USER = { userId: 1, googleId: 'g1', displayName: 'Admin' };
const ADMIN_DB_ROW = { isAdmin: true, email: 'admin@test.com' };
const NON_ADMIN_DB_ROW = { isAdmin: false, email: 'user@test.com' };

function makeReq(method: string, url: string, body?: object) {
  return new Request(url, {
    method,
    headers: {
      cookie: 'phoneguessr_session=valid',
      'content-type': 'application/json',
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

describe('GET /api/admin/phones', () => {
  beforeEach(() => { vi.clearAllMocks(); mockDb.reset(); });

  it('returns 403 when no session cookie', async () => {
    mockVerifySessionToken.mockResolvedValueOnce(null);
    const res = await GET(new Request('http://localhost/api/admin/phones'));
    expect(res.status).toBe(403);
  });

  it('returns 403 when user is not admin and not in ADMIN_EMAILS', async () => {
    mockVerifySessionToken.mockResolvedValueOnce(ADMIN_USER);
    // Queue: 1) requireAdmin user lookup
    mockDb.mockQuery(NON_ADMIN_DB_ROW);
    const res = await GET(makeReq('GET', 'http://localhost/api/admin/phones'));
    expect(res.status).toBe(403);
  });

  it('returns phone list for admin user', async () => {
    mockVerifySessionToken.mockResolvedValueOnce(ADMIN_USER);
    const phones = [
      { id: 1, brand: 'Apple', model: 'iPhone 15 Pro', imageUrl: 'https://img.jpg', active: true },
    ];
    // Queue: 1) requireAdmin user lookup, 2) phones SELECT
    mockDb.mockQuery(ADMIN_DB_ROW);
    mockDb.mockQuery(phones);
    const res = await GET(makeReq('GET', 'http://localhost/api/admin/phones'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.phones).toEqual(phones);
    expect(body.total).toBe(1);
  });
});
```

- [ ] **Step 2.2: Run tests — expect import error (file doesn't exist yet)**

```bash
cd phoneguessr && npx vitest run tests/admin-phones-handler.test.ts 2>&1 | head -10
```

- [ ] **Step 2.3: Create `api/admin/phones.ts`**

```ts
import { eq } from 'drizzle-orm';
import { db } from '../../phoneguessr/src/db/index.js';
import {
  dailyPuzzles,
  phones,
  users,
} from '../../phoneguessr/src/db/schema.js';
import {
  COOKIE_NAME,
  verifySessionToken,
} from '../../phoneguessr/src/lib/auth.js';
import { parseCookies } from '../../phoneguessr/src/lib/cookies.js';

const ADMIN_EMAILS = ['locky4567@gmail.com'];

async function requireAdmin(request: Request) {
  const token = parseCookies(request.headers.get('cookie') ?? '')[COOKIE_NAME];
  if (!token) return null;

  const session = await verifySessionToken(token);
  if (!session) return null;

  const [user] = await db
    .select({ isAdmin: users.isAdmin, email: users.email })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  if (!user?.isAdmin && !ADMIN_EMAILS.includes(user?.email ?? '')) {
    return null;
  }

  return session;
}

export async function GET(request: Request): Promise<Response> {
  const admin = await requireAdmin(request);
  if (!admin) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const rows = await db
    .select({
      id: phones.id,
      brand: phones.brand,
      model: phones.model,
      imageUrl: phones.imageUrl,
      active: phones.active,
    })
    .from(phones)
    .orderBy(phones.brand, phones.model);

  return Response.json({ phones: rows, total: rows.length });
}

export async function PATCH(request: Request): Promise<Response> {
  return Response.json({ error: 'Not implemented' }, { status: 501 });
}

export async function DELETE(request: Request): Promise<Response> {
  return Response.json({ error: 'Not implemented' }, { status: 501 });
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method === 'GET') return GET(request);
  if (request.method === 'PATCH') return PATCH(request);
  if (request.method === 'DELETE') return DELETE(request);
  return Response.json({ error: 'Method not allowed' }, { status: 405 });
}
```

- [ ] **Step 2.4: Run GET tests — expect pass**

```bash
cd phoneguessr && npx vitest run tests/admin-phones-handler.test.ts --reporter=verbose 2>&1 | grep -E "✓|✗|PASS|FAIL"
```

- [ ] **Step 2.5: Lint**

```bash
cd phoneguessr && npx biome check ../api/admin/phones.ts
```

- [ ] **Step 2.6: Commit**

```bash
git add api/admin/phones.ts phoneguessr/tests/admin-phones-handler.test.ts
git commit -m "feat(admin): GET /api/admin/phones with admin auth guard"
```

---

## Task 3: API — PATCH `/api/admin/phones?id=X`

**Mock queue order for PATCH tests:** `requireAdmin` = 1 DB query (user row). Then PATCH does 1 DB query (UPDATE returning). Total: 2 enqueued results per test that reaches the update.

**Files:**
- Modify: `api/admin/phones.ts`
- Modify: `phoneguessr/tests/admin-phones-handler.test.ts`

- [ ] **Step 3.1: Add PATCH tests (append to the test file)**

```ts
describe('PATCH /api/admin/phones', () => {
  beforeEach(() => { vi.clearAllMocks(); mockDb.reset(); });

  it('returns 403 for non-admin', async () => {
    mockVerifySessionToken.mockResolvedValueOnce(ADMIN_USER);
    mockDb.mockQuery(NON_ADMIN_DB_ROW);
    const res = await PATCH(makeReq('PATCH', 'http://localhost/api/admin/phones?id=1', { brand: 'Apple' }));
    expect(res.status).toBe(403);
  });

  it('returns 400 when no fields provided', async () => {
    mockVerifySessionToken.mockResolvedValueOnce(ADMIN_USER);
    mockDb.mockQuery(ADMIN_DB_ROW);
    const res = await PATCH(makeReq('PATCH', 'http://localhost/api/admin/phones?id=1', {}));
    expect(res.status).toBe(400);
  });

  it('returns 400 when a field is an empty string', async () => {
    mockVerifySessionToken.mockResolvedValueOnce(ADMIN_USER);
    mockDb.mockQuery(ADMIN_DB_ROW);
    const res = await PATCH(makeReq('PATCH', 'http://localhost/api/admin/phones?id=1', { brand: '' }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/brand/);
  });

  it('returns 400 when id is missing from URL', async () => {
    mockVerifySessionToken.mockResolvedValueOnce(ADMIN_USER);
    mockDb.mockQuery(ADMIN_DB_ROW);
    const res = await PATCH(makeReq('PATCH', 'http://localhost/api/admin/phones', { brand: 'Apple' }));
    expect(res.status).toBe(400);
  });

  it('updates phone and returns updated row', async () => {
    mockVerifySessionToken.mockResolvedValueOnce(ADMIN_USER);
    const updated = { id: 1, brand: 'Apple', model: 'iPhone 15 Pro Max', imageUrl: 'https://x.jpg', active: true };
    // Queue: 1) requireAdmin user lookup, 2) UPDATE returning
    mockDb.mockQuery(ADMIN_DB_ROW);
    mockDb.mockQuery([updated]);
    const res = await PATCH(makeReq('PATCH', 'http://localhost/api/admin/phones?id=1', { model: 'iPhone 15 Pro Max' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.phone).toEqual(updated);
  });
});
```

- [ ] **Step 3.2: Run to confirm new PATCH tests fail**

```bash
cd phoneguessr && npx vitest run tests/admin-phones-handler.test.ts 2>&1 | grep -E "✓|✗|FAIL"
```

- [ ] **Step 3.3: Implement PATCH in `api/admin/phones.ts`**

Replace the stub `export async function PATCH` with:

```ts
export async function PATCH(request: Request): Promise<Response> {
  const admin = await requireAdmin(request);
  if (!admin) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const url = new URL(request.url);
  const id = Number(url.searchParams.get('id'));
  if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });

  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const updates: Partial<{ brand: string; model: string; imageUrl: string }> = {};

  for (const field of ['brand', 'model', 'imageUrl'] as const) {
    if (field in body) {
      if (typeof body[field] !== 'string' || (body[field] as string).trim() === '') {
        return Response.json({ error: `${field} must be a non-empty string` }, { status: 400 });
      }
      updates[field] = (body[field] as string).trim();
    }
  }

  if (Object.keys(updates).length === 0) {
    return Response.json(
      { error: 'At least one field (brand, model, imageUrl) is required' },
      { status: 400 },
    );
  }

  const [updated] = await db
    .update(phones)
    .set(updates)
    .where(eq(phones.id, id))
    .returning({
      id: phones.id,
      brand: phones.brand,
      model: phones.model,
      imageUrl: phones.imageUrl,
      active: phones.active,
    });

  if (!updated) return Response.json({ error: 'Phone not found' }, { status: 404 });
  return Response.json({ success: true, phone: updated });
}
```

- [ ] **Step 3.4: Run all tests — expect pass**

```bash
cd phoneguessr && npx vitest run tests/admin-phones-handler.test.ts
```

- [ ] **Step 3.5: Lint**

```bash
cd phoneguessr && npx biome check ../api/admin/phones.ts
```

- [ ] **Step 3.6: Commit**

```bash
git add api/admin/phones.ts phoneguessr/tests/admin-phones-handler.test.ts
git commit -m "feat(admin): PATCH /api/admin/phones — field update with validation"
```

---

## Task 4: API — DELETE `/api/admin/phones?id=X`

**Mock queue order for DELETE tests:**
- 409 test: 1) `requireAdmin` user lookup, 2) `SELECT FROM dailyPuzzles` (returns a row → 409, stop here)
- 200 test: 1) `requireAdmin` user lookup, 2) `SELECT FROM dailyPuzzles` (returns `[]` → no reference), 3) `DELETE FROM phones` (the `db.delete` call — enqueue any truthy value or `[{id:1}]`)
- 400 missing-id test: only 1) `requireAdmin` user lookup (returns early with 400 before any DB delete)

**Files:**
- Modify: `api/admin/phones.ts`
- Modify: `phoneguessr/tests/admin-phones-handler.test.ts`

- [ ] **Step 4.1: Add DELETE tests**

```ts
describe('DELETE /api/admin/phones', () => {
  beforeEach(() => { vi.clearAllMocks(); mockDb.reset(); });

  it('returns 400 when id is missing', async () => {
    mockVerifySessionToken.mockResolvedValueOnce(ADMIN_USER);
    mockDb.mockQuery(ADMIN_DB_ROW);
    const res = await DEL(makeReq('DELETE', 'http://localhost/api/admin/phones'));
    expect(res.status).toBe(400);
  });

  it('returns 409 when phone is referenced by a daily puzzle', async () => {
    mockVerifySessionToken.mockResolvedValueOnce(ADMIN_USER);
    // Queue: 1) requireAdmin user lookup, 2) dailyPuzzles guard SELECT (found)
    mockDb.mockQuery(ADMIN_DB_ROW);
    mockDb.mockQuery([{ id: 5 }]);
    const res = await DEL(makeReq('DELETE', 'http://localhost/api/admin/phones?id=1'));
    expect(res.status).toBe(409);
    expect((await res.json()).error).toMatch(/daily puzzle/i);
  });

  it('hard-deletes phone when no puzzle references it', async () => {
    mockVerifySessionToken.mockResolvedValueOnce(ADMIN_USER);
    // Queue: 1) requireAdmin, 2) dailyPuzzles guard (empty), 3) DELETE phones
    mockDb.mockQuery(ADMIN_DB_ROW);
    mockDb.mockQuery([]);
    mockDb.mockQuery([{ id: 1 }]);
    const res = await DEL(makeReq('DELETE', 'http://localhost/api/admin/phones?id=1'));
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
  });
});
```

- [ ] **Step 4.2: Run to confirm DELETE tests fail**

```bash
cd phoneguessr && npx vitest run tests/admin-phones-handler.test.ts 2>&1 | grep -E "✓|✗|FAIL"
```

- [ ] **Step 4.3: Implement DELETE in `api/admin/phones.ts`**

Replace the stub `export async function DELETE` with:

```ts
export async function DELETE(request: Request): Promise<Response> {
  const admin = await requireAdmin(request);
  if (!admin) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const url = new URL(request.url);
  const id = Number(url.searchParams.get('id'));
  if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });

  const [puzzle] = await db
    .select({ id: dailyPuzzles.id })
    .from(dailyPuzzles)
    .where(eq(dailyPuzzles.phoneId, id))
    .limit(1);

  if (puzzle) {
    return Response.json({ error: 'Phone is used in a daily puzzle' }, { status: 409 });
  }

  await db.delete(phones).where(eq(phones.id, id));
  return Response.json({ success: true });
}
```

- [ ] **Step 4.4: Run all tests — expect all pass**

```bash
cd phoneguessr && npx vitest run tests/admin-phones-handler.test.ts
```

- [ ] **Step 4.5: Lint**

```bash
cd phoneguessr && npx biome check ../api/admin/phones.ts
```

- [ ] **Step 4.6: Commit**

```bash
git add api/admin/phones.ts phoneguessr/tests/admin-phones-handler.test.ts
git commit -m "feat(admin): DELETE /api/admin/phones — hard-delete with daily puzzle guard"
```

---

## Task 5: Frontend — CSS + Page

**Files:**
- Create: `phoneguessr/src/routes/admin/admin.css`
- Create: `phoneguessr/src/routes/admin/page.tsx`

**Note on layout:** `routes/layout.tsx` is inherited by `routes/admin/page.tsx` automatically in Modern.js. This means `AuthProvider` is active and `useAuth()` works as expected — no extra wrapper needed.

- [ ] **Step 5.1: Create `admin.css`**

```css
/* phoneguessr/src/routes/admin/admin.css */

.admin-page {
  min-height: 100vh;
  background: #0d1117;
  color: var(--text);
  padding: 24px;
  font-family: system-ui, sans-serif;
  box-sizing: border-box;
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.admin-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  margin: 0;
}

.admin-subtitle {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}

.admin-back-link {
  font-size: 13px;
  color: var(--text-muted);
  text-decoration: none;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
  background: none;
}

.admin-back-link:hover {
  color: var(--text);
  border-color: var(--text-muted);
}

.admin-search {
  width: 100%;
  box-sizing: border-box;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 8px 12px;
  color: var(--text);
  font-size: 14px;
  margin-bottom: 16px;
}

.admin-search:focus {
  outline: none;
  border-color: var(--accent, #1f6feb);
}

.admin-table {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}

.admin-row {
  display: grid;
  grid-template-columns: 56px 1fr 1fr 2fr 60px 120px;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border);
}

.admin-row:last-child {
  border-bottom: none;
}

.admin-row-header {
  color: var(--text-muted);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.admin-row-editing {
  background: #0d1117;
  border-top: 2px solid var(--accent, #1f6feb);
  border-bottom: 2px solid var(--accent, #1f6feb);
  padding: 12px;
}

.admin-edit-label {
  color: var(--text-muted);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 10px;
}

.admin-edit-fields {
  display: grid;
  grid-template-columns: 1fr 1fr 2fr auto;
  gap: 8px;
  align-items: start;
}

.admin-input {
  width: 100%;
  box-sizing: border-box;
  background: #0d1117;
  border: 1px solid var(--accent, #1f6feb);
  border-radius: 4px;
  padding: 5px 8px;
  color: var(--text);
  font-size: 12px;
}

.admin-input:focus {
  outline: none;
}

.admin-thumb {
  width: 44px;
  height: 32px;
  border-radius: 4px;
  object-fit: cover;
  display: block;
}

.admin-thumb-placeholder {
  width: 44px;
  height: 32px;
  border-radius: 4px;
  background: #21262d;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 9px;
}

.admin-cell-url {
  color: #58a6ff;
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-cell-active-yes {
  color: #3fb950;
  font-size: 12px;
}

.admin-cell-active-no {
  color: var(--text-muted);
  font-size: 12px;
}

.admin-actions {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
}

.admin-btn {
  background: #21262d;
  border: 1px solid var(--border);
  border-radius: 5px;
  padding: 3px 10px;
  color: var(--text);
  font-size: 12px;
  cursor: pointer;
}

.admin-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.admin-btn-save {
  background: #1f6feb;
  border-color: #1f6feb;
  color: #fff;
}

.admin-btn-delete {
  background: transparent;
  border-color: rgba(248, 81, 73, 0.3);
  color: #f85149;
}

.admin-row-error {
  color: #f85149;
  font-size: 12px;
  padding: 4px 12px 8px;
  border-bottom: 1px solid var(--border);
}

.admin-loading {
  padding: 40px;
  text-align: center;
  color: var(--text-muted);
}

.admin-error-banner {
  background: rgba(248, 81, 73, 0.1);
  border: 1px solid rgba(248, 81, 73, 0.3);
  border-radius: 6px;
  padding: 12px;
  color: #f85149;
  font-size: 14px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.admin-pagination {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 14px;
}

.admin-page-btn {
  background: #21262d;
  border: 1px solid var(--border);
  border-radius: 5px;
  padding: 4px 12px;
  color: var(--text-muted);
  font-size: 12px;
  cursor: pointer;
}

.admin-page-btn-active {
  background: #1f6feb;
  border-color: #1f6feb;
  color: #fff;
}

.admin-page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
```

- [ ] **Step 5.2: Create `page.tsx`**

```tsx
// phoneguessr/src/routes/admin/page.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import './admin.css';

interface Phone {
  id: number;
  brand: string;
  model: string;
  imageUrl: string;
  active: boolean;
}

interface EditDraft {
  brand: string;
  model: string;
  imageUrl: string;
}

const PAGE_SIZE = 20;

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [phones, setPhones] = useState<Phone[]>([]);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);
  const [mutating, setMutating] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<{
    id: number;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !user.isAdmin) {
      window.location.href = '/';
    }
  }, [user, authLoading]);

  const loadPhones = () => {
    setGlobalLoading(true);
    fetch('/api/admin/phones')
      .then(r => r.json())
      .then(data => {
        setPhones(data.phones ?? []);
        setLoadError(null);
      })
      .catch(() => setLoadError('Failed to load phones. Check your connection.'))
      .finally(() => setGlobalLoading(false));
  };

  useEffect(() => {
    if (authLoading || !user?.isAdmin) return;
    loadPhones();
  }, [authLoading, user]);

  const filtered = phones.filter(p =>
    `${p.brand} ${p.model}`.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openEdit = (phone: Phone) => {
    setEditingId(phone.id);
    setEditDraft({ brand: phone.brand, model: phone.model, imageUrl: phone.imageUrl });
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft(null);
    setEditError(null);
  };

  const handleSave = async () => {
    if (!editDraft || !editingId) return;
    setMutating(true);
    try {
      const res = await fetch(`/api/admin/phones?id=${editingId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(editDraft),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error ?? 'Update failed');
        return;
      }
      setPhones(prev => prev.map(p => (p.id === editingId ? data.phone : p)));
      cancelEdit();
    } catch {
      setEditError('Network error — please try again.');
    } finally {
      setMutating(false);
    }
  };

  const handleDelete = async (phone: Phone) => {
    if (!window.confirm(`Delete ${phone.brand} ${phone.model}? This cannot be undone.`)) return;
    setMutating(true);
    try {
      const res = await fetch(`/api/admin/phones?id=${phone.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.status === 409) {
        setDeleteError({ id: phone.id, message: data.error });
        setTimeout(() => setDeleteError(null), 4000);
        return;
      }
      if (!res.ok) return;
      setPhones(prev => prev.filter(p => p.id !== phone.id));
    } catch {
      setDeleteError({ id: phone.id, message: 'Network error — could not delete.' });
      setTimeout(() => setDeleteError(null), 4000);
    } finally {
      setMutating(false);
    }
  };

  if (authLoading || (!user?.isAdmin && !authLoading)) {
    return (
      <div className="admin-page">
        <div className="admin-loading">Loading…</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1 className="admin-title">📱 Phone Catalog</h1>
          <div className="admin-subtitle">{phones.length} phones total</div>
        </div>
        <a href="/" className="admin-back-link">
          ← Back to game
        </a>
      </div>

      {loadError && (
        <div className="admin-error-banner">
          {loadError}
          <button type="button" className="admin-btn" onClick={loadPhones}>
            Retry
          </button>
        </div>
      )}

      <input
        className="admin-search"
        placeholder="🔍  Search by brand or model…"
        value={searchQuery}
        onChange={e => {
          setSearchQuery(e.target.value);
          setPage(1);
        }}
      />

      {globalLoading ? (
        <div className="admin-loading">Loading phones…</div>
      ) : (
        <div className="admin-table">
          <div className="admin-row admin-row-header">
            <span />
            <span>Brand</span>
            <span>Model</span>
            <span>Image URL</span>
            <span>Active</span>
            <span />
          </div>

          {paginated.map(phone => (
            <div key={phone.id}>
              {editingId === phone.id ? (
                <div className="admin-row-editing">
                  <div className="admin-edit-label">
                    Editing — {phone.brand} {phone.model}
                  </div>
                  <div className="admin-edit-fields">
                    <input
                      className="admin-input"
                      value={editDraft!.brand}
                      onChange={e =>
                        setEditDraft(d => d && { ...d, brand: e.target.value })
                      }
                      placeholder="Brand"
                    />
                    <input
                      className="admin-input"
                      value={editDraft!.model}
                      onChange={e =>
                        setEditDraft(d => d && { ...d, model: e.target.value })
                      }
                      placeholder="Model"
                    />
                    <input
                      className="admin-input"
                      value={editDraft!.imageUrl}
                      onChange={e =>
                        setEditDraft(d => d && { ...d, imageUrl: e.target.value })
                      }
                      placeholder="Image URL"
                    />
                    <div className="admin-actions">
                      <button
                        type="button"
                        className="admin-btn admin-btn-save"
                        onClick={handleSave}
                        disabled={mutating}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="admin-btn"
                        onClick={cancelEdit}
                        disabled={mutating}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  {editError && (
                    <div className="admin-row-error">{editError}</div>
                  )}
                </div>
              ) : (
                <div className="admin-row">
                  {phone.imageUrl ? (
                    <img
                      src={phone.imageUrl}
                      alt=""
                      className="admin-thumb"
                      onError={e => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="admin-thumb-placeholder">IMG</div>
                  )}
                  <span>{phone.brand}</span>
                  <span>{phone.model}</span>
                  <span className="admin-cell-url" title={phone.imageUrl}>
                    {phone.imageUrl}
                  </span>
                  <span
                    className={
                      phone.active
                        ? 'admin-cell-active-yes'
                        : 'admin-cell-active-no'
                    }
                  >
                    {phone.active ? '✓' : '—'}
                  </span>
                  <div className="admin-actions">
                    <button
                      type="button"
                      className="admin-btn"
                      onClick={() => openEdit(phone)}
                      disabled={mutating}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn-delete"
                      onClick={() => handleDelete(phone)}
                      disabled={mutating}
                    >
                      Del
                    </button>
                  </div>
                </div>
              )}
              {deleteError?.id === phone.id && (
                <div className="admin-row-error">{deleteError.message}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="admin-pagination">
          <button
            type="button"
            className="admin-page-btn"
            onClick={() => setPage(p => p - 1)}
            disabled={page === 1}
          >
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              type="button"
              className={`admin-page-btn${page === i + 1 ? ' admin-page-btn-active' : ''}`}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            type="button"
            className="admin-page-btn"
            onClick={() => setPage(p => p + 1)}
            disabled={page === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5.3: Lint (auto-fix formatting)**

```bash
cd phoneguessr && npx biome check --write src/routes/admin/page.tsx src/routes/admin/admin.css
npx biome check src/routes/admin/page.tsx
```

- [ ] **Step 5.4: Commit**

```bash
git add phoneguessr/src/routes/admin/
git commit -m "feat(admin): admin phone catalog page UI — table, search, inline edit, delete"
```

---

## Task 6: Smoke Test + Full Suite

- [ ] **Step 6.1: Start dev server**

```bash
# From repo root
npm run dev
```

- [ ] **Step 6.2: Navigate to `/admin`**

Open `http://localhost:3000/admin`. Verify:
- Not-logged-in → immediately redirected to `/`
- Logged-in non-admin → redirected to `/`
- Logged-in admin → table loads with all phones
- Search filters rows and resets to page 1
- Click Edit → row expands with pre-filled inputs; Save PATCHes and collapses; Cancel discards
- Click Del → confirm dialog; on confirm, phone disappears from list
- If a phone is in a daily puzzle, Del shows inline error for 4 seconds

- [ ] **Step 6.3: Run full test suite**

```bash
cd phoneguessr && npm run test 2>&1 | tail -10
```
All tests must pass.

- [ ] **Step 6.4: Lint everything**

```bash
cd phoneguessr && npm run lint
```

- [ ] **Step 6.5: Final commit**

```bash
git add -A
git commit -m "feat(admin): complete admin phone catalog — tests, API, UI"
```
