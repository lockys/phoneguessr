import { describe, expect, it } from 'vitest';
import phoneData from './phone-data.json';

const VALID_PRICE_TIERS = ['budget', 'mid-range', 'flagship'];
const VALID_FORM_FACTORS = ['bar', 'flip', 'fold'];
const MIN_PHONE_COUNT = 120;
const MIN_BRAND_COUNT = 15;

describe('phone-data.json', () => {
  it(`has at least ${MIN_PHONE_COUNT} phones`, () => {
    expect(phoneData.length).toBeGreaterThanOrEqual(MIN_PHONE_COUNT);
  });

  it(`has at least ${MIN_BRAND_COUNT} brands`, () => {
    const brands = new Set(phoneData.map(p => p.brand));
    expect(brands.size).toBeGreaterThanOrEqual(MIN_BRAND_COUNT);
  });

  it('has no duplicate brand+model combinations', () => {
    const keys = phoneData.map(p => `${p.brand}|${p.model}`);
    const duplicates = keys.filter((k, i) => keys.indexOf(k) !== i);
    expect(duplicates).toEqual([]);
  });

  it('every phone has all required fields', () => {
    for (const phone of phoneData) {
      expect(phone.brand).toBeTruthy();
      expect(phone.model).toBeTruthy();
      expect(phone.imagePath).toBeTruthy();
      expect(phone.releaseYear).toBeTypeOf('number');
      expect(phone.priceTier).toBeTruthy();
      expect(phone.formFactor).toBeTruthy();
      expect(phone.region).toBeTruthy();
    }
  });

  it('every phone has valid priceTier', () => {
    for (const phone of phoneData) {
      expect(VALID_PRICE_TIERS).toContain(phone.priceTier);
    }
  });

  it('every phone has valid formFactor', () => {
    for (const phone of phoneData) {
      expect(VALID_FORM_FACTORS).toContain(phone.formFactor);
    }
  });

  it('every phone has releaseYear between 2020-2026', () => {
    for (const phone of phoneData) {
      expect(phone.releaseYear).toBeGreaterThanOrEqual(2020);
      expect(phone.releaseYear).toBeLessThanOrEqual(2026);
    }
  });

  it('every phone has at least one fact', () => {
    for (const phone of phoneData) {
      expect(phone.facts.length).toBeGreaterThanOrEqual(1);
      for (const fact of phone.facts) {
        expect(fact.type).toBeTruthy();
        expect(fact.text).toBeTruthy();
      }
    }
  });

  it('imagePath follows naming convention', () => {
    for (const phone of phoneData) {
      expect(phone.imagePath).toMatch(/^\/public\/phones\/[\w-]+\.(jpg|png)$/);
    }
  });

  it('covers all three price tiers', () => {
    const tiers = new Set(phoneData.map(p => p.priceTier));
    for (const tier of VALID_PRICE_TIERS) {
      expect(tiers).toContain(tier);
    }
  });

  it('covers all three form factors', () => {
    const factors = new Set(phoneData.map(p => p.formFactor));
    for (const factor of VALID_FORM_FACTORS) {
      expect(factors).toContain(factor);
    }
  });
});
