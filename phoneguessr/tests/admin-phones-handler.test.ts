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
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.reset();
  });

  it('returns 403 when no session cookie', async () => {
    mockVerifySessionToken.mockResolvedValueOnce(null);
    const res = await GET(new Request('http://localhost/api/admin/phones'));
    expect(res.status).toBe(403);
  });

  it('returns 403 when user is not admin and not in ADMIN_EMAILS', async () => {
    mockVerifySessionToken.mockResolvedValueOnce(ADMIN_USER);
    // Queue: 1) requireAdmin user lookup (array, as drizzle select returns)
    mockDb.mockQuery([NON_ADMIN_DB_ROW]);
    const res = await GET(makeReq('GET', 'http://localhost/api/admin/phones'));
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
    const res = await GET(makeReq('GET', 'http://localhost/api/admin/phones'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.phones).toEqual(phones);
    expect(body.total).toBe(1);
  });
});
