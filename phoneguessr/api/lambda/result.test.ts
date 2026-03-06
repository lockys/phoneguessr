import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/mock/index.ts', () => ({ IS_MOCK: true }));

describe('POST /api/result (mock mode)', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns success with null score', async () => {
    const { post } = await import('./result');
    const result = await post();

    expect(result).toBeInstanceOf(Response);
    const response = result as Response;
    const data = await response.json();

    expect(data).toEqual({ success: true, score: null });
  });

  it('response has status 200', async () => {
    const { post } = await import('./result');
    const result = await post();

    const response = result as Response;
    expect(response.status).toBe(200);
  });
});
