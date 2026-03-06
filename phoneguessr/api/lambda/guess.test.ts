import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/mock/index.ts', () => ({ IS_MOCK: true }));

describe('POST /api/guess (mock mode)', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns feedback as wrong_brand', async () => {
    const { post } = await import('./guess');
    const result = await post();

    expect(result).toBeInstanceOf(Response);
    const response = result as Response;
    const data = await response.json();

    expect(data).toHaveProperty('feedback');
    expect(data.feedback).toBe('wrong_brand');
  });

  it('response has status 200', async () => {
    const { post } = await import('./guess');
    const result = await post();

    const response = result as Response;
    expect(response.status).toBe(200);
  });
});
