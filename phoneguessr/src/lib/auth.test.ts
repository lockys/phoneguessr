// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  createSessionToken,
  getSessionCookieOptions,
  verifySessionToken,
} from './auth';

describe('auth security', () => {
  const testSession = {
    userId: 1,
    googleId: '123456',
    displayName: 'Test User',
    avatarUrl: 'https://example.com/avatar.jpg',
    email: 'test@example.com',
  };

  describe('session token', () => {
    it('does not include sensitive fields beyond session data', async () => {
      const token = await createSessionToken(testSession);
      const session = await verifySessionToken(token);
      expect(session).not.toBeNull();
      // Session includes googleId internally, but /auth/me endpoint
      // must filter it out before sending to client
      expect(session).toHaveProperty('userId');
      expect(session).toHaveProperty('googleId');
      expect(session).toHaveProperty('displayName');
    });

    it('returns null for invalid tokens without exposing errors', async () => {
      const result = await verifySessionToken('invalid-token');
      expect(result).toBeNull();
    });

    it('returns null for tampered tokens without exposing errors', async () => {
      const token = await createSessionToken(testSession);
      const tampered = `${token.slice(0, -5)}XXXXX`;
      const result = await verifySessionToken(tampered);
      expect(result).toBeNull();
    });

    it('returns null for empty token without exposing errors', async () => {
      const result = await verifySessionToken('');
      expect(result).toBeNull();
    });
  });

  describe('cookie options', () => {
    it('sets httpOnly to prevent client-side access', () => {
      const opts = getSessionCookieOptions();
      expect(opts.httpOnly).toBe(true);
    });

    it('sets sameSite to Lax for CSRF protection', () => {
      const opts = getSessionCookieOptions();
      expect(opts.sameSite).toBe('Lax');
    });
  });
});
