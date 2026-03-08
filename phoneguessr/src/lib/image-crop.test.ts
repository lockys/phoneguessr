// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { computeCropRegion } from './image-crop.js';
import { ZOOM_LEVELS } from './zoom-levels.js';

const IMAGE_W = 800;
const IMAGE_H = 1000;

describe('computeCropRegion', () => {
  it('returns full image at level 5 (zoom 1.0)', () => {
    const region = computeCropRegion(IMAGE_W, IMAGE_H, 5);
    expect(region.width).toBe(IMAGE_W);
    expect(region.height).toBe(IMAGE_H);
    expect(region.left).toBe(0);
    expect(region.top).toBe(0);
  });

  it('crop dimensions match ZOOM_LEVELS at each level', () => {
    for (let level = 0; level < ZOOM_LEVELS.length; level++) {
      const zoom = ZOOM_LEVELS[level];
      const region = computeCropRegion(IMAGE_W, IMAGE_H, level);
      expect(region.width).toBe(Math.round(IMAGE_W / zoom));
      expect(region.height).toBe(Math.round(IMAGE_H / zoom));
    }
  });

  it('crop is centered within the image', () => {
    for (let level = 0; level < ZOOM_LEVELS.length; level++) {
      const region = computeCropRegion(IMAGE_W, IMAGE_H, level);
      // left and top should each be half the removed pixels
      const expectedLeft = Math.round((IMAGE_W - region.width) / 2);
      const expectedTop = Math.round((IMAGE_H - region.height) / 2);
      expect(region.left).toBe(expectedLeft);
      expect(region.top).toBe(expectedTop);
    }
  });

  it('tightest crop (level 0) is smallest', () => {
    const level0 = computeCropRegion(IMAGE_W, IMAGE_H, 0);
    const level5 = computeCropRegion(IMAGE_W, IMAGE_H, 5);
    expect(level0.width).toBeLessThan(level5.width);
    expect(level0.height).toBeLessThan(level5.height);
  });

  it('crop sizes decrease monotonically from level 5 to level 0', () => {
    let prevWidth = IMAGE_W + 1;
    for (let level = 5; level >= 0; level--) {
      const region = computeCropRegion(IMAGE_W, IMAGE_H, level);
      expect(region.width).toBeLessThanOrEqual(prevWidth);
      prevWidth = region.width;
    }
  });

  it('clamps out-of-range levels', () => {
    const levelNeg = computeCropRegion(IMAGE_W, IMAGE_H, -1);
    const level0 = computeCropRegion(IMAGE_W, IMAGE_H, 0);
    expect(levelNeg).toEqual(level0);

    const level99 = computeCropRegion(IMAGE_W, IMAGE_H, 99);
    const level5 = computeCropRegion(IMAGE_W, IMAGE_H, 5);
    expect(level99).toEqual(level5);
  });

  it('crop region stays within image bounds', () => {
    for (let level = 0; level < ZOOM_LEVELS.length; level++) {
      const region = computeCropRegion(IMAGE_W, IMAGE_H, level);
      expect(region.left).toBeGreaterThanOrEqual(0);
      expect(region.top).toBeGreaterThanOrEqual(0);
      expect(region.left + region.width).toBeLessThanOrEqual(IMAGE_W);
      expect(region.top + region.height).toBeLessThanOrEqual(IMAGE_H);
    }
  });
});

describe('ZOOM_LEVELS', () => {
  it('has exactly 6 levels', () => {
    expect(ZOOM_LEVELS.length).toBe(6);
  });

  it('starts at 4.17 and ends at 1.0', () => {
    expect(ZOOM_LEVELS[0]).toBe(4.17);
    expect(ZOOM_LEVELS[5]).toBe(1.0);
  });

  it('decreases monotonically from level 0 to level 5', () => {
    for (let i = 1; i < ZOOM_LEVELS.length; i++) {
      expect(ZOOM_LEVELS[i]).toBeLessThan(ZOOM_LEVELS[i - 1]);
    }
  });

  it('all values are >= 1.0', () => {
    for (const zoom of ZOOM_LEVELS) {
      expect(zoom).toBeGreaterThanOrEqual(1.0);
    }
  });
});
