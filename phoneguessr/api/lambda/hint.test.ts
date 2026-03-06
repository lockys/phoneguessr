import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/mock/index.ts', () => ({ IS_MOCK: true }));

describe('POST /api/hint (mock mode)', () => {
  beforeEach(async () => {
    vi.resetModules();
    const { resetMockHints } = await import('../../src/mock/state.ts');
    resetMockHints();
  });

  it('returns a hint with penalty info', async () => {
    const { post } = await import('./hint');
    const result = await post();

    expect(result).toBeInstanceOf(Response);
    const response = result as Response;
    const data = await response.json();

    expect(data).toHaveProperty('hint');
    expect(data).toHaveProperty('penalty', 15);
    expect(data).toHaveProperty('hintsUsed', 1);
    expect(data).toHaveProperty('hintsRemaining', 1);
  });

  it('returns brand hint matching the daily puzzle phone', async () => {
    const { post } = await import('./hint');
    const { getMockPuzzle } = await import('../../src/mock/state.ts');
    const { MOCK_PHONES } = await import('../../src/mock/data.ts');

    const result = await post();
    const response = result as Response;
    const data = await response.json();

    const puzzle = getMockPuzzle();
    const phone = MOCK_PHONES.find(p => p.id === puzzle._answerId);
    expect(data.hint).toBe(phone?.brand);
  });

  it('returns 409 when max hints already reached', async () => {
    const { getMockHint } = await import('../../src/mock/state.ts');
    getMockHint('brand');
    getMockHint('year');

    const { post } = await import('./hint');
    const result = await post();

    expect(result).toBeInstanceOf(Response);
    const response = result as Response;
    expect(response.status).toBe(409);

    const data = await response.json();
    expect(data.error).toBe('max_hints_reached');
  });
});
