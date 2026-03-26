// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';

vi.mock('../src/db/index.js', () => ({ db: {} }));

vi.mock('../src/lib/auth.js', () => ({
  GOOGLE_CLIENT_ID: 'test-client-id',
  GOOGLE_REDIRECT_URI: 'http://localhost:3000/api/auth/callback',
}));

const { default: authHandler } = await import('../../api/auth.js');

const loginHandler = () =>
  authHandler(new Request('http://localhost/api/auth/login?action=login'));

describe('GET /api/auth/login', () => {
  it('returns a 302 redirect', async () => {
    const res = await loginHandler();
    expect(res.status).toBe(302);
  });

  it('redirects to Google OAuth2 authorization endpoint', async () => {
    const res = await loginHandler();
    const location = res.headers.get('Location')!;
    expect(location).toMatch(
      /^https:\/\/accounts\.google\.com\/o\/oauth2\/v2\/auth\?/,
    );
  });

  it('includes correct query params', async () => {
    const res = await loginHandler();
    const location = new URL(res.headers.get('Location')!);

    expect(location.searchParams.get('client_id')).toBe('test-client-id');
    expect(location.searchParams.get('redirect_uri')).toBe(
      'http://localhost:3000/api/auth/callback',
    );
    expect(location.searchParams.get('response_type')).toBe('code');
    expect(location.searchParams.get('scope')).toBe('openid profile email');
    expect(location.searchParams.get('access_type')).toBe('online');
    expect(location.searchParams.get('prompt')).toBe('select_account');
  });

  it('has no response body', async () => {
    const res = await loginHandler();
    expect(res.body).toBeNull();
  });
});
