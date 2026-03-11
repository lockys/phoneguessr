import { describe, expect, it } from 'vitest';
import { MAX_ZOOM_LEVEL, ZOOM_LEVELS } from './zoom-levels';

describe('ZOOM_LEVELS', () => {
  it('has 6 levels (0 through 5)', () => {
    expect(ZOOM_LEVELS).toHaveLength(6);
  });

  it('starts zoomed in and ends at full scale', () => {
    expect(ZOOM_LEVELS[0]).toBeGreaterThan(1);
    expect(ZOOM_LEVELS[5]).toBe(1.0);
  });

  it('decreases monotonically (each level reveals more)', () => {
    for (let i = 1; i < ZOOM_LEVELS.length; i++) {
      expect(ZOOM_LEVELS[i]).toBeLessThan(ZOOM_LEVELS[i - 1]);
    }
  });

  it('contains the expected values', () => {
    expect([...ZOOM_LEVELS]).toEqual([4.17, 2.5, 1.79, 1.39, 1.14, 1.0]);
  });
});

describe('MAX_ZOOM_LEVEL', () => {
  it('equals the last index of ZOOM_LEVELS', () => {
    expect(MAX_ZOOM_LEVEL).toBe(ZOOM_LEVELS.length - 1);
    expect(MAX_ZOOM_LEVEL).toBe(5);
  });
});
