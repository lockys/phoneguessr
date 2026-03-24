import { describe, expect, it } from 'vitest';
import { MOCK_PHONES } from './data';

describe('MOCK_PHONES catalog', () => {
  it('has at least 20 phones', () => {
    expect(MOCK_PHONES.length).toBeGreaterThanOrEqual(20);
  });

  it('has unique IDs', () => {
    const ids = MOCK_PHONES.map(p => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('has sequential IDs starting from 1', () => {
    for (let i = 0; i < MOCK_PHONES.length; i++) {
      expect(MOCK_PHONES[i].id).toBe(i + 1);
    }
  });

  it('has unique brand+model combinations', () => {
    const combos = MOCK_PHONES.map(p => `${p.brand}|${p.model}`);
    const uniqueCombos = new Set(combos);
    expect(uniqueCombos.size).toBe(combos.length);
  });

  it('has non-empty brand and model for every phone', () => {
    for (const phone of MOCK_PHONES) {
      expect(phone.brand.length).toBeGreaterThan(0);
      expect(phone.model.length).toBeGreaterThan(0);
    }
  });

  it('has valid imageUrl format for every phone', () => {
    for (const phone of MOCK_PHONES) {
      expect(phone.imageUrl).toMatch(/^https?:\/\//);
    }
  });

  it('has at least 5 distinct brands', () => {
    const brands = new Set(MOCK_PHONES.map(p => p.brand));
    expect(brands.size).toBeGreaterThanOrEqual(5);
  });

  it('includes expected major brands', () => {
    const brands = new Set(MOCK_PHONES.map(p => p.brand));
    for (const brand of ['Apple', 'Samsung', 'Google', 'OnePlus', 'Nothing']) {
      expect(brands.has(brand)).toBe(true);
    }
  });

  it('no brand exceeds 40% of catalog', () => {
    const brandCounts = new Map<string, number>();
    for (const phone of MOCK_PHONES) {
      brandCounts.set(phone.brand, (brandCounts.get(phone.brand) || 0) + 1);
    }
    for (const [, count] of brandCounts) {
      const pct = (count / MOCK_PHONES.length) * 100;
      expect(pct).toBeLessThanOrEqual(40);
    }
  });
});

describe('difficulty distribution', () => {
  it('has all three difficulty tiers represented', () => {
    const difficulties = new Set(MOCK_PHONES.map(p => p.difficulty));
    expect(difficulties.has('easy')).toBe(true);
    expect(difficulties.has('medium')).toBe(true);
    expect(difficulties.has('hard')).toBe(true);
  });

  it('Nothing Phone is classified as hard', () => {
    const nothingPhones = MOCK_PHONES.filter(p => p.brand === 'Nothing');
    for (const phone of nothingPhones) {
      expect(phone.difficulty).toBe('hard');
    }
  });

  it('Apple phones are classified as easy', () => {
    const applePhones = MOCK_PHONES.filter(p => p.brand === 'Apple');
    for (const phone of applePhones) {
      expect(phone.difficulty).toBe('easy');
    }
  });

  it('Samsung phones are classified as easy', () => {
    const samsungPhones = MOCK_PHONES.filter(p => p.brand === 'Samsung');
    for (const phone of samsungPhones) {
      expect(phone.difficulty).toBe('easy');
    }
  });
});
