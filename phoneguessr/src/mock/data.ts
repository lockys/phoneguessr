export type PriceTier = 'budget' | 'mid-range' | 'flagship';
export type FormFactor = 'bar' | 'flip' | 'fold';

export interface MockPhone {
  id: number;
  brand: string;
  model: string;
  imagePath: string;
<<<<<<< HEAD
  releaseYear?: number;
  priceTier?: PriceTier;
  formFactor?: FormFactor;
  region?: string;
=======
  releaseYear: number;
  priceTier: 'budget' | 'mid' | 'flagship';
>>>>>>> 3428b9a (feat: implement hint system API endpoint)
}

export const MOCK_PHONES: MockPhone[] = [
  {
    id: 1,
    brand: 'Apple',
    model: 'iPhone 16 Pro Max',
    imagePath: '/public/phones/apple-iphone-16-pro-max.jpg',
    releaseYear: 2024,
    priceTier: 'flagship',
<<<<<<< HEAD
    formFactor: 'bar',
    region: 'global',
=======
>>>>>>> 3428b9a (feat: implement hint system API endpoint)
  },
  {
    id: 2,
    brand: 'Apple',
    model: 'iPhone 16 Pro',
    imagePath: '/public/phones/apple-iphone-16-pro.jpg',
    releaseYear: 2024,
    priceTier: 'flagship',
<<<<<<< HEAD
    formFactor: 'bar',
    region: 'global',
=======
>>>>>>> 3428b9a (feat: implement hint system API endpoint)
  },
  {
    id: 3,
    brand: 'Apple',
    model: 'iPhone 16',
    imagePath: '/public/phones/apple-iphone-16.jpg',
    releaseYear: 2024,
<<<<<<< HEAD
    priceTier: 'flagship',
    formFactor: 'bar',
    region: 'global',
=======
    priceTier: 'mid',
>>>>>>> 3428b9a (feat: implement hint system API endpoint)
  },
  {
    id: 4,
    brand: 'Apple',
    model: 'iPhone 15 Pro Max',
    imagePath: '/public/phones/apple-iphone-15-pro-max.jpg',
    releaseYear: 2023,
    priceTier: 'flagship',
<<<<<<< HEAD
    formFactor: 'bar',
    region: 'global',
=======
>>>>>>> 3428b9a (feat: implement hint system API endpoint)
  },
  {
    id: 5,
    brand: 'Apple',
    model: 'iPhone 15 Pro',
    imagePath: '/public/phones/apple-iphone-15-pro.jpg',
    releaseYear: 2023,
    priceTier: 'flagship',
<<<<<<< HEAD
    formFactor: 'bar',
    region: 'global',
=======
>>>>>>> 3428b9a (feat: implement hint system API endpoint)
  },
  {
    id: 6,
    brand: 'Apple',
    model: 'iPhone 15',
    imagePath: '/public/phones/apple-iphone-15.jpg',
    releaseYear: 2023,
<<<<<<< HEAD
    priceTier: 'flagship',
    formFactor: 'bar',
    region: 'global',
=======
    priceTier: 'mid',
>>>>>>> 3428b9a (feat: implement hint system API endpoint)
  },
  {
    id: 7,
    brand: 'Apple',
    model: 'iPhone 14 Pro',
    imagePath: '/public/phones/apple-iphone-14-pro.jpg',
    releaseYear: 2022,
    priceTier: 'flagship',
<<<<<<< HEAD
    formFactor: 'bar',
    region: 'global',
  },
  {
    id: 8,
    brand: 'Apple',
    model: 'iPhone SE (2022)',
    imagePath: '/public/phones/apple-iphone-se-2022.jpg',
    releaseYear: 2022,
    priceTier: 'mid-range',
    formFactor: 'bar',
    region: 'global',
  },
  {
    id: 9,
=======
  },
  {
    id: 8,
>>>>>>> 3428b9a (feat: implement hint system API endpoint)
    brand: 'Samsung',
    model: 'Galaxy S25 Ultra',
    imagePath: '/public/phones/samsung-galaxy-s25-ultra.jpg',
    releaseYear: 2025,
    priceTier: 'flagship',
<<<<<<< HEAD
    formFactor: 'bar',
    region: 'global',
  },
  {
    id: 10,
=======
  },
  {
    id: 9,
>>>>>>> 3428b9a (feat: implement hint system API endpoint)
    brand: 'Samsung',
    model: 'Galaxy S24 Ultra',
    imagePath: '/public/phones/samsung-galaxy-s24-ultra.jpg',
    releaseYear: 2024,
    priceTier: 'flagship',
<<<<<<< HEAD
    formFactor: 'bar',
    region: 'global',
  },
  {
    id: 11,
=======
  },
  {
    id: 10,
>>>>>>> 3428b9a (feat: implement hint system API endpoint)
    brand: 'Samsung',
    model: 'Galaxy S24',
    imagePath: '/public/phones/samsung-galaxy-s24.jpg',
    releaseYear: 2024,
<<<<<<< HEAD
    priceTier: 'flagship',
    formFactor: 'bar',
    region: 'global',
  },
  {
    id: 12,
=======
    priceTier: 'mid',
  },
  {
    id: 11,
>>>>>>> 3428b9a (feat: implement hint system API endpoint)
    brand: 'Samsung',
    model: 'Galaxy Z Fold 6',
    imagePath: '/public/phones/samsung-galaxy-z-fold-6.jpg',
    releaseYear: 2024,
    priceTier: 'flagship',
<<<<<<< HEAD
    formFactor: 'fold',
    region: 'global',
  },
  {
    id: 13,
=======
  },
  {
    id: 12,
>>>>>>> 3428b9a (feat: implement hint system API endpoint)
    brand: 'Samsung',
    model: 'Galaxy Z Flip 6',
    imagePath: '/public/phones/samsung-galaxy-z-flip-6.jpg',
    releaseYear: 2024,
    priceTier: 'flagship',
<<<<<<< HEAD
    formFactor: 'flip',
    region: 'global',
  },
  {
    id: 14,
    brand: 'Samsung',
    model: 'Galaxy A55',
    imagePath: '/public/phones/samsung-galaxy-a55.jpg',
    releaseYear: 2024,
    priceTier: 'mid-range',
    formFactor: 'bar',
    region: 'global',
  },
  {
    id: 15,
    brand: 'Samsung',
    model: 'Galaxy A15',
    imagePath: '/public/phones/samsung-galaxy-a15.jpg',
    releaseYear: 2024,
    priceTier: 'budget',
    formFactor: 'bar',
    region: 'global',
  },
  {
    id: 16,
=======
  },
  {
    id: 13,
>>>>>>> 3428b9a (feat: implement hint system API endpoint)
    brand: 'Google',
    model: 'Pixel 9 Pro',
    imagePath: '/public/phones/google-pixel-9-pro.jpg',
    releaseYear: 2024,
    priceTier: 'flagship',
<<<<<<< HEAD
    formFactor: 'bar',
    region: 'global',
  },
  {
    id: 17,
=======
  },
  {
    id: 14,
>>>>>>> 3428b9a (feat: implement hint system API endpoint)
    brand: 'Google',
    model: 'Pixel 9',
    imagePath: '/public/phones/google-pixel-9.jpg',
    releaseYear: 2024,
<<<<<<< HEAD
    priceTier: 'flagship',
    formFactor: 'bar',
    region: 'global',
  },
  {
    id: 18,
=======
    priceTier: 'mid',
  },
  {
    id: 15,
>>>>>>> 3428b9a (feat: implement hint system API endpoint)
    brand: 'Google',
    model: 'Pixel 8 Pro',
    imagePath: '/public/phones/google-pixel-8-pro.jpg',
    releaseYear: 2023,
    priceTier: 'flagship',
<<<<<<< HEAD
    formFactor: 'bar',
    region: 'global',
  },
  {
    id: 19,
=======
  },
  {
    id: 16,
>>>>>>> 3428b9a (feat: implement hint system API endpoint)
    brand: 'Google',
    model: 'Pixel 8',
    imagePath: '/public/phones/google-pixel-8.jpg',
    releaseYear: 2023,
<<<<<<< HEAD
    priceTier: 'flagship',
    formFactor: 'bar',
    region: 'global',
  },
  {
    id: 20,
    brand: 'Google',
    model: 'Pixel 8a',
    imagePath: '/public/phones/google-pixel-8a.jpg',
    releaseYear: 2024,
    priceTier: 'mid-range',
    formFactor: 'bar',
    region: 'global',
  },
  {
    id: 21,
=======
    priceTier: 'mid',
  },
  {
    id: 17,
>>>>>>> 3428b9a (feat: implement hint system API endpoint)
    brand: 'OnePlus',
    model: '13',
    imagePath: '/public/phones/oneplus-13.png',
    releaseYear: 2025,
    priceTier: 'flagship',
<<<<<<< HEAD
    formFactor: 'bar',
    region: 'global',
  },
  {
    id: 22,
=======
  },
  {
    id: 18,
>>>>>>> 3428b9a (feat: implement hint system API endpoint)
    brand: 'OnePlus',
    model: '12',
    imagePath: '/public/phones/oneplus-12.jpg',
    releaseYear: 2024,
<<<<<<< HEAD
    priceTier: 'flagship',
    formFactor: 'bar',
    region: 'global',
  },
  {
    id: 23,
    brand: 'OnePlus',
    model: 'Open',
    imagePath: '/public/phones/oneplus-open.jpg',
    releaseYear: 2023,
    priceTier: 'flagship',
    formFactor: 'fold',
    region: 'global',
  },
  {
    id: 24,
=======
    priceTier: 'mid',
  },
  {
    id: 19,
>>>>>>> 3428b9a (feat: implement hint system API endpoint)
    brand: 'Nothing',
    model: 'Phone 2',
    imagePath: '/public/phones/nothing-phone-2.png',
    releaseYear: 2023,
<<<<<<< HEAD
    priceTier: 'mid-range',
    formFactor: 'bar',
    region: 'global',
  },
  {
    id: 25,
=======
    priceTier: 'mid',
  },
  {
    id: 20,
>>>>>>> 3428b9a (feat: implement hint system API endpoint)
    brand: 'Nothing',
    model: 'Phone 1',
    imagePath: '/public/phones/nothing-phone-1.png',
    releaseYear: 2022,
<<<<<<< HEAD
    priceTier: 'mid-range',
    formFactor: 'bar',
    region: 'global',
  },
  {
    id: 26,
    brand: 'Xiaomi',
    model: '14 Ultra',
    imagePath: '/public/phones/xiaomi-14-ultra.jpg',
    releaseYear: 2024,
    priceTier: 'flagship',
    formFactor: 'bar',
    region: 'global',
  },
  {
    id: 27,
    brand: 'Xiaomi',
    model: '14',
    imagePath: '/public/phones/xiaomi-14.jpg',
    releaseYear: 2024,
    priceTier: 'flagship',
    formFactor: 'bar',
    region: 'global',
  },
  {
    id: 28,
    brand: 'Xiaomi',
    model: 'Mix Fold 4',
    imagePath: '/public/phones/xiaomi-mix-fold-4.jpg',
    releaseYear: 2024,
    priceTier: 'flagship',
    formFactor: 'fold',
    region: 'china',
  },
  {
    id: 29,
    brand: 'Xiaomi',
    model: 'Redmi Note 13 Pro+',
    imagePath: '/public/phones/xiaomi-redmi-note-13-pro-plus.jpg',
    releaseYear: 2024,
    priceTier: 'mid-range',
    formFactor: 'bar',
    region: 'global',
  },
  {
    id: 30,
    brand: 'Sony',
    model: 'Xperia 1 VI',
    imagePath: '/public/phones/sony-xperia-1-vi.jpg',
    releaseYear: 2024,
    priceTier: 'flagship',
    formFactor: 'bar',
    region: 'global',
  },
  {
    id: 31,
    brand: 'Sony',
    model: 'Xperia 1 V',
    imagePath: '/public/phones/sony-xperia-1-v.jpg',
    releaseYear: 2023,
    priceTier: 'flagship',
    formFactor: 'bar',
    region: 'global',
  },
  {
    id: 32,
    brand: 'Motorola',
    model: 'Razr+ (2024)',
    imagePath: '/public/phones/motorola-razr-plus-2024.jpg',
    releaseYear: 2024,
    priceTier: 'flagship',
    formFactor: 'flip',
    region: 'global',
  },
  {
    id: 33,
    brand: 'Motorola',
    model: 'Edge 50 Ultra',
    imagePath: '/public/phones/motorola-edge-50-ultra.jpg',
    releaseYear: 2024,
    priceTier: 'flagship',
    formFactor: 'bar',
    region: 'global',
  },
  {
    id: 34,
    brand: 'Motorola',
    model: 'Moto G Power (2024)',
    imagePath: '/public/phones/motorola-moto-g-power-2024.jpg',
    releaseYear: 2024,
    priceTier: 'budget',
    formFactor: 'bar',
    region: 'global',
  },
  {
    id: 35,
    brand: 'OPPO',
    model: 'Find X7 Ultra',
    imagePath: '/public/phones/oppo-find-x7-ultra.jpg',
    releaseYear: 2024,
    priceTier: 'flagship',
    formFactor: 'bar',
    region: 'china',
  },
  {
    id: 36,
    brand: 'OPPO',
    model: 'Find N3 Flip',
    imagePath: '/public/phones/oppo-find-n3-flip.jpg',
    releaseYear: 2023,
    priceTier: 'flagship',
    formFactor: 'flip',
    region: 'global',
  },
  {
    id: 37,
    brand: 'Huawei',
    model: 'Pura 70 Ultra',
    imagePath: '/public/phones/huawei-pura-70-ultra.jpg',
    releaseYear: 2024,
    priceTier: 'flagship',
    formFactor: 'bar',
    region: 'china',
  },
  {
    id: 38,
    brand: 'Huawei',
    model: 'Mate 60 Pro',
    imagePath: '/public/phones/huawei-mate-60-pro.jpg',
    releaseYear: 2023,
    priceTier: 'flagship',
    formFactor: 'bar',
    region: 'china',
  },
  {
    id: 39,
    brand: 'Vivo',
    model: 'X200 Pro',
    imagePath: '/public/phones/vivo-x200-pro.jpg',
    releaseYear: 2024,
    priceTier: 'flagship',
    formFactor: 'bar',
    region: 'global',
  },
  {
    id: 40,
    brand: 'Vivo',
    model: 'X100 Pro',
    imagePath: '/public/phones/vivo-x100-pro.jpg',
    releaseYear: 2024,
    priceTier: 'flagship',
    formFactor: 'bar',
    region: 'global',
  },
  {
    id: 41,
    brand: 'Asus',
    model: 'ROG Phone 8 Pro',
    imagePath: '/public/phones/asus-rog-phone-8-pro.jpg',
    releaseYear: 2024,
    priceTier: 'flagship',
    formFactor: 'bar',
    region: 'global',
  },
  {
    id: 42,
    brand: 'Realme',
    model: 'GT 6',
    imagePath: '/public/phones/realme-gt-6.jpg',
    releaseYear: 2024,
    priceTier: 'mid-range',
    formFactor: 'bar',
    region: 'global',
  },
  {
    id: 43,
    brand: 'Honor',
    model: 'Magic6 Pro',
    imagePath: '/public/phones/honor-magic6-pro.jpg',
    releaseYear: 2024,
    priceTier: 'flagship',
    formFactor: 'bar',
    region: 'global',
  },
  {
    id: 44,
    brand: 'Honor',
    model: 'Magic V3',
    imagePath: '/public/phones/honor-magic-v3.jpg',
    releaseYear: 2024,
    priceTier: 'flagship',
    formFactor: 'fold',
    region: 'global',
  },
  {
    id: 45,
    brand: 'Nokia',
    model: 'G42',
    imagePath: '/public/phones/nokia-g42.jpg',
    releaseYear: 2023,
    priceTier: 'budget',
    formFactor: 'bar',
    region: 'global',
  },
  {
    id: 46,
    brand: 'Nothing',
    model: 'Phone 2a Plus',
    imagePath: '/public/phones/nothing-phone-2a-plus.jpg',
    releaseYear: 2024,
    priceTier: 'mid-range',
    formFactor: 'bar',
    region: 'global',
  },
  {
    id: 47,
    brand: 'Xiaomi',
    model: 'Poco F6 Pro',
    imagePath: '/public/phones/xiaomi-poco-f6-pro.jpg',
    releaseYear: 2024,
    priceTier: 'mid-range',
    formFactor: 'bar',
    region: 'global',
  },
  {
    id: 48,
    brand: 'OnePlus',
    model: 'Nord 4',
    imagePath: '/public/phones/oneplus-nord-4.jpg',
    releaseYear: 2024,
    priceTier: 'mid-range',
    formFactor: 'bar',
    region: 'global',
  },
  {
    id: 49,
    brand: 'Realme',
    model: 'GT 7 Pro',
    imagePath: '/public/phones/realme-gt-7-pro.jpg',
    releaseYear: 2024,
    priceTier: 'flagship',
    formFactor: 'bar',
    region: 'global',
  },
  {
    id: 50,
    brand: 'Samsung',
    model: 'Galaxy S23 Ultra',
    imagePath: '/public/phones/samsung-galaxy-s23-ultra.jpg',
    releaseYear: 2023,
    priceTier: 'flagship',
    formFactor: 'bar',
    region: 'global',
=======
    priceTier: 'budget',
>>>>>>> 3428b9a (feat: implement hint system API endpoint)
  },
];

