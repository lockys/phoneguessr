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

export type ZoomLevel = (typeof ZOOM_LEVELS)[number];
