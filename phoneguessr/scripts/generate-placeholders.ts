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
  // Apple (20)
  { brand: 'Apple', model: 'iPhone 16 Pro Max', imagePath: '/phones/apple-iphone-16-pro-max.svg' },
  { brand: 'Apple', model: 'iPhone 16 Pro', imagePath: '/phones/apple-iphone-16-pro.svg' },
  { brand: 'Apple', model: 'iPhone 16', imagePath: '/phones/apple-iphone-16.svg' },
  { brand: 'Apple', model: 'iPhone 15 Pro Max', imagePath: '/phones/apple-iphone-15-pro-max.svg' },
  { brand: 'Apple', model: 'iPhone 15 Pro', imagePath: '/phones/apple-iphone-15-pro.svg' },
  { brand: 'Apple', model: 'iPhone 15', imagePath: '/phones/apple-iphone-15.svg' },
  { brand: 'Apple', model: 'iPhone 14 Pro', imagePath: '/phones/apple-iphone-14-pro.svg' },
  { brand: 'Apple', model: 'iPhone 14 Pro Max', imagePath: '/phones/apple-iphone-14-pro-max.svg' },
  { brand: 'Apple', model: 'iPhone 14', imagePath: '/phones/apple-iphone-14.svg' },
  { brand: 'Apple', model: 'iPhone 14 Plus', imagePath: '/phones/apple-iphone-14-plus.svg' },
  { brand: 'Apple', model: 'iPhone 13 Pro Max', imagePath: '/phones/apple-iphone-13-pro-max.svg' },
  { brand: 'Apple', model: 'iPhone 13 Pro', imagePath: '/phones/apple-iphone-13-pro.svg' },
  { brand: 'Apple', model: 'iPhone 13', imagePath: '/phones/apple-iphone-13.svg' },
  { brand: 'Apple', model: 'iPhone 13 mini', imagePath: '/phones/apple-iphone-13-mini.svg' },
  { brand: 'Apple', model: 'iPhone 12 Pro Max', imagePath: '/phones/apple-iphone-12-pro-max.svg' },
  { brand: 'Apple', model: 'iPhone 12 Pro', imagePath: '/phones/apple-iphone-12-pro.svg' },
  { brand: 'Apple', model: 'iPhone 12', imagePath: '/phones/apple-iphone-12.svg' },
  { brand: 'Apple', model: 'iPhone 12 mini', imagePath: '/phones/apple-iphone-12-mini.svg' },
  { brand: 'Apple', model: 'iPhone SE (3rd generation)', imagePath: '/phones/apple-iphone-se-3rd-generation.svg' },
  { brand: 'Apple', model: 'iPhone 11 Pro Max', imagePath: '/phones/apple-iphone-11-pro-max.svg' },

  // Samsung (22)
  { brand: 'Samsung', model: 'Galaxy S25 Ultra', imagePath: '/phones/samsung-galaxy-s25-ultra.svg' },
  { brand: 'Samsung', model: 'Galaxy S25+', imagePath: '/phones/samsung-galaxy-s25-plus.svg' },
  { brand: 'Samsung', model: 'Galaxy S25', imagePath: '/phones/samsung-galaxy-s25.svg' },
  { brand: 'Samsung', model: 'Galaxy S24 Ultra', imagePath: '/phones/samsung-galaxy-s24-ultra.svg' },
  { brand: 'Samsung', model: 'Galaxy S24+', imagePath: '/phones/samsung-galaxy-s24-plus.svg' },
  { brand: 'Samsung', model: 'Galaxy S24', imagePath: '/phones/samsung-galaxy-s24.svg' },
  { brand: 'Samsung', model: 'Galaxy S24 FE', imagePath: '/phones/samsung-galaxy-s24-fe.svg' },
  { brand: 'Samsung', model: 'Galaxy S23 Ultra', imagePath: '/phones/samsung-galaxy-s23-ultra.svg' },
  { brand: 'Samsung', model: 'Galaxy S23+', imagePath: '/phones/samsung-galaxy-s23-plus.svg' },
  { brand: 'Samsung', model: 'Galaxy S23', imagePath: '/phones/samsung-galaxy-s23.svg' },
  { brand: 'Samsung', model: 'Galaxy S23 FE', imagePath: '/phones/samsung-galaxy-s23-fe.svg' },
  { brand: 'Samsung', model: 'Galaxy S22 Ultra', imagePath: '/phones/samsung-galaxy-s22-ultra.svg' },
  { brand: 'Samsung', model: 'Galaxy S22', imagePath: '/phones/samsung-galaxy-s22.svg' },
  { brand: 'Samsung', model: 'Galaxy Z Fold 6', imagePath: '/phones/samsung-galaxy-z-fold-6.svg' },
  { brand: 'Samsung', model: 'Galaxy Z Flip 6', imagePath: '/phones/samsung-galaxy-z-flip-6.svg' },
  { brand: 'Samsung', model: 'Galaxy Z Fold 5', imagePath: '/phones/samsung-galaxy-z-fold-5.svg' },
  { brand: 'Samsung', model: 'Galaxy Z Flip 5', imagePath: '/phones/samsung-galaxy-z-flip-5.svg' },
  { brand: 'Samsung', model: 'Galaxy Z Fold 4', imagePath: '/phones/samsung-galaxy-z-fold-4.svg' },
  { brand: 'Samsung', model: 'Galaxy Z Flip 4', imagePath: '/phones/samsung-galaxy-z-flip-4.svg' },
  { brand: 'Samsung', model: 'Galaxy A55', imagePath: '/phones/samsung-galaxy-a55.svg' },
  { brand: 'Samsung', model: 'Galaxy A54', imagePath: '/phones/samsung-galaxy-a54.svg' },
  { brand: 'Samsung', model: 'Galaxy A35', imagePath: '/phones/samsung-galaxy-a35.svg' },

  // Google (12)
  { brand: 'Google', model: 'Pixel 9 Pro XL', imagePath: '/phones/google-pixel-9-pro-xl.svg' },
  { brand: 'Google', model: 'Pixel 9 Pro', imagePath: '/phones/google-pixel-9-pro.svg' },
  { brand: 'Google', model: 'Pixel 9 Pro Fold', imagePath: '/phones/google-pixel-9-pro-fold.svg' },
  { brand: 'Google', model: 'Pixel 9', imagePath: '/phones/google-pixel-9.svg' },
  { brand: 'Google', model: 'Pixel 8 Pro', imagePath: '/phones/google-pixel-8-pro.svg' },
  { brand: 'Google', model: 'Pixel 8', imagePath: '/phones/google-pixel-8.svg' },
  { brand: 'Google', model: 'Pixel 8a', imagePath: '/phones/google-pixel-8a.svg' },
  { brand: 'Google', model: 'Pixel 7 Pro', imagePath: '/phones/google-pixel-7-pro.svg' },
  { brand: 'Google', model: 'Pixel 7', imagePath: '/phones/google-pixel-7.svg' },
  { brand: 'Google', model: 'Pixel 7a', imagePath: '/phones/google-pixel-7a.svg' },
  { brand: 'Google', model: 'Pixel 6 Pro', imagePath: '/phones/google-pixel-6-pro.svg' },
  { brand: 'Google', model: 'Pixel 6a', imagePath: '/phones/google-pixel-6a.svg' },

  // OnePlus (9)
  { brand: 'OnePlus', model: '13', imagePath: '/phones/oneplus-13.svg' },
  { brand: 'OnePlus', model: '12', imagePath: '/phones/oneplus-12.svg' },
  { brand: 'OnePlus', model: '12R', imagePath: '/phones/oneplus-12r.svg' },
  { brand: 'OnePlus', model: '11', imagePath: '/phones/oneplus-11.svg' },
  { brand: 'OnePlus', model: '11R', imagePath: '/phones/oneplus-11r.svg' },
  { brand: 'OnePlus', model: 'Open', imagePath: '/phones/oneplus-open.svg' },
  { brand: 'OnePlus', model: 'Nord 4', imagePath: '/phones/oneplus-nord-4.svg' },
  { brand: 'OnePlus', model: 'Nord 3', imagePath: '/phones/oneplus-nord-3.svg' },
  { brand: 'OnePlus', model: 'Nord CE 4', imagePath: '/phones/oneplus-nord-ce-4.svg' },

  // Nothing (4)
  { brand: 'Nothing', model: 'Phone 2a Plus', imagePath: '/phones/nothing-phone-2a-plus.svg' },
  { brand: 'Nothing', model: 'Phone 2a', imagePath: '/phones/nothing-phone-2a.svg' },
  { brand: 'Nothing', model: 'Phone 2', imagePath: '/phones/nothing-phone-2.svg' },
  { brand: 'Nothing', model: 'Phone 1', imagePath: '/phones/nothing-phone-1.svg' },

  // Xiaomi (12)
  { brand: 'Xiaomi', model: '14 Ultra', imagePath: '/phones/xiaomi-14-ultra.svg' },
  { brand: 'Xiaomi', model: '14 Pro', imagePath: '/phones/xiaomi-14-pro.svg' },
  { brand: 'Xiaomi', model: '14', imagePath: '/phones/xiaomi-14.svg' },
  { brand: 'Xiaomi', model: '13 Ultra', imagePath: '/phones/xiaomi-13-ultra.svg' },
  { brand: 'Xiaomi', model: '13 Pro', imagePath: '/phones/xiaomi-13-pro.svg' },
  { brand: 'Xiaomi', model: '13', imagePath: '/phones/xiaomi-13.svg' },
  { brand: 'Xiaomi', model: 'Redmi Note 13 Pro+', imagePath: '/phones/xiaomi-redmi-note-13-pro-plus.svg' },
  { brand: 'Xiaomi', model: 'Redmi Note 13 Pro', imagePath: '/phones/xiaomi-redmi-note-13-pro.svg' },
  { brand: 'Xiaomi', model: 'Redmi Note 13', imagePath: '/phones/xiaomi-redmi-note-13.svg' },
  { brand: 'Xiaomi', model: 'POCO F6 Pro', imagePath: '/phones/xiaomi-poco-f6-pro.svg' },
  { brand: 'Xiaomi', model: 'POCO F6', imagePath: '/phones/xiaomi-poco-f6.svg' },
  { brand: 'Xiaomi', model: 'POCO X6 Pro', imagePath: '/phones/xiaomi-poco-x6-pro.svg' },

  // Sony (5)
  { brand: 'Sony', model: 'Xperia 1 VI', imagePath: '/phones/sony-xperia-1-vi.svg' },
  { brand: 'Sony', model: 'Xperia 5 V', imagePath: '/phones/sony-xperia-5-v.svg' },
  { brand: 'Sony', model: 'Xperia 10 VI', imagePath: '/phones/sony-xperia-10-vi.svg' },
  { brand: 'Sony', model: 'Xperia 1 V', imagePath: '/phones/sony-xperia-1-v.svg' },
  { brand: 'Sony', model: 'Xperia 5 IV', imagePath: '/phones/sony-xperia-5-iv.svg' },

  // Motorola (7)
  { brand: 'Motorola', model: 'Edge 50 Ultra', imagePath: '/phones/motorola-edge-50-ultra.svg' },
  { brand: 'Motorola', model: 'Edge 50 Pro', imagePath: '/phones/motorola-edge-50-pro.svg' },
  { brand: 'Motorola', model: 'Edge 50 Fusion', imagePath: '/phones/motorola-edge-50-fusion.svg' },
  { brand: 'Motorola', model: 'Razr 50 Ultra', imagePath: '/phones/motorola-razr-50-ultra.svg' },
  { brand: 'Motorola', model: 'Razr 50', imagePath: '/phones/motorola-razr-50.svg' },
  { brand: 'Motorola', model: 'Moto G Power (2024)', imagePath: '/phones/motorola-moto-g-power-2024.svg' },
  { brand: 'Motorola', model: 'Moto G Stylus (2024)', imagePath: '/phones/motorola-moto-g-stylus-2024.svg' },

  // Huawei (7)
  { brand: 'Huawei', model: 'Mate 60 Pro+', imagePath: '/phones/huawei-mate-60-pro-plus.svg' },
  { brand: 'Huawei', model: 'Mate 60 Pro', imagePath: '/phones/huawei-mate-60-pro.svg' },
  { brand: 'Huawei', model: 'Mate 60', imagePath: '/phones/huawei-mate-60.svg' },
  { brand: 'Huawei', model: 'Pura 70 Ultra', imagePath: '/phones/huawei-pura-70-ultra.svg' },
  { brand: 'Huawei', model: 'Pura 70 Pro', imagePath: '/phones/huawei-pura-70-pro.svg' },
  { brand: 'Huawei', model: 'P60 Pro', imagePath: '/phones/huawei-p60-pro.svg' },
  { brand: 'Huawei', model: 'P60 Art', imagePath: '/phones/huawei-p60-art.svg' },

  // OPPO (5)
  { brand: 'OPPO', model: 'Find X7 Ultra', imagePath: '/phones/oppo-find-x7-ultra.svg' },
  { brand: 'OPPO', model: 'Find X7', imagePath: '/phones/oppo-find-x7.svg' },
  { brand: 'OPPO', model: 'Reno 12 Pro', imagePath: '/phones/oppo-reno-12-pro.svg' },
  { brand: 'OPPO', model: 'Reno 12', imagePath: '/phones/oppo-reno-12.svg' },
  { brand: 'OPPO', model: 'A3 Pro', imagePath: '/phones/oppo-a3-pro.svg' },

  // Vivo (5)
  { brand: 'Vivo', model: 'X200 Pro', imagePath: '/phones/vivo-x200-pro.svg' },
  { brand: 'Vivo', model: 'X200', imagePath: '/phones/vivo-x200.svg' },
  { brand: 'Vivo', model: 'V40 Pro', imagePath: '/phones/vivo-v40-pro.svg' },
  { brand: 'Vivo', model: 'V40', imagePath: '/phones/vivo-v40.svg' },
  { brand: 'Vivo', model: 'iQOO 13', imagePath: '/phones/vivo-iqoo-13.svg' },

  // ASUS (4)
  { brand: 'ASUS', model: 'ROG Phone 8 Pro', imagePath: '/phones/asus-rog-phone-8-pro.svg' },
  { brand: 'ASUS', model: 'ROG Phone 8', imagePath: '/phones/asus-rog-phone-8.svg' },
  { brand: 'ASUS', model: 'Zenfone 11 Ultra', imagePath: '/phones/asus-zenfone-11-ultra.svg' },
  { brand: 'ASUS', model: 'Zenfone 10', imagePath: '/phones/asus-zenfone-10.svg' },

  // Realme (4)
  { brand: 'Realme', model: 'GT 6 Pro', imagePath: '/phones/realme-gt-6-pro.svg' },
  { brand: 'Realme', model: 'GT 6', imagePath: '/phones/realme-gt-6.svg' },
  { brand: 'Realme', model: '13 Pro+', imagePath: '/phones/realme-13-pro-plus.svg' },
  { brand: 'Realme', model: '13 Pro', imagePath: '/phones/realme-13-pro.svg' },

  // Honor (4)
  { brand: 'Honor', model: 'Magic 6 Pro', imagePath: '/phones/honor-magic-6-pro.svg' },
  { brand: 'Honor', model: 'Magic 6', imagePath: '/phones/honor-magic-6.svg' },
  { brand: 'Honor', model: '200 Pro', imagePath: '/phones/honor-200-pro.svg' },
  { brand: 'Honor', model: '200', imagePath: '/phones/honor-200.svg' },
];

