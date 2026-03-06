import { describe, expect, it } from 'vitest';
import phoneData from './phone-data.json';

const VALID_PRICE_TIERS = ['budget', 'mid-range', 'flagship'];
const VALID_FORM_FACTORS = ['bar', 'flip', 'fold'];
const MIN_PHONE_COUNT = 120;
const MIN_BRAND_COUNT = 14;

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

  it('every phone has required base fields', () => {
    for (const phone of phoneData) {
      expect(phone.brand).toBeTruthy();
      expect(phone.model).toBeTruthy();
      expect(phone.imagePath).toBeTruthy();
    }
  });

  it('imagePath follows naming convention', () => {
    for (const phone of phoneData) {
      expect(phone.imagePath).toMatch(
        /^\/public\/phones\/[\w-]+\.(jpg|png|svg)$/,
      );
    }
  });

  describe('metadata fields (when populated)', () => {
    const phonesWithMetadata = phoneData.filter(
      p =>
        'releaseYear' in p &&
        'priceTier' in p &&
        'formFactor' in p &&
        'facts' in p,
    );

    it.skipIf(phonesWithMetadata.length === 0)(
      'every populated phone has valid priceTier',
      () => {
        for (const phone of phonesWithMetadata) {
          expect(VALID_PRICE_TIERS).toContain(
            (phone as Record<string, unknown>).priceTier,
          );
        }
      },
    );

    it.skipIf(phonesWithMetadata.length === 0)(
      'every populated phone has valid formFactor',
      () => {
        for (const phone of phonesWithMetadata) {
          expect(VALID_FORM_FACTORS).toContain(
            (phone as Record<string, unknown>).formFactor,
          );
        }
      },
    );

    it.skipIf(phonesWithMetadata.length === 0)(
      'every populated phone has releaseYear between 2020-2026',
      () => {
        for (const phone of phonesWithMetadata) {
          const year = (phone as Record<string, unknown>).releaseYear as number;
          expect(year).toBeGreaterThanOrEqual(2020);
          expect(year).toBeLessThanOrEqual(2026);
        }
      },
    );

    it.skipIf(phonesWithMetadata.length === 0)(
      'every populated phone has at least one fact',
      () => {
        for (const phone of phonesWithMetadata) {
          const facts = (phone as Record<string, unknown>).facts as Array<
            Record<string, string>
          >;
          expect(facts.length).toBeGreaterThanOrEqual(1);
          for (const fact of facts) {
            expect(fact.type).toBeTruthy();
            expect(fact.text).toBeTruthy();
          }
        }
      },
    );

    it('tracks metadata population progress', () => {
      const total = phoneData.length;
      const populated = phonesWithMetadata.length;
      console.log(
        `Phone metadata: ${populated}/${total} populated (${Math.round((populated / total) * 100)}%)`,
      );
      // This test documents the current state - no assertion to fail
    });
  });
});
