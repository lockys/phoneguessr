import sharp from 'sharp';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../config/public/icons');

// Standard icon SVG — full bleed, designed for iOS (clips its own corners)
const svgStandard = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <!-- Background -->
  <rect width="512" height="512" fill="#1a1a2e"/>
  <!-- Phone body -->
  <rect x="141" y="77" width="230" height="358" rx="36" fill="#e2e8f0"/>
  <!-- Screen -->
  <rect x="160" y="128" width="192" height="242" rx="12" fill="#0f172a"/>
  <!-- Question mark -->
  <text
    x="256" y="275"
    text-anchor="middle"
    font-size="140"
    font-weight="900"
    fill="#f59e0b"
    font-family="system-ui,-apple-system,sans-serif"
  >?</text>
  <!-- Home button -->
  <circle cx="256" cy="402" r="18" fill="#94a3b8"/>
</svg>`.trim();

// Maskable icon SVG — phone inset 12% from all edges so content stays
// inside Android's 80% safe zone circle
const svgMaskable = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <!-- Background fills full canvas including padding -->
  <rect width="512" height="512" fill="#1a1a2e"/>
  <!-- Phone body (12% inset = 61px on each side, so 390px wide canvas) -->
  <rect x="176" y="118" width="160" height="276" rx="26" fill="#e2e8f0"/>
  <!-- Screen -->
  <rect x="192" y="152" width="128" height="168" rx="8" fill="#0f172a"/>
  <!-- Question mark -->
  <text
    x="256" y="262"
    text-anchor="middle"
    font-size="96"
    font-weight="900"
    fill="#f59e0b"
    font-family="system-ui,-apple-system,sans-serif"
  >?</text>
  <!-- Home button -->
  <circle cx="256" cy="368" r="13" fill="#94a3b8"/>
</svg>`.trim();

async function generate(
  svg: string,
  size: number,
  filename: string,
): Promise<void> {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(resolve(OUT, filename));
  console.log(`✓ ${filename}`);
}

await generate(svgStandard, 192, 'icon-192x192.png');
await generate(svgStandard, 512, 'icon-512x512.png');
await generate(svgStandard, 180, 'apple-touch-icon.png');
await generate(svgStandard, 32, 'favicon-32x32.png');
await generate(svgMaskable, 192, 'icon-192x192-maskable.png');
await generate(svgMaskable, 512, 'icon-512x512-maskable.png');

console.log('All icons generated.');
