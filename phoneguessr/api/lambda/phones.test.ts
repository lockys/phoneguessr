import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/mock/index.ts', () => ({ IS_MOCK: true }));

describe('GET /api/phones (mock mode)', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns phones array with 120 entries', async () => {
    const { get } = await import('./phones');
    const result = await get();

    // phones returns a plain object, not Response
    expect(result).toHaveProperty('phones');
    const data = result as {
      phones: Array<{ id: number; brand: string; model: string }>;
    };
    expect(data.phones).toHaveLength(120);
  });

  it('each phone has id, brand, and model fields', async () => {
    const { get } = await import('./phones');
    const result = await get();

    const data = result as {
      phones: Array<{ id: number; brand: string; model: string }>;
    };
    for (const phone of data.phones) {
      expect(typeof phone.id).toBe('number');
      expect(typeof phone.brand).toBe('string');
      expect(typeof phone.model).toBe('string');
    }
  });

  it('does not include imagePath in response', async () => {
    const { get } = await import('./phones');
    const result = await get();

    const data = result as { phones: Array<Record<string, unknown>> };
    for (const phone of data.phones) {
      expect(phone).not.toHaveProperty('imagePath');
    }
  });

  it('includes expected brands', async () => {
    const { get } = await import('./phones');
    const result = await get();

    const data = result as { phones: Array<{ brand: string }> };
    const brands = new Set(data.phones.map(p => p.brand));
    expect(brands.has('Apple')).toBe(true);
    expect(brands.has('Samsung')).toBe(true);
    expect(brands.has('Google')).toBe(true);
  });
});
