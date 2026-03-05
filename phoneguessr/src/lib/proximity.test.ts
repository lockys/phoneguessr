import { describe, expect, it } from 'vitest';
import { computeProximity } from './proximity';
import type { PhoneMetadata } from './proximity';

describe('computeProximity', () => {
  const answer: PhoneMetadata = {
    releaseYear: 2024,
    priceTier: 'flagship',
    formFactor: 'bar',
  };

  it('all dimensions match', () => {
    const guess: PhoneMetadata = {
      releaseYear: 2024,
      priceTier: 'flagship',
      formFactor: 'bar',
    };
    expect(computeProximity(guess, answer)).toEqual({
      sameYear: true,
      sameTier: true,
      sameFormFactor: true,
    });
  });

  it('no dimensions match', () => {
    const guess: PhoneMetadata = {
      releaseYear: 2022,
      priceTier: 'budget',
      formFactor: 'fold',
    };
    expect(computeProximity(guess, answer)).toEqual({
      sameYear: false,
      sameTier: false,
      sameFormFactor: false,
    });
  });

  it('partial match: same year only', () => {
    const guess: PhoneMetadata = {
      releaseYear: 2024,
      priceTier: 'mid-range',
      formFactor: 'flip',
    };
    expect(computeProximity(guess, answer)).toEqual({
      sameYear: true,
      sameTier: false,
      sameFormFactor: false,
    });
  });

  it('partial match: same tier and form factor', () => {
    const guess: PhoneMetadata = {
      releaseYear: 2023,
      priceTier: 'flagship',
      formFactor: 'bar',
    };
    expect(computeProximity(guess, answer)).toEqual({
      sameYear: false,
      sameTier: true,
      sameFormFactor: true,
    });
  });

  it('null release year on guess returns null for sameYear', () => {
    const guess: PhoneMetadata = {
      releaseYear: null,
      priceTier: 'flagship',
      formFactor: 'bar',
    };
    expect(computeProximity(guess, answer)).toEqual({
      sameYear: null,
      sameTier: true,
      sameFormFactor: true,
    });
  });

  it('null release year on answer returns null for sameYear', () => {
    const answerNoYear: PhoneMetadata = {
      releaseYear: null,
      priceTier: 'flagship',
      formFactor: 'bar',
    };
    const guess: PhoneMetadata = {
      releaseYear: 2024,
      priceTier: 'flagship',
      formFactor: 'bar',
    };
    expect(computeProximity(guess, answerNoYear)).toEqual({
      sameYear: null,
      sameTier: true,
      sameFormFactor: true,
    });
  });

  it('all metadata null returns all null', () => {
    const noData: PhoneMetadata = {
      releaseYear: null,
      priceTier: null,
      formFactor: null,
    };
    expect(computeProximity(noData, answer)).toEqual({
      sameYear: null,
      sameTier: null,
      sameFormFactor: null,
    });
  });
});
