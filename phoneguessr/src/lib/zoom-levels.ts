/**
 * Zoom scale factors for each guess level.
 * Level 0 is the tightest crop (highest zoom), level 5 is the full image.
 * Used by both the server-side Sharp crop and the client-side canvas renderer.
 */
export const ZOOM_LEVELS = [
  4.17, // level 0: ~24% visible area
  2.5, // level 1: ~40% visible
  1.79, // level 2: ~56% visible
  1.39, // level 3: ~72% visible
  1.14, // level 4: ~88% visible
  1.0, // level 5: full image
] as const;

export const MAX_ZOOM_LEVEL = ZOOM_LEVELS.length - 1;

export type ZoomLevel = (typeof ZOOM_LEVELS)[number];

/**
 * Circle radius fractions for each guess level.
 * Fraction of canvas half-diagonal so 1.0 fully covers a square canvas.
 * Level 0 is the smallest peek hole, level 5 reveals everything.
 */
export const CIRCLE_RADII = [
  0.15, // level 0: small peek
  0.3, // level 1
  0.45, // level 2
  0.6, // level 3
  0.8, // level 4
  1.0, // level 5: full image
] as const;
