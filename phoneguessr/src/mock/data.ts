export interface MockPhone {
  id: number;
  brand: string;
  model: string;
  imagePath: string;
}

export const MOCK_PHONES: MockPhone[] = [
  // Apple (20)
  { id: 1, brand: 'Apple', model: 'iPhone 16 Pro Max', imagePath: '/public/phones/apple-iphone-16-pro-max.jpg' },
  { id: 2, brand: 'Apple', model: 'iPhone 16 Pro', imagePath: '/public/phones/apple-iphone-16-pro.jpg' },
  { id: 3, brand: 'Apple', model: 'iPhone 16', imagePath: '/public/phones/apple-iphone-16.jpg' },
  { id: 4, brand: 'Apple', model: 'iPhone 15 Pro Max', imagePath: '/public/phones/apple-iphone-15-pro-max.jpg' },
  { id: 5, brand: 'Apple', model: 'iPhone 15 Pro', imagePath: '/public/phones/apple-iphone-15-pro.jpg' },
  { id: 6, brand: 'Apple', model: 'iPhone 15', imagePath: '/public/phones/apple-iphone-15.jpg' },
  { id: 7, brand: 'Apple', model: 'iPhone 14 Pro', imagePath: '/public/phones/apple-iphone-14-pro.jpg' },
  { id: 8, brand: 'Apple', model: 'iPhone 14 Pro Max', imagePath: '/public/phones/apple-iphone-14-pro-max.svg' },
  { id: 9, brand: 'Apple', model: 'iPhone 14', imagePath: '/public/phones/apple-iphone-14.svg' },
  { id: 10, brand: 'Apple', model: 'iPhone 14 Plus', imagePath: '/public/phones/apple-iphone-14-plus.svg' },
  { id: 11, brand: 'Apple', model: 'iPhone 13 Pro Max', imagePath: '/public/phones/apple-iphone-13-pro-max.svg' },
  { id: 12, brand: 'Apple', model: 'iPhone 13 Pro', imagePath: '/public/phones/apple-iphone-13-pro.svg' },
  { id: 13, brand: 'Apple', model: 'iPhone 13', imagePath: '/public/phones/apple-iphone-13.svg' },
  { id: 14, brand: 'Apple', model: 'iPhone 13 mini', imagePath: '/public/phones/apple-iphone-13-mini.svg' },
  { id: 15, brand: 'Apple', model: 'iPhone 12 Pro Max', imagePath: '/public/phones/apple-iphone-12-pro-max.svg' },
  { id: 16, brand: 'Apple', model: 'iPhone 12 Pro', imagePath: '/public/phones/apple-iphone-12-pro.svg' },
  { id: 17, brand: 'Apple', model: 'iPhone 12', imagePath: '/public/phones/apple-iphone-12.svg' },
  { id: 18, brand: 'Apple', model: 'iPhone 12 mini', imagePath: '/public/phones/apple-iphone-12-mini.svg' },
  { id: 19, brand: 'Apple', model: 'iPhone SE (3rd generation)', imagePath: '/public/phones/apple-iphone-se-3rd-generation.svg' },
  { id: 20, brand: 'Apple', model: 'iPhone 11 Pro Max', imagePath: '/public/phones/apple-iphone-11-pro-max.svg' },

  // Samsung (22)
  { id: 21, brand: 'Samsung', model: 'Galaxy S25 Ultra', imagePath: '/public/phones/samsung-galaxy-s25-ultra.jpg' },
  { id: 22, brand: 'Samsung', model: 'Galaxy S25+', imagePath: '/public/phones/samsung-galaxy-s25-plus.svg' },
  { id: 23, brand: 'Samsung', model: 'Galaxy S25', imagePath: '/public/phones/samsung-galaxy-s25.svg' },
  { id: 24, brand: 'Samsung', model: 'Galaxy S24 Ultra', imagePath: '/public/phones/samsung-galaxy-s24-ultra.jpg' },
  { id: 25, brand: 'Samsung', model: 'Galaxy S24+', imagePath: '/public/phones/samsung-galaxy-s24-plus.svg' },
  { id: 26, brand: 'Samsung', model: 'Galaxy S24', imagePath: '/public/phones/samsung-galaxy-s24.jpg' },
  { id: 27, brand: 'Samsung', model: 'Galaxy S24 FE', imagePath: '/public/phones/samsung-galaxy-s24-fe.svg' },
  { id: 28, brand: 'Samsung', model: 'Galaxy S23 Ultra', imagePath: '/public/phones/samsung-galaxy-s23-ultra.svg' },
  { id: 29, brand: 'Samsung', model: 'Galaxy S23+', imagePath: '/public/phones/samsung-galaxy-s23-plus.svg' },
  { id: 30, brand: 'Samsung', model: 'Galaxy S23', imagePath: '/public/phones/samsung-galaxy-s23.svg' },
  { id: 31, brand: 'Samsung', model: 'Galaxy S23 FE', imagePath: '/public/phones/samsung-galaxy-s23-fe.svg' },
  { id: 32, brand: 'Samsung', model: 'Galaxy S22 Ultra', imagePath: '/public/phones/samsung-galaxy-s22-ultra.svg' },
  { id: 33, brand: 'Samsung', model: 'Galaxy S22', imagePath: '/public/phones/samsung-galaxy-s22.svg' },
  { id: 34, brand: 'Samsung', model: 'Galaxy Z Fold 6', imagePath: '/public/phones/samsung-galaxy-z-fold-6.jpg' },
  { id: 35, brand: 'Samsung', model: 'Galaxy Z Flip 6', imagePath: '/public/phones/samsung-galaxy-z-flip-6.jpg' },
  { id: 36, brand: 'Samsung', model: 'Galaxy Z Fold 5', imagePath: '/public/phones/samsung-galaxy-z-fold-5.svg' },
  { id: 37, brand: 'Samsung', model: 'Galaxy Z Flip 5', imagePath: '/public/phones/samsung-galaxy-z-flip-5.svg' },
  { id: 38, brand: 'Samsung', model: 'Galaxy Z Fold 4', imagePath: '/public/phones/samsung-galaxy-z-fold-4.svg' },
  { id: 39, brand: 'Samsung', model: 'Galaxy Z Flip 4', imagePath: '/public/phones/samsung-galaxy-z-flip-4.svg' },
  { id: 40, brand: 'Samsung', model: 'Galaxy A55', imagePath: '/public/phones/samsung-galaxy-a55.svg' },
  { id: 41, brand: 'Samsung', model: 'Galaxy A54', imagePath: '/public/phones/samsung-galaxy-a54.svg' },
  { id: 42, brand: 'Samsung', model: 'Galaxy A35', imagePath: '/public/phones/samsung-galaxy-a35.svg' },

  // Google (12)
  { id: 43, brand: 'Google', model: 'Pixel 9 Pro XL', imagePath: '/public/phones/google-pixel-9-pro-xl.svg' },
  { id: 44, brand: 'Google', model: 'Pixel 9 Pro', imagePath: '/public/phones/google-pixel-9-pro.jpg' },
  { id: 45, brand: 'Google', model: 'Pixel 9 Pro Fold', imagePath: '/public/phones/google-pixel-9-pro-fold.svg' },
  { id: 46, brand: 'Google', model: 'Pixel 9', imagePath: '/public/phones/google-pixel-9.jpg' },
  { id: 47, brand: 'Google', model: 'Pixel 8 Pro', imagePath: '/public/phones/google-pixel-8-pro.jpg' },
  { id: 48, brand: 'Google', model: 'Pixel 8', imagePath: '/public/phones/google-pixel-8.jpg' },
  { id: 49, brand: 'Google', model: 'Pixel 8a', imagePath: '/public/phones/google-pixel-8a.svg' },
  { id: 50, brand: 'Google', model: 'Pixel 7 Pro', imagePath: '/public/phones/google-pixel-7-pro.svg' },
  { id: 51, brand: 'Google', model: 'Pixel 7', imagePath: '/public/phones/google-pixel-7.svg' },
  { id: 52, brand: 'Google', model: 'Pixel 7a', imagePath: '/public/phones/google-pixel-7a.svg' },
  { id: 53, brand: 'Google', model: 'Pixel 6 Pro', imagePath: '/public/phones/google-pixel-6-pro.svg' },
  { id: 54, brand: 'Google', model: 'Pixel 6a', imagePath: '/public/phones/google-pixel-6a.svg' },

  // OnePlus (9)
  { id: 55, brand: 'OnePlus', model: '13', imagePath: '/public/phones/oneplus-13.png' },
  { id: 56, brand: 'OnePlus', model: '12', imagePath: '/public/phones/oneplus-12.jpg' },
  { id: 57, brand: 'OnePlus', model: '12R', imagePath: '/public/phones/oneplus-12r.svg' },
  { id: 58, brand: 'OnePlus', model: '11', imagePath: '/public/phones/oneplus-11.svg' },
  { id: 59, brand: 'OnePlus', model: '11R', imagePath: '/public/phones/oneplus-11r.svg' },
  { id: 60, brand: 'OnePlus', model: 'Open', imagePath: '/public/phones/oneplus-open.svg' },
  { id: 61, brand: 'OnePlus', model: 'Nord 4', imagePath: '/public/phones/oneplus-nord-4.svg' },
  { id: 62, brand: 'OnePlus', model: 'Nord 3', imagePath: '/public/phones/oneplus-nord-3.svg' },
  { id: 63, brand: 'OnePlus', model: 'Nord CE 4', imagePath: '/public/phones/oneplus-nord-ce-4.svg' },

  // Nothing (4)
  { id: 64, brand: 'Nothing', model: 'Phone 2a Plus', imagePath: '/public/phones/nothing-phone-2a-plus.svg' },
  { id: 65, brand: 'Nothing', model: 'Phone 2a', imagePath: '/public/phones/nothing-phone-2a.svg' },
  { id: 66, brand: 'Nothing', model: 'Phone 2', imagePath: '/public/phones/nothing-phone-2.png' },
  { id: 67, brand: 'Nothing', model: 'Phone 1', imagePath: '/public/phones/nothing-phone-1.png' },

  // Xiaomi (12)
  { id: 68, brand: 'Xiaomi', model: '14 Ultra', imagePath: '/public/phones/xiaomi-14-ultra.svg' },
  { id: 69, brand: 'Xiaomi', model: '14 Pro', imagePath: '/public/phones/xiaomi-14-pro.svg' },
  { id: 70, brand: 'Xiaomi', model: '14', imagePath: '/public/phones/xiaomi-14.svg' },
  { id: 71, brand: 'Xiaomi', model: '13 Ultra', imagePath: '/public/phones/xiaomi-13-ultra.svg' },
  { id: 72, brand: 'Xiaomi', model: '13 Pro', imagePath: '/public/phones/xiaomi-13-pro.svg' },
  { id: 73, brand: 'Xiaomi', model: '13', imagePath: '/public/phones/xiaomi-13.svg' },
  { id: 74, brand: 'Xiaomi', model: 'Redmi Note 13 Pro+', imagePath: '/public/phones/xiaomi-redmi-note-13-pro-plus.svg' },
  { id: 75, brand: 'Xiaomi', model: 'Redmi Note 13 Pro', imagePath: '/public/phones/xiaomi-redmi-note-13-pro.svg' },
  { id: 76, brand: 'Xiaomi', model: 'Redmi Note 13', imagePath: '/public/phones/xiaomi-redmi-note-13.svg' },
  { id: 77, brand: 'Xiaomi', model: 'POCO F6 Pro', imagePath: '/public/phones/xiaomi-poco-f6-pro.svg' },
  { id: 78, brand: 'Xiaomi', model: 'POCO F6', imagePath: '/public/phones/xiaomi-poco-f6.svg' },
  { id: 79, brand: 'Xiaomi', model: 'POCO X6 Pro', imagePath: '/public/phones/xiaomi-poco-x6-pro.svg' },

  // Sony (5)
  { id: 80, brand: 'Sony', model: 'Xperia 1 VI', imagePath: '/public/phones/sony-xperia-1-vi.svg' },
  { id: 81, brand: 'Sony', model: 'Xperia 5 V', imagePath: '/public/phones/sony-xperia-5-v.svg' },
  { id: 82, brand: 'Sony', model: 'Xperia 10 VI', imagePath: '/public/phones/sony-xperia-10-vi.svg' },
  { id: 83, brand: 'Sony', model: 'Xperia 1 V', imagePath: '/public/phones/sony-xperia-1-v.svg' },
  { id: 84, brand: 'Sony', model: 'Xperia 5 IV', imagePath: '/public/phones/sony-xperia-5-iv.svg' },

  // Motorola (7)
  { id: 85, brand: 'Motorola', model: 'Edge 50 Ultra', imagePath: '/public/phones/motorola-edge-50-ultra.svg' },
  { id: 86, brand: 'Motorola', model: 'Edge 50 Pro', imagePath: '/public/phones/motorola-edge-50-pro.svg' },
  { id: 87, brand: 'Motorola', model: 'Edge 50 Fusion', imagePath: '/public/phones/motorola-edge-50-fusion.svg' },
  { id: 88, brand: 'Motorola', model: 'Razr 50 Ultra', imagePath: '/public/phones/motorola-razr-50-ultra.svg' },
  { id: 89, brand: 'Motorola', model: 'Razr 50', imagePath: '/public/phones/motorola-razr-50.svg' },
  { id: 90, brand: 'Motorola', model: 'Moto G Power (2024)', imagePath: '/public/phones/motorola-moto-g-power-2024.svg' },
  { id: 91, brand: 'Motorola', model: 'Moto G Stylus (2024)', imagePath: '/public/phones/motorola-moto-g-stylus-2024.svg' },

  // Huawei (7)
  { id: 92, brand: 'Huawei', model: 'Mate 60 Pro+', imagePath: '/public/phones/huawei-mate-60-pro-plus.svg' },
  { id: 93, brand: 'Huawei', model: 'Mate 60 Pro', imagePath: '/public/phones/huawei-mate-60-pro.svg' },
  { id: 94, brand: 'Huawei', model: 'Mate 60', imagePath: '/public/phones/huawei-mate-60.svg' },
  { id: 95, brand: 'Huawei', model: 'Pura 70 Ultra', imagePath: '/public/phones/huawei-pura-70-ultra.svg' },
  { id: 96, brand: 'Huawei', model: 'Pura 70 Pro', imagePath: '/public/phones/huawei-pura-70-pro.svg' },
  { id: 97, brand: 'Huawei', model: 'P60 Pro', imagePath: '/public/phones/huawei-p60-pro.svg' },
  { id: 98, brand: 'Huawei', model: 'P60 Art', imagePath: '/public/phones/huawei-p60-art.svg' },

  // OPPO (5)
  { id: 99, brand: 'OPPO', model: 'Find X7 Ultra', imagePath: '/public/phones/oppo-find-x7-ultra.svg' },
  { id: 100, brand: 'OPPO', model: 'Find X7', imagePath: '/public/phones/oppo-find-x7.svg' },
  { id: 101, brand: 'OPPO', model: 'Reno 12 Pro', imagePath: '/public/phones/oppo-reno-12-pro.svg' },
  { id: 102, brand: 'OPPO', model: 'Reno 12', imagePath: '/public/phones/oppo-reno-12.svg' },
  { id: 103, brand: 'OPPO', model: 'A3 Pro', imagePath: '/public/phones/oppo-a3-pro.svg' },

  // Vivo (5)
  { id: 104, brand: 'Vivo', model: 'X200 Pro', imagePath: '/public/phones/vivo-x200-pro.svg' },
  { id: 105, brand: 'Vivo', model: 'X200', imagePath: '/public/phones/vivo-x200.svg' },
  { id: 106, brand: 'Vivo', model: 'V40 Pro', imagePath: '/public/phones/vivo-v40-pro.svg' },
  { id: 107, brand: 'Vivo', model: 'V40', imagePath: '/public/phones/vivo-v40.svg' },
  { id: 108, brand: 'Vivo', model: 'iQOO 13', imagePath: '/public/phones/vivo-iqoo-13.svg' },

  // ASUS (4)
  { id: 109, brand: 'ASUS', model: 'ROG Phone 8 Pro', imagePath: '/public/phones/asus-rog-phone-8-pro.svg' },
  { id: 110, brand: 'ASUS', model: 'ROG Phone 8', imagePath: '/public/phones/asus-rog-phone-8.svg' },
  { id: 111, brand: 'ASUS', model: 'Zenfone 11 Ultra', imagePath: '/public/phones/asus-zenfone-11-ultra.svg' },
  { id: 112, brand: 'ASUS', model: 'Zenfone 10', imagePath: '/public/phones/asus-zenfone-10.svg' },

  // Realme (4)
  { id: 113, brand: 'Realme', model: 'GT 6 Pro', imagePath: '/public/phones/realme-gt-6-pro.svg' },
  { id: 114, brand: 'Realme', model: 'GT 6', imagePath: '/public/phones/realme-gt-6.svg' },
  { id: 115, brand: 'Realme', model: '13 Pro+', imagePath: '/public/phones/realme-13-pro-plus.svg' },
  { id: 116, brand: 'Realme', model: '13 Pro', imagePath: '/public/phones/realme-13-pro.svg' },

  // Honor (4)
  { id: 117, brand: 'Honor', model: 'Magic 6 Pro', imagePath: '/public/phones/honor-magic-6-pro.svg' },
  { id: 118, brand: 'Honor', model: 'Magic 6', imagePath: '/public/phones/honor-magic-6.svg' },
  { id: 119, brand: 'Honor', model: '200 Pro', imagePath: '/public/phones/honor-200-pro.svg' },
  { id: 120, brand: 'Honor', model: '200', imagePath: '/public/phones/honor-200.svg' },
];