const BRAND_COLORS: Record<string, { bg: string; fg: string; accent: string }> = {
  Apple: { bg: '#1c1c1e', fg: '#f5f5f7', accent: '#0071e3' },
  Samsung: { bg: '#1428a0', fg: '#ffffff', accent: '#00a0e3' },
  Google: { bg: '#202124', fg: '#e8eaed', accent: '#4285f4' },
  OnePlus: { bg: '#1a1a1a', fg: '#eb0028', accent: '#eb0028' },
  Nothing: { bg: '#000000', fg: '#ffffff', accent: '#d7d7d7' },
  Xiaomi: { bg: '#1a1a1a', fg: '#ffffff', accent: '#ff6900' },
  Sony: { bg: '#000000', fg: '#ffffff', accent: '#be0028' },
  Motorola: { bg: '#1a237e', fg: '#ffffff', accent: '#5c6bc0' },
  Huawei: { bg: '#1a1a1a', fg: '#ffffff', accent: '#cf0a2c' },
  OPPO: { bg: '#1a472a', fg: '#ffffff', accent: '#1a8c46' },
  Vivo: { bg: '#1a1a2e', fg: '#ffffff', accent: '#415fff' },
  ASUS: { bg: '#1a1a1a', fg: '#ffffff', accent: '#00bcd4' },
  Realme: { bg: '#1a1a1a', fg: '#ffc600', accent: '#ffc600' },
  Honor: { bg: '#1a1a2e', fg: '#ffffff', accent: '#2979ff' },
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

const outDir = join(__dirname, '..', 'config', 'public', 'phones');
mkdirSync(outDir, { recursive: true });

for (const phone of PHONES) {
  const filename = phone.imagePath.split('/').pop()!;
  const svg = generateSVG(phone);
  writeFileSync(join(outDir, filename), svg);
  console.log(`Generated ${filename}`);
}

console.log(`\nDone! ${PHONES.length} placeholder SVGs generated in public/phones/`);
