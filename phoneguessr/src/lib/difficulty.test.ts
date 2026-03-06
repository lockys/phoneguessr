import { describe, expect, it } from 'vitest';
import { computeDifficulty } from './difficulty';

describe('computeDifficulty', () => {
  it('returns easy for popular brand + recent phone', () => {
    expect(computeDifficulty({ brand: 'Apple', releaseYear: 2025 })).toBe(
      'easy',
    );
    expect(computeDifficulty({ brand: 'Samsung', releaseYear: 2025 })).toBe(
      'easy',
    );
  });

  it('returns hard for obscure brand', () => {
    expect(computeDifficulty({ brand: 'Nothing', releaseYear: 2024 })).toBe(
      'hard',
    );
    expect(computeDifficulty({ brand: 'Nokia', releaseYear: 2023 })).toBe(
      'hard',
    );
  });

  it('returns hard for old phones', () => {
    expect(computeDifficulty({ brand: 'Apple', releaseYear: 2021 })).toBe(
      'hard',
    );
  });

  it('returns medium for mid-popularity or mid-recency', () => {
    expect(computeDifficulty({ brand: 'Google', releaseYear: 2024 })).toBe(
      'medium',
    );
    expect(computeDifficulty({ brand: 'Samsung', releaseYear: 2024 })).toBe(
      'medium',
    );
  });

  it('defaults to medium difficulty when releaseYear is missing', () => {
    expect(computeDifficulty({ brand: 'Samsung' })).toBe('medium');
  });

  it('defaults to medium for unknown brand with null year', () => {
    expect(computeDifficulty({ brand: 'Samsung', releaseYear: null })).toBe(
      'medium',
    );
  });

  it('returns hard for unknown brand', () => {
    expect(
      computeDifficulty({ brand: 'UnknownBrand', releaseYear: 2024 }),
    ).toBe('hard');
  });
});
