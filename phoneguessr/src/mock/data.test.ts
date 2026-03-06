import { describe, expect, it } from 'vitest';
import { MOCK_PHONES } from './data';
<<<<<<< HEAD
import type { FormFactor, PriceTier } from './data';

const VALID_PRICE_TIERS: PriceTier[] = ['budget', 'mid-range', 'flagship'];
const VALID_FORM_FACTORS: FormFactor[] = ['bar', 'flip', 'fold'];

describe('MOCK_PHONES', () => {
  it('has at least 40 phones for adequate mock coverage', () => {
    expect(MOCK_PHONES.length).toBeGreaterThanOrEqual(40);
  });

  it('has unique IDs', () => {
    const ids = MOCK_PHONES.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has sequential IDs starting from 1', () => {
    for (let i = 0; i < MOCK_PHONES.length; i++) {
      expect(MOCK_PHONES[i].id).toBe(i + 1);
    }
  });

  it('all phones have metadata fields populated', () => {
    for (const phone of MOCK_PHONES) {
      expect(phone.releaseYear).toBeTypeOf('number');
      expect(VALID_PRICE_TIERS).toContain(phone.priceTier);
      expect(VALID_FORM_FACTORS).toContain(phone.formFactor);
      expect(phone.region).toBeTruthy();
    }
  });

  it('covers multiple brands', () => {
    const brands = new Set(MOCK_PHONES.map(p => p.brand));
    expect(brands.size).toBeGreaterThanOrEqual(10);
  });

  it('includes all form factors', () => {
    const factors = new Set(MOCK_PHONES.map(p => p.formFactor));
    for (const factor of VALID_FORM_FACTORS) {
      expect(factors).toContain(factor);
    }
  });

  it('includes all price tiers', () => {
    const tiers = new Set(MOCK_PHONES.map(p => p.priceTier));
    for (const tier of VALID_PRICE_TIERS) {
      expect(tiers).toContain(tier);
    }
  });
=======

describe('MOCK_PHONES', () => {
  it('has releaseYear for all phones', () => {
    for (const phone of MOCK_PHONES) {
      expect(phone.releaseYear).toBeTypeOf('number');
      expect(phone.releaseYear).toBeGreaterThanOrEqual(2020);
      expect(phone.releaseYear).toBeLessThanOrEqual(2026);
    }
  });

  it('has valid priceTier for all phones', () => {
    const validTiers = ['budget', 'mid', 'flagship'];
    for (const phone of MOCK_PHONES) {
      expect(validTiers).toContain(phone.priceTier);
    }
  });

  it('has unique ids', () => {
    const ids = MOCK_PHONES.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
>>>>>>> 3428b9a (feat: implement hint system API endpoint)
});
