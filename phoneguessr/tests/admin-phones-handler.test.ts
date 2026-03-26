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

const {
  GET: adminGet,
  PATCH: adminPatch,
  DELETE: adminDelete,
} = await import('../../api/admin.js');

function phonesHandler(req: Request): Promise<Response> {
  if (req.method === 'PATCH') return adminPatch(req);
  if (req.method === 'DELETE') return adminDelete(req);
  return adminGet(req);
}

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
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.reset();
  });

  it('returns 403 when no session cookie', async () => {
    mockVerifySessionToken.mockResolvedValueOnce(null);
    const res = await phonesHandler(
      new Request('http://localhost/api/admin/phones'),
    );
    expect(res.status).toBe(403);
  });

  it('returns 403 when user is not admin and not in ADMIN_EMAILS', async () => {
    mockVerifySessionToken.mockResolvedValueOnce(ADMIN_USER);
    // Queue: 1) requireAdmin user lookup (array, as drizzle select returns)
    mockDb.mockQuery([NON_ADMIN_DB_ROW]);
    const res = await phonesHandler(
      makeReq('GET', 'http://localhost/api/admin/phones'),
    );
    expect(res.status).toBe(403);
  });

  it('returns phone list for admin user', async () => {
    mockVerifySessionToken.mockResolvedValueOnce(ADMIN_USER);
    const phones = [
      {
        id: 1,
        brand: 'Apple',
        model: 'iPhone 15 Pro',
        imageUrl: 'https://img.jpg',
        active: true,
      },
    ];
    // Queue: 1) requireAdmin user lookup, 2) phones SELECT
    mockDb.mockQuery([ADMIN_DB_ROW]);
    mockDb.mockQuery(phones);
    const res = await phonesHandler(
      makeReq('GET', 'http://localhost/api/admin/phones'),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.phones).toEqual(phones);
    expect(body.total).toBe(1);
  });
});

describe('PATCH /api/admin/phones', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.reset();
  });

  it('returns 403 for non-admin', async () => {
    mockVerifySessionToken.mockResolvedValueOnce(ADMIN_USER);
    mockDb.mockQuery([NON_ADMIN_DB_ROW]);
    const res = await phonesHandler(
      makeReq('PATCH', 'http://localhost/api/admin/phones?id=1', {
        brand: 'Apple',
      }),
    );
    expect(res.status).toBe(403);
  });

  it('returns 400 when no fields provided', async () => {
    mockVerifySessionToken.mockResolvedValueOnce(ADMIN_USER);
    mockDb.mockQuery([ADMIN_DB_ROW]);
    const res = await phonesHandler(
      makeReq('PATCH', 'http://localhost/api/admin/phones?id=1', {}),
    );
    expect(res.status).toBe(400);
  });

  it('returns 400 when a field is an empty string', async () => {
    mockVerifySessionToken.mockResolvedValueOnce(ADMIN_USER);
    mockDb.mockQuery([ADMIN_DB_ROW]);
    const res = await phonesHandler(
      makeReq('PATCH', 'http://localhost/api/admin/phones?id=1', { brand: '' }),
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/brand/);
  });

  it('returns 400 when id is missing from URL', async () => {
    mockVerifySessionToken.mockResolvedValueOnce(ADMIN_USER);
    mockDb.mockQuery([ADMIN_DB_ROW]);
    const res = await phonesHandler(
      makeReq('PATCH', 'http://localhost/api/admin/phones', { brand: 'Apple' }),
    );
    expect(res.status).toBe(400);
  });

  it('updates phone and returns updated row', async () => {
    mockVerifySessionToken.mockResolvedValueOnce(ADMIN_USER);
    const updated = {
      id: 1,
      brand: 'Apple',
      model: 'iPhone 15 Pro Max',
      imageUrl: 'https://x.jpg',
      active: true,
    };
    // Queue: 1) requireAdmin user lookup, 2) UPDATE returning
    mockDb.mockQuery([ADMIN_DB_ROW]);
    mockDb.mockQuery([updated]);
    const res = await phonesHandler(
      makeReq('PATCH', 'http://localhost/api/admin/phones?id=1', {
        model: 'iPhone 15 Pro Max',
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.phone).toEqual(updated);
  });
});

describe('DELETE /api/admin/phones', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.reset();
  });

  it('returns 400 when id is missing', async () => {
    mockVerifySessionToken.mockResolvedValueOnce(ADMIN_USER);
    mockDb.mockQuery([ADMIN_DB_ROW]);
    const res = await phonesHandler(
      makeReq('DELETE', 'http://localhost/api/admin/phones'),
    );
    expect(res.status).toBe(400);
  });

  it('returns 409 when phone is referenced by a daily puzzle', async () => {
    mockVerifySessionToken.mockResolvedValueOnce(ADMIN_USER);
    // Queue: 1) requireAdmin user lookup, 2) dailyPuzzles guard SELECT (found)
    mockDb.mockQuery([ADMIN_DB_ROW]);
    mockDb.mockQuery([{ id: 5 }]);
    const res = await phonesHandler(
      makeReq('DELETE', 'http://localhost/api/admin/phones?id=1'),
    );
    expect(res.status).toBe(409);
    expect((await res.json()).error).toMatch(/daily puzzle/i);
  });

  it('hard-deletes phone when no puzzle references it', async () => {
    mockVerifySessionToken.mockResolvedValueOnce(ADMIN_USER);
    // Queue: 1) requireAdmin, 2) dailyPuzzles guard (empty), 3) DELETE phones
    mockDb.mockQuery([ADMIN_DB_ROW]);
    mockDb.mockQuery([]);
    mockDb.mockQuery([{ id: 1 }]);
    const res = await phonesHandler(
      makeReq('DELETE', 'http://localhost/api/admin/phones?id=1'),
    );
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
  });
});
