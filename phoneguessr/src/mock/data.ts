export interface MockPhone {
  id: number;
  brand: string;
  model: string;
  imagePath: string;
}

export const MOCK_PHONES: MockPhone[] = [
  { id: 1, brand: 'Apple', model: 'iPhone 16 Pro Max', imagePath: '/public/phones/apple-iphone-16-pro-max.jpg' },
  { id: 2, brand: 'Apple', model: 'iPhone 16 Pro', imagePath: '/public/phones/apple-iphone-16-pro.jpg' },
  { id: 3, brand: 'Apple', model: 'iPhone 16', imagePath: '/public/phones/apple-iphone-16.jpg' },
  { id: 4, brand: 'Apple', model: 'iPhone 15 Pro Max', imagePath: '/public/phones/apple-iphone-15-pro-max.jpg' },
  { id: 5, brand: 'Apple', model: 'iPhone 15 Pro', imagePath: '/public/phones/apple-iphone-15-pro.jpg' },
  { id: 6, brand: 'Apple', model: 'iPhone 15', imagePath: '/public/phones/apple-iphone-15.jpg' },
  { id: 7, brand: 'Apple', model: 'iPhone 14 Pro', imagePath: '/public/phones/apple-iphone-14-pro.jpg' },
  { id: 8, brand: 'Samsung', model: 'Galaxy S25 Ultra', imagePath: '/public/phones/samsung-galaxy-s25-ultra.jpg' },
  { id: 9, brand: 'Samsung', model: 'Galaxy S24 Ultra', imagePath: '/public/phones/samsung-galaxy-s24-ultra.jpg' },
  { id: 10, brand: 'Samsung', model: 'Galaxy S24', imagePath: '/public/phones/samsung-galaxy-s24.jpg' },
  { id: 11, brand: 'Samsung', model: 'Galaxy Z Fold 6', imagePath: '/public/phones/samsung-galaxy-z-fold-6.jpg' },
  { id: 12, brand: 'Samsung', model: 'Galaxy Z Flip 6', imagePath: '/public/phones/samsung-galaxy-z-flip-6.jpg' },
  { id: 13, brand: 'Google', model: 'Pixel 9 Pro', imagePath: '/public/phones/google-pixel-9-pro.jpg' },
  { id: 14, brand: 'Google', model: 'Pixel 9', imagePath: '/public/phones/google-pixel-9.jpg' },
  { id: 15, brand: 'Google', model: 'Pixel 8 Pro', imagePath: '/public/phones/google-pixel-8-pro.jpg' },
  { id: 16, brand: 'Google', model: 'Pixel 8', imagePath: '/public/phones/google-pixel-8.jpg' },
  { id: 17, brand: 'OnePlus', model: '13', imagePath: '/public/phones/oneplus-13.png' },
  { id: 18, brand: 'OnePlus', model: '12', imagePath: '/public/phones/oneplus-12.jpg' },
  { id: 19, brand: 'Nothing', model: 'Phone 2', imagePath: '/public/phones/nothing-phone-2.png' },
  { id: 20, brand: 'Nothing', model: 'Phone 1', imagePath: '/public/phones/nothing-phone-1.png' },
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
