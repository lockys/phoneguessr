// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockDb } from '../src/test/mock-db.js';

const mockDb = createMockDb();
vi.mock('../src/db/index.js', () => ({ db: mockDb }));

const mockVerifySessionToken =
  vi.fn<
    (token: string) => Promise<null | {
      userId: number;
      googleId: string;
      displayName: string;
      avatarUrl?: string;
      email?: string;
    }>
  >();

vi.mock('../src/lib/auth.js', () => ({
  COOKIE_NAME: 'phoneguessr_session',
  verifySessionToken: mockVerifySessionToken,
}));

const { GET: authGet } = await import('../../api/auth.js');

function meHandler(req: Request) {
  const url = new URL(req.url);
  url.searchParams.set('action', 'me');
  return authGet(new Request(url.toString(), req));
}

describe('GET /api/auth/me', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.reset();
  });

  it('returns null user when no cookie is present', async () => {
    const res = await meHandler(new Request('http://localhost/api/auth/me'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ user: null });
    expect(mockVerifySessionToken).not.toHaveBeenCalled();
  });

  it('returns null user when session token is invalid', async () => {
    mockVerifySessionToken.mockResolvedValueOnce(null);
    const res = await meHandler(
      new Request('http://localhost/api/auth/me', {
        headers: { cookie: 'phoneguessr_session=invalid-token' },
      }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ user: null });
    expect(mockVerifySessionToken).toHaveBeenCalledWith('invalid-token');
  });

  it('returns user data from DB for a valid session', async () => {
    mockVerifySessionToken.mockResolvedValueOnce({
      userId: 42,
      googleId: 'g-123',
      displayName: 'Stale JWT Name',
      avatarUrl: 'https://example.com/avatar.jpg',
      email: 'test@example.com',
    });
    mockDb.mockQuery([
      {
        displayName: 'Test User',
        avatarUrl: 'https://example.com/avatar.jpg',
        isAdmin: false,
        region: null,
      },
    ]);
    const res = await meHandler(
      new Request('http://localhost/api/auth/me', {
        headers: { cookie: 'phoneguessr_session=valid-token' },
      }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      user: {
        id: 42,
        displayName: 'Test User',
        avatarUrl: 'https://example.com/avatar.jpg',
        email: 'test@example.com',
        isAdmin: false,
        region: null,
      },
    });
  });

  it('falls back to JWT displayName when user not found in DB', async () => {
    mockVerifySessionToken.mockResolvedValueOnce({
      userId: 7,
      googleId: 'g-456',
      displayName: 'JWT Fallback',
    });
    mockDb.mockQuery([]); // empty result
    const res = await meHandler(
      new Request('http://localhost/api/auth/me', {
        headers: { cookie: 'phoneguessr_session=token' },
      }),
    );
    const body = await res.json();
    expect(body.user.displayName).toBe('JWT Fallback');
    expect(body.user.email).toBeNull();
    expect(body.user.avatarUrl).toBeUndefined();
    expect(body).not.toHaveProperty('hasPasskey');
  });
});