export const MOCK_USER = {
  id: 1,
  displayName: '卡爾文',
  avatarUrl: null,
};

export const MOCK_LEADERBOARD_DAILY = [
  {
    rank: 1,
    displayName: 'SpeedRunner',
    avatarUrl: null,
    score: 8.3,
    guessCount: 1,
  },
  {
    rank: 2,
    displayName: 'PhoneNerd42',
    avatarUrl: null,
    score: 15.7,
    guessCount: 2,
  },
  {
    rank: 3,
    displayName: 'TechGuru',
    avatarUrl: null,
    score: 22.1,
    guessCount: 2,
  },
  {
    rank: 4,
    displayName: 'GadgetFan',
    avatarUrl: null,
    score: 35.4,
    guessCount: 3,
  },
  {
    rank: 5,
    displayName: 'MobileKing',
    avatarUrl: null,
    score: 48.9,
    guessCount: 4,
  },
];

export const MOCK_LEADERBOARD_AGGREGATE = [
  { rank: 1, displayName: 'SpeedRunner', avatarUrl: null, totalWins: 27 },
  { rank: 2, displayName: 'PhoneNerd42', avatarUrl: null, totalWins: 24 },
  { rank: 3, displayName: 'TechGuru', avatarUrl: null, totalWins: 21 },
  { rank: 4, displayName: 'GadgetFan', avatarUrl: null, totalWins: 18 },
  { rank: 5, displayName: 'MobileKing', avatarUrl: null, totalWins: 15 },
];
