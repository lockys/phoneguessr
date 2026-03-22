import { describe, expect, it, vi } from 'vitest';

// Mock database module to prevent neon() initialization
vi.mock('../db/index.js', () => ({ db: {} }));

import { DIFFICULTY_WEIGHTS, pickDifficulty } from './puzzle.js';

describe('pickDifficulty', () => {
  it('returns easy for roll below easy threshold', () => {
    expect(pickDifficulty(0)).toBe('easy');
    expect(pickDifficulty(0.1)).toBe('easy');
    expect(pickDifficulty(DIFFICULTY_WEIGHTS.easy - 0.001)).toBe('easy');
  });

  it('returns medium for roll in medium range', () => {
    expect(pickDifficulty(DIFFICULTY_WEIGHTS.easy)).toBe('medium');
    expect(pickDifficulty(DIFFICULTY_WEIGHTS.easy + 0.1)).toBe('medium');
    const mediumEnd = DIFFICULTY_WEIGHTS.easy + DIFFICULTY_WEIGHTS.medium;
    expect(pickDifficulty(mediumEnd - 0.001)).toBe('medium');
  });

  it('returns hard for roll above medium threshold', () => {
    const hardStart = DIFFICULTY_WEIGHTS.easy + DIFFICULTY_WEIGHTS.medium;
    expect(pickDifficulty(hardStart)).toBe('hard');
    expect(pickDifficulty(0.9)).toBe('hard');
    expect(pickDifficulty(0.9999)).toBe('hard');
  });
});

describe('DIFFICULTY_WEIGHTS', () => {
  it('easy weight is 20%', () => {
    expect(DIFFICULTY_WEIGHTS.easy).toBe(0.2);
  });

  it('medium weight is 25%', () => {
    expect(DIFFICULTY_WEIGHTS.medium).toBe(0.25);
  });

  it('hard weight is at least 30%', () => {
    expect(DIFFICULTY_WEIGHTS.hard).toBeGreaterThanOrEqual(0.3);
  });

  it('weights sum to 1', () => {
    const sum =
      DIFFICULTY_WEIGHTS.easy +
      DIFFICULTY_WEIGHTS.medium +
      DIFFICULTY_WEIGHTS.hard;
    expect(sum).toBeCloseTo(1.0);
  });

  it('simulated distribution matches weights within 5%', () => {
    const N = 10000;
    const counts = { easy: 0, medium: 0, hard: 0 };
    for (let i = 0; i < N; i++) {
      const result = pickDifficulty(Math.random());
      counts[result]++;
    }
    expect(counts.easy / N).toBeCloseTo(DIFFICULTY_WEIGHTS.easy, 1);
    expect(counts.medium / N).toBeCloseTo(DIFFICULTY_WEIGHTS.medium, 1);
    expect(counts.hard / N).toBeCloseTo(DIFFICULTY_WEIGHTS.hard, 1);
  });
});
