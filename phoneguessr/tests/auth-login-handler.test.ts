// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/db/index.js', () => ({ db: {} }));

async function loadAuthGet(googleRedirectUri: string) {
  vi.resetModules();
  vi.doMock('../src/db/index.js', () => ({ db: {} }));
  vi.doMock('../src/lib/auth.js', () => ({
    GOOGLE_CLIENT_ID: 'test-client-id',
    GOOGLE_CLIENT_SECRET: 'test-client-secret',
    GOOGLE_REDIRECT_URI: googleRedirectUri,
  }));
  return (await import('../../api/auth.js')).GET;
}

describe('GET /api/auth/login', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  const loginHandler = async (googleRedirectUri: string) => {
    const authGet = await loadAuthGet(googleRedirectUri);
    return authGet(new Request('http://localhost/api/auth/login?action=login'));
  };

  it('returns a 302 redirect', async () => {
    const res = await loginHandler('http://localhost:3000/api/auth/callback');
    expect(res.status).toBe(302);
  });

  it('redirects to Google OAuth2 authorization endpoint', async () => {
    const res = await loginHandler('http://localhost:3000/api/auth/callback');
    const location = res.headers.get('Location')!;
    expect(location).toMatch(
      /^https:\/\/accounts\.google\.com\/o\/oauth2\/v2\/auth\?/,
    );
  });

  it('uses GOOGLE_REDIRECT_URI when configured', async () => {
    const res = await loginHandler('https://auth.example.com/api/auth/callback');
    const location = new URL(res.headers.get('Location')!);

    expect(location.searchParams.get('client_id')).toBe('test-client-id');
    expect(location.searchParams.get('redirect_uri')).toBe(
      'https://auth.example.com/api/auth/callback',
    );
    expect(location.searchParams.get('response_type')).toBe('code');
    expect(location.searchParams.get('scope')).toBe('openid profile email');
    expect(location.searchParams.get('access_type')).toBe('online');
    expect(location.searchParams.get('prompt')).toBe('select_account');
  });

  it('falls back to request-derived redirect URI when env is empty', async () => {
    const authGet = await loadAuthGet('');
    const res = await authGet(
      new Request('http://internal.local/api/auth/login?action=login', {
        headers: {
          host: 'preview.example.com',
          'x-forwarded-proto': 'https',
        },
      }),
    );
    const location = new URL(res.headers.get('Location')!);
    expect(location.searchParams.get('redirect_uri')).toBe(
      'https://preview.example.com/api/auth/callback',
    );
  });

  it('uses the same configured redirect URI for callback token exchange', async () => {
    const authGet = await loadAuthGet(
      'https://auth.example.com/api/auth/callback',
    );
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
    });
    vi.stubGlobal('fetch', fetchMock);

    await authGet(
      new Request('http://localhost/api/auth/callback?action=callback&code=abc'),
    );

    const body = fetchMock.mock.calls[0][1].body as URLSearchParams;
    expect(body.get('redirect_uri')).toBe(
      'https://auth.example.com/api/auth/callback',
    );
  });

  it('has no response body', async () => {
    const res = await loginHandler('http://localhost:3000/api/auth/callback');
    expect(res.body).toBeNull();
  });
});
