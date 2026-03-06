import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../src/mock/index.ts', () => ({ IS_MOCK: true }));

describe('Profile endpoints (mock mode)', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe('GET /api/profile/stats', () => {
    it('returns profile stats with expected shape', async () => {
      const { get } = await import('./stats');
      const result = await get();

      expect(result).toBeInstanceOf(Response);
      const response = result as Response;
      const data = await response.json();

      expect(data).toEqual({
        gamesPlayed: 10,
        wins: 7,
        winRate: 70,
        currentStreak: 3,
        bestStreak: 5,
      });
    });

    it('winRate is a valid percentage', async () => {
      const { get } = await import('./stats');
      const result = await get();

      const response = result as Response;
      const data = await response.json();

      expect(data.winRate).toBeGreaterThanOrEqual(0);
      expect(data.winRate).toBeLessThanOrEqual(100);
    });
  });

  describe('POST /api/profile/update', () => {
    it('returns success in mock mode', async () => {
      const { post } = await import('./update');
      const result = await post();

      expect(result).toBeInstanceOf(Response);
      const response = result as Response;
      const data = await response.json();

      expect(data).toEqual({ success: true });
    });
  });
});
