import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/mock/index.ts', () => ({ IS_MOCK: true }));

describe('GET /api/streak (mock mode)', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns streak data with expected shape', async () => {
    const { get } = await import('./streak');
    const result = await get();

    expect(result).toBeInstanceOf(Response);
    const response = result as Response;
    const data = await response.json();

    expect(data).toHaveProperty('currentStreak', 3);
    expect(data).toHaveProperty('bestStreak', 8);
    expect(data).toHaveProperty('lastPlayedDate');
    expect(typeof data.lastPlayedDate).toBe('string');
  });

  it('returns milestones object', async () => {
    const { get } = await import('./streak');
    const result = await get();

    const response = result as Response;
    const data = await response.json();

    expect(data.milestones).toEqual({
      '7day': true,
      '30day': false,
      '100day': false,
    });
  });

  it('lastPlayedDate matches today', async () => {
    const { get } = await import('./streak');
    const result = await get();

    const response = result as Response;
    const data = await response.json();

    const today = new Date().toISOString().slice(0, 10);
    expect(data.lastPlayedDate).toBe(today);
  });
});
