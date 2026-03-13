// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

const { GET } = await import('../../api/auth/me.js');

describe('GET /api/auth/me', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null user when no cookie is present', async () => {
    const res = await GET(new Request('http://localhost/api/auth/me'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ user: null });
    expect(mockVerifySessionToken).not.toHaveBeenCalled();
  });

  it('returns null user when session token is invalid', async () => {
    mockVerifySessionToken.mockResolvedValueOnce(null);
    const res = await GET(
      new Request('http://localhost/api/auth/me', {
        headers: { cookie: 'phoneguessr_session=invalid-token' },
      }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ user: null });
    expect(mockVerifySessionToken).toHaveBeenCalledWith('invalid-token');
  });

  it('returns user data for a valid session', async () => {
    mockVerifySessionToken.mockResolvedValueOnce({
      userId: 42,
      googleId: 'g-123',
      displayName: 'Test User',
      avatarUrl: 'https://example.com/avatar.jpg',
      email: 'test@example.com',
    });
    const res = await GET(
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
      },
    });
  });

  it('returns email as null when session has no email', async () => {
    mockVerifySessionToken.mockResolvedValueOnce({
      userId: 7,
      googleId: 'g-456',
      displayName: 'No Email',
    });
    const res = await GET(
      new Request('http://localhost/api/auth/me', {
        headers: { cookie: 'phoneguessr_session=token-no-email' },
      }),
    );
    const body = await res.json();
    expect(body.user.email).toBeNull();
    expect(body.user.avatarUrl).toBeUndefined();
  });
});
