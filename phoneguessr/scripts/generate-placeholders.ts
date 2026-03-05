import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface Phone {
  brand: string;
  model: string;
  imagePath: string;
}

const PHONES: Phone[] = [
  { brand: 'Apple', model: 'iPhone 16 Pro Max', imagePath: '/phones/apple-iphone-16-pro-max.svg' },
  { brand: 'Apple', model: 'iPhone 16 Pro', imagePath: '/phones/apple-iphone-16-pro.svg' },
  { brand: 'Apple', model: 'iPhone 16', imagePath: '/phones/apple-iphone-16.svg' },
  { brand: 'Apple', model: 'iPhone 15 Pro Max', imagePath: '/phones/apple-iphone-15-pro-max.svg' },
  { brand: 'Apple', model: 'iPhone 15 Pro', imagePath: '/phones/apple-iphone-15-pro.svg' },
  { brand: 'Apple', model: 'iPhone 15', imagePath: '/phones/apple-iphone-15.svg' },
  { brand: 'Apple', model: 'iPhone 14 Pro', imagePath: '/phones/apple-iphone-14-pro.svg' },
  { brand: 'Samsung', model: 'Galaxy S25 Ultra', imagePath: '/phones/samsung-galaxy-s25-ultra.svg' },
  { brand: 'Samsung', model: 'Galaxy S24 Ultra', imagePath: '/phones/samsung-galaxy-s24-ultra.svg' },
  { brand: 'Samsung', model: 'Galaxy S24', imagePath: '/phones/samsung-galaxy-s24.svg' },
  { brand: 'Samsung', model: 'Galaxy Z Fold 6', imagePath: '/phones/samsung-galaxy-z-fold-6.svg' },
  { brand: 'Samsung', model: 'Galaxy Z Flip 6', imagePath: '/phones/samsung-galaxy-z-flip-6.svg' },
  { brand: 'Google', model: 'Pixel 9 Pro', imagePath: '/phones/google-pixel-9-pro.svg' },
  { brand: 'Google', model: 'Pixel 9', imagePath: '/phones/google-pixel-9.svg' },
  { brand: 'Google', model: 'Pixel 8 Pro', imagePath: '/phones/google-pixel-8-pro.svg' },
  { brand: 'Google', model: 'Pixel 8', imagePath: '/phones/google-pixel-8.svg' },
  { brand: 'OnePlus', model: '13', imagePath: '/phones/oneplus-13.svg' },
  { brand: 'OnePlus', model: '12', imagePath: '/phones/oneplus-12.svg' },
  { brand: 'Nothing', model: 'Phone 2', imagePath: '/phones/nothing-phone-2.svg' },
  { brand: 'Nothing', model: 'Phone 1', imagePath: '/phones/nothing-phone-1.svg' },
];

const BRAND_COLORS: Record<string, { bg: string; fg: string; accent: string }> = {
  Apple: { bg: '#1c1c1e', fg: '#f5f5f7', accent: '#0071e3' },
  Samsung: { bg: '#1428a0', fg: '#ffffff', accent: '#00a0e3' },
  Google: { bg: '#202124', fg: '#e8eaed', accent: '#4285f4' },
  OnePlus: { bg: '#1a1a1a', fg: '#eb0028', accent: '#eb0028' },
  Nothing: { bg: '#000000', fg: '#ffffff', accent: '#d7d7d7' },
};

function generateSVG(phone: Phone): string {
  const colors = BRAND_COLORS[phone.brand] || { bg: '#333', fg: '#fff', accent: '#666' };
  // Simple hash for visual variety
  const hash = [...`${phone.brand}${phone.model}`].reduce((a, c) => a + c.charCodeAt(0), 0);
  const rotation = hash % 360;
  const rx = 30 + (hash % 40);
  const ry = 40 + (hash % 30);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <rect width="400" height="400" fill="${colors.bg}"/>
  <ellipse cx="${150 + (hash % 100)}" cy="${120 + (hash % 80)}" rx="${rx}" ry="${ry}" fill="${colors.accent}" opacity="0.15" transform="rotate(${rotation} 200 200)"/>
  <ellipse cx="${200 + (hash % 60)}" cy="${250 + (hash % 50)}" rx="${ry}" ry="${rx}" fill="${colors.accent}" opacity="0.1" transform="rotate(${rotation + 45} 200 200)"/>
  <rect x="130" y="80" width="140" height="240" rx="20" fill="none" stroke="${colors.accent}" stroke-width="2" opacity="0.3"/>
  <circle cx="200" cy="130" r="15" fill="none" stroke="${colors.accent}" stroke-width="1.5" opacity="0.4"/>
  <circle cx="200" cy="130" r="6" fill="${colors.accent}" opacity="0.3"/>
  <text x="200" y="330" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" fill="${colors.fg}" opacity="0.6">${phone.brand}</text>
  <text x="200" y="355" text-anchor="middle" font-family="system-ui, sans-serif" font-size="18" font-weight="bold" fill="${colors.fg}" opacity="0.8">${phone.model}</text>
</svg>`;
}

const outDir = join(__dirname, '..', 'public', 'phones');
mkdirSync(outDir, { recursive: true });

for (const phone of PHONES) {
  const filename = phone.imagePath.split('/').pop()!;
  const svg = generateSVG(phone);
  writeFileSync(join(outDir, filename), svg);
  console.log(`Generated ${filename}`);
}

console.log(`\nDone! ${PHONES.length} placeholder SVGs generated in public/phones/`);
