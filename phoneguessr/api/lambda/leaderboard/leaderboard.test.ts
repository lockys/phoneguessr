import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../src/mock/index.ts', () => ({ IS_MOCK: true }));

describe('Leaderboard endpoints (mock mode)', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe('GET /api/leaderboard/daily', () => {
    it('returns entries array with 5 items', async () => {
      const { get } = await import('./daily');
      const result = await get();

      expect(result).toHaveProperty('entries');
      const data = result as { entries: unknown[] };
      expect(data.entries).toHaveLength(5);
    });

    it('entries have daily leaderboard fields', async () => {
      const { get } = await import('./daily');
      const result = await get();

      const data = result as {
        entries: Array<{
          rank: number;
          displayName: string;
          avatarUrl: null;
          score: number;
          guessCount: number;
        }>;
      };

      for (const entry of data.entries) {
        expect(typeof entry.rank).toBe('number');
        expect(typeof entry.displayName).toBe('string');
        expect(typeof entry.score).toBe('number');
        expect(typeof entry.guessCount).toBe('number');
      }
    });

    it('entries are ranked 1 through 5', async () => {
      const { get } = await import('./daily');
      const result = await get();

      const data = result as { entries: Array<{ rank: number }> };
      const ranks = data.entries.map(e => e.rank);
      expect(ranks).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe('GET /api/leaderboard/weekly', () => {
    it('returns entries array with aggregate fields', async () => {
      const { get } = await import('./weekly');
      const result = await get();

      expect(result).toHaveProperty('entries');
      const data = result as {
        entries: Array<{
          rank: number;
          displayName: string;
          avatarUrl: null;
          totalWins: number;
        }>;
      };
      expect(data.entries).toHaveLength(5);

      for (const entry of data.entries) {
        expect(typeof entry.rank).toBe('number');
        expect(typeof entry.displayName).toBe('string');
        expect(typeof entry.totalWins).toBe('number');
      }
    });
  });

  describe('GET /api/leaderboard/monthly', () => {
    it('returns entries array with aggregate fields', async () => {
      const { get } = await import('./monthly');
      const result = await get();

      expect(result).toHaveProperty('entries');
      const data = result as {
        entries: Array<{
          rank: number;
          displayName: string;
          totalWins: number;
        }>;
      };
      expect(data.entries).toHaveLength(5);

      for (const entry of data.entries) {
        expect(typeof entry.rank).toBe('number');
        expect(typeof entry.displayName).toBe('string');
        expect(typeof entry.totalWins).toBe('number');
      }
    });
  });

  describe('GET /api/leaderboard/all-time', () => {
    it('returns entries array with aggregate fields', async () => {
      const { get } = await import('./all-time');
      const result = await get();

      expect(result).toHaveProperty('entries');
      const data = result as {
        entries: Array<{
          rank: number;
          displayName: string;
          totalWins: number;
        }>;
      };
      expect(data.entries).toHaveLength(5);

      for (const entry of data.entries) {
        expect(typeof entry.rank).toBe('number');
        expect(typeof entry.displayName).toBe('string');
        expect(typeof entry.totalWins).toBe('number');
      }
    });

    it('totalWins are in descending order', async () => {
      const { get } = await import('./all-time');
      const result = await get();

      const data = result as {
        entries: Array<{ totalWins: number }>;
      };

      for (let i = 1; i < data.entries.length; i++) {
        expect(data.entries[i - 1].totalWins).toBeGreaterThanOrEqual(
          data.entries[i].totalWins,
        );
      }
    });
  });
});