export const MOCK_USER = {
  id: 1,
  displayName: '卡爾文',
  avatarUrl: null,
};

export const MOCK_LEADERBOARD_DAILY = [
  { rank: 1, displayName: 'SpeedRunner', avatarUrl: null, score: 8.3, guessCount: 1 },
  { rank: 2, displayName: 'PhoneNerd42', avatarUrl: null, score: 15.7, guessCount: 2 },
  { rank: 3, displayName: 'TechGuru', avatarUrl: null, score: 22.1, guessCount: 2 },
  { rank: 4, displayName: 'GadgetFan', avatarUrl: null, score: 35.4, guessCount: 3 },
  { rank: 5, displayName: 'MobileKing', avatarUrl: null, score: 48.9, guessCount: 4 },
];

export const MOCK_LEADERBOARD_AGGREGATE = [
  { rank: 1, displayName: 'SpeedRunner', avatarUrl: null, totalWins: 27 },
  { rank: 2, displayName: 'PhoneNerd42', avatarUrl: null, totalWins: 24 },
  { rank: 3, displayName: 'TechGuru', avatarUrl: null, totalWins: 21 },
  { rank: 4, displayName: 'GadgetFan', avatarUrl: null, totalWins: 18 },
  { rank: 5, displayName: 'MobileKing', avatarUrl: null, totalWins: 15 },
];
