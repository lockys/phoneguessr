import { describe, expect, it } from 'vitest';
import { calculateScore, getScoreBreakdown } from './scoring';

describe('calculateScore', () => {
  it('perfect guess with no hints: time only', () => {
    expect(calculateScore(12.4, 0, 0)).toBe(12.4);
  });

  it('multiple wrong guesses, no hints', () => {
    expect(calculateScore(35.2, 3, 0)).toBe(65.2);
  });

  it('single hint used', () => {
    expect(calculateScore(18.0, 1, 1)).toBe(43.0);
  });

  it('two hints used', () => {
    expect(calculateScore(25.0, 2, 2)).toBe(75.0);
  });

  it('no wrong guesses, two hints', () => {
    expect(calculateScore(15.0, 0, 2)).toBe(45.0);
  });

  it('fastest possible score', () => {
    expect(calculateScore(1.0, 0, 0)).toBe(1.0);
  });
});

describe('getScoreBreakdown', () => {
  it('returns breakdown with all penalty components', () => {
    const breakdown = getScoreBreakdown(20.0, 2, 1);
    expect(breakdown).toEqual({
      time: 20.0,
      guessPenalty: 20.0,
      hintPenalty: 15.0,
      total: 55.0,
    });
  });

  it('returns zero penalties when none used', () => {
    const breakdown = getScoreBreakdown(10.0, 0, 0);
    expect(breakdown).toEqual({
      time: 10.0,
      guessPenalty: 0,
      hintPenalty: 0,
      total: 10.0,
    });
  });

  it('total matches calculateScore', () => {
    const breakdown = getScoreBreakdown(30.0, 3, 2);
    expect(breakdown.total).toBe(calculateScore(30.0, 3, 2));
  });
});
