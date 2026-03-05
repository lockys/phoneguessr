import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../src/mock/index.ts', () => ({ IS_MOCK: true }));

describe('GET /api/puzzle/yesterday (mock mode)', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns yesterday puzzle data in mock mode', async () => {
    const { get } = await import('./yesterday');
    const result = await get();

    // In mock mode, the handler returns a plain object (not Response)
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
});
