import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../src/mock/index.ts', () => ({ IS_MOCK: true }));

describe('Auth endpoints (mock mode)', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe('GET /api/auth/login', () => {
    it('returns 302 redirect to /', async () => {
      const { get } = await import('./login');
      const result = await get();

      expect(result).toBeInstanceOf(Response);
      const response = result as Response;
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/');
    });
  });

  describe('GET /api/auth/logout', () => {
    it('returns 302 redirect to /', async () => {
      const { get } = await import('./logout');
      const result = await get();

      expect(result).toBeInstanceOf(Response);
      const response = result as Response;
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/');
    });
  });

  describe('GET /api/auth/callback', () => {
    it('returns 302 redirect to /', async () => {
      const { get } = await import('./callback');
      const result = await get();

      expect(result).toBeInstanceOf(Response);
      const response = result as Response;
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/');
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns mock user data', async () => {
      const { get } = await import('./me');
      const result = await get();

      expect(result).toBeInstanceOf(Response);
      const response = result as Response;
      const data = await response.json();

      expect(data.user).toBeDefined();
      expect(data.user.id).toBe(1);
      expect(data.user.displayName).toBe('卡爾文');
      expect(data.user.avatarUrl).toBeNull();
    });
  });
});
