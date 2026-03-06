import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../src/mock/index.ts', () => ({ IS_MOCK: true }));

interface MockPuzzleResponse {
  puzzleId: number;
  puzzleNumber: number;
  puzzleDate: string;
  imageUrl: string;
  _mockAnswerId: number;
  _mockAnswerBrand: string;
}

describe('Puzzle endpoints (mock mode)', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe('GET /api/puzzle/today', () => {
    it('returns puzzle data with expected shape', async () => {
      const { get } = await import('./today');
      const result = await get();

      // today returns a plain object, not Response
      expect(result).toHaveProperty('puzzleId');
      expect(result).toHaveProperty('puzzleNumber');
      expect(result).toHaveProperty('puzzleDate');
      expect(result).toHaveProperty('imageUrl', '/api/puzzle/image');
    });

    it('returns mock answer fields', async () => {
      const { get } = await import('./today');
      const result = (await get()) as MockPuzzleResponse;

      expect(result).toHaveProperty('_mockAnswerId');
      expect(result).toHaveProperty('_mockAnswerBrand');
      expect(typeof result._mockAnswerId).toBe('number');
      expect(typeof result._mockAnswerBrand).toBe('string');
    });

    it('puzzleId is always 1 in mock mode', async () => {
      const { get } = await import('./today');
      const result = (await get()) as MockPuzzleResponse;
      expect(result.puzzleId).toBe(1);
    });

    it('puzzleDate matches today', async () => {
      const { get } = await import('./today');
      const result = (await get()) as MockPuzzleResponse;
      const today = new Date().toISOString().slice(0, 10);
      expect(result.puzzleDate).toBe(today);
    });

    it('puzzleNumber is at least 1', async () => {
      const { get } = await import('./today');
      const result = (await get()) as MockPuzzleResponse;
      expect(result.puzzleNumber).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/puzzle/image', () => {
    it('returns imageData or 404', async () => {
      const { get } = await import('./image');
      const result = await get();

      expect(result).toBeInstanceOf(Response);
      const response = result as Response;
      const data = await response.json();

      if (response.status === 200) {
        expect(data).toHaveProperty('imageData');
        expect(typeof data.imageData).toBe('string');
        expect(data.imageData).toMatch(/^data:image\//);
      } else {
        expect(response.status).toBe(404);
        expect(data).toHaveProperty('error', 'Image not found');
      }
    });
  });

  describe('GET /api/puzzle/yesterday', () => {
    it('returns yesterday puzzle data in mock mode', async () => {
      const { get } = await import('./yesterday');
      const result = await get();

      expect(result).toHaveProperty('phone');
      expect(result).toHaveProperty('facts');
      expect(result).toHaveProperty('stats');

      const data = result as {
        phone: {
          brand: string;
          model: string;
          imagePath: string;
          releaseYear: null;
        };
        facts: string[];
        stats: { totalPlayers: number; avgGuesses: number; winRate: number };
      };

      expect(typeof data.phone.brand).toBe('string');
      expect(typeof data.phone.model).toBe('string');
      expect(typeof data.phone.imagePath).toBe('string');
      expect(data.phone.releaseYear).toBeNull();
      expect(data.facts).toEqual([]);
      expect(typeof data.stats.totalPlayers).toBe('number');
      expect(typeof data.stats.avgGuesses).toBe('number');
      expect(typeof data.stats.winRate).toBe('number');
    });

    it('includes imageData field', async () => {
      const { get } = await import('./yesterday');
      const result = await get();

      // imageData is either a base64 string or null
      expect(result).toHaveProperty('imageData');
    });
  });
});
