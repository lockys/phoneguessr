import { ZOOM_LEVELS } from './zoom-levels.js';

/**
 * Computes the centered crop region for a given image size and zoom level.
 * The crop extracts (width/zoom) × (height/zoom) pixels centered on the image.
 */
export function computeCropRegion(
  imageWidth: number,
  imageHeight: number,
  level: number,
): { left: number; top: number; width: number; height: number } {
  const zoom =
    ZOOM_LEVELS[Math.min(Math.max(level, 0), ZOOM_LEVELS.length - 1)];
  const cropW = Math.round(imageWidth / zoom);
  const cropH = Math.round(imageHeight / zoom);
  const left = Math.round((imageWidth - cropW) / 2);
  const top = Math.round((imageHeight - cropH) / 2);
  return { left, top, width: cropW, height: cropH };
}

/**
 * Generates a centered crop of the image at the given zoom level using Sharp.
 * Returns a base64-encoded JPEG data URL.
 *
 * @param imagePath - Absolute path to the source image
 * @param level - Zoom level index (0 = tightest, 5 = full image)
 */
export async function generateCrop(
  imagePath: string,
  level: number,
): Promise<string> {
  const sharp = (await import('sharp')).default;
  const image = sharp(imagePath);
  const { width, height } = await image.metadata();

  if (!width || !height) {
    throw new Error(`Could not read dimensions from image: ${imagePath}`);
  }

  const region = computeCropRegion(width, height, level);

  const buffer = await image.extract(region).jpeg({ quality: 85 }).toBuffer();
  return `data:image/jpeg;base64,${buffer.toString('base64')}`;
}
