export interface MockPhone {
  id: number;
  brand: string;
  model: string;
  imageUrl: string;
  releaseYear: number;
  priceTier: 'budget' | 'mid' | 'flagship';
  formFactor: 'bar' | 'flip' | 'fold';
  difficulty: 'easy' | 'medium' | 'hard';
}

export const MOCK_PHONES: MockPhone[] = [
  // ── Apple (7) — easy ──────────────────────────────────────────
  {
    id: 1,
    brand: 'Apple',
    model: 'iPhone 16 Pro Max',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2024,
    priceTier: 'flagship',
    formFactor: 'bar',
    difficulty: 'easy',
  },
  {
    id: 2,
    brand: 'Apple',
    model: 'iPhone 16 Pro',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2024,
    priceTier: 'flagship',
    formFactor: 'bar',
    difficulty: 'easy',
  },
  {
    id: 3,
    brand: 'Apple',
    model: 'iPhone 16',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2024,
    priceTier: 'mid',
    formFactor: 'bar',
    difficulty: 'easy',
  },
  {
    id: 4,
    brand: 'Apple',
    model: 'iPhone 15 Pro Max',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2023,
    priceTier: 'flagship',
    formFactor: 'bar',
    difficulty: 'easy',
  },
  {
    id: 5,
    brand: 'Apple',
    model: 'iPhone 15 Pro',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2023,
    priceTier: 'flagship',
    formFactor: 'bar',
    difficulty: 'easy',
  },
  {
    id: 6,
    brand: 'Apple',
    model: 'iPhone 15',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2023,
    priceTier: 'mid',
    formFactor: 'bar',
    difficulty: 'easy',
  },
  {
    id: 7,
    brand: 'Apple',
    model: 'iPhone 14 Pro',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2022,
    priceTier: 'flagship',
    formFactor: 'bar',
    difficulty: 'easy',
  },
  // ── Samsung (5) — easy ────────────────────────────────────────
  {
    id: 8,
    brand: 'Samsung',
    model: 'Galaxy S25 Ultra',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2025,
    priceTier: 'flagship',
    formFactor: 'bar',
    difficulty: 'easy',
  },
  {
    id: 9,
    brand: 'Samsung',
    model: 'Galaxy S24 Ultra',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2024,
    priceTier: 'flagship',
    formFactor: 'bar',
    difficulty: 'easy',
  },
  {
    id: 10,
    brand: 'Samsung',
    model: 'Galaxy S24',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2024,
    priceTier: 'flagship',
    formFactor: 'bar',
    difficulty: 'easy',
  },
  {
    id: 11,
    brand: 'Samsung',
    model: 'Galaxy Z Fold 6',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2024,
    priceTier: 'flagship',
    formFactor: 'fold',
    difficulty: 'easy',
  },
  {
    id: 12,
    brand: 'Samsung',
    model: 'Galaxy Z Flip 6',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2024,
    priceTier: 'flagship',
    formFactor: 'flip',
    difficulty: 'easy',
  },
  // ── Google (4) — easy ─────────────────────────────────────────
  {
    id: 13,
    brand: 'Google',
    model: 'Pixel 9 Pro',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2024,
    priceTier: 'flagship',
    formFactor: 'bar',
    difficulty: 'easy',
  },
  {
    id: 14,
    brand: 'Google',
    model: 'Pixel 9',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2024,
    priceTier: 'flagship',
    formFactor: 'bar',
    difficulty: 'easy',
  },
  {
    id: 15,
    brand: 'Google',
    model: 'Pixel 8 Pro',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2023,
    priceTier: 'flagship',
    formFactor: 'bar',
    difficulty: 'easy',
  },
  {
    id: 16,
    brand: 'Google',
    model: 'Pixel 8',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2023,
    priceTier: 'mid',
    formFactor: 'bar',
    difficulty: 'easy',
  },
  // ── Nokia (3) — easy ──────────────────────────────────────────
  {
    id: 17,
    brand: 'Nokia',
    model: '3310',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2000,
    priceTier: 'budget',
    formFactor: 'bar',
    difficulty: 'easy',
  },
  {
    id: 18,
    brand: 'Nokia',
    model: 'N95',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2007,
    priceTier: 'flagship',
    formFactor: 'bar',
    difficulty: 'easy',
  },
  {
    id: 19,
    brand: 'Nokia',
    model: '1100',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2003,
    priceTier: 'budget',
    formFactor: 'bar',
    difficulty: 'easy',
  },
  // ── Motorola (3) — easy ───────────────────────────────────────
  {
    id: 20,
    brand: 'Motorola',
    model: 'RAZR V3',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2004,
    priceTier: 'flagship',
    formFactor: 'flip',
    difficulty: 'easy',
  },
  {
    id: 21,
    brand: 'Motorola',
    model: 'Edge 50 Pro',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2024,
    priceTier: 'flagship',
    formFactor: 'bar',
    difficulty: 'easy',
  },
  {
    id: 22,
    brand: 'Motorola',
    model: 'Moto G Power',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2024,
    priceTier: 'budget',
    formFactor: 'bar',
    difficulty: 'easy',
  },
  // ── OnePlus (3) — medium ──────────────────────────────────────
  {
    id: 23,
    brand: 'OnePlus',
    model: '13',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2025,
    priceTier: 'flagship',
    formFactor: 'bar',
    difficulty: 'medium',
  },
  {
    id: 24,
    brand: 'OnePlus',
    model: '12',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2024,
    priceTier: 'flagship',
    formFactor: 'bar',
    difficulty: 'medium',
  },
  {
    id: 25,
    brand: 'OnePlus',
    model: 'Nord CE 4',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2024,
    priceTier: 'mid',
    formFactor: 'bar',
    difficulty: 'medium',
  },
  // ── Xiaomi (3) — medium ───────────────────────────────────────
  {
    id: 26,
    brand: 'Xiaomi',
    model: '14 Ultra',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2024,
    priceTier: 'flagship',
    formFactor: 'bar',
    difficulty: 'medium',
  },
  {
    id: 27,
    brand: 'Xiaomi',
    model: '14',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2024,
    priceTier: 'flagship',
    formFactor: 'bar',
    difficulty: 'medium',
  },
  {
    id: 28,
    brand: 'Xiaomi',
    model: 'Redmi Note 13 Pro',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2024,
    priceTier: 'budget',
    formFactor: 'bar',
    difficulty: 'medium',
  },
  // ── Sony (2) — medium ─────────────────────────────────────────
  {
    id: 29,
    brand: 'Sony',
    model: 'Xperia 1 VI',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2024,
    priceTier: 'flagship',
    formFactor: 'bar',
    difficulty: 'medium',
  },
  {
    id: 30,
    brand: 'Sony',
    model: 'Xperia 10 VI',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2024,
    priceTier: 'mid',
    formFactor: 'bar',
    difficulty: 'medium',
  },
  // ── Huawei (2) — medium ───────────────────────────────────────
  {
    id: 31,
    brand: 'Huawei',
    model: 'Mate 60 Pro',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2023,
    priceTier: 'flagship',
    formFactor: 'bar',
    difficulty: 'medium',
  },
  {
    id: 32,
    brand: 'Huawei',
    model: 'P60 Pro',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2023,
    priceTier: 'flagship',
    formFactor: 'bar',
    difficulty: 'medium',
  },
  // ── LG (2) — medium ──────────────────────────────────────────
  {
    id: 33,
    brand: 'LG',
    model: 'Wing',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2020,
    priceTier: 'flagship',
    formFactor: 'bar',
    difficulty: 'medium',
  },
  {
    id: 34,
    brand: 'LG',
    model: 'Velvet',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2020,
    priceTier: 'mid',
    formFactor: 'bar',
    difficulty: 'medium',
  },
  // ── HTC (2) — medium ─────────────────────────────────────────
  {
    id: 35,
    brand: 'HTC',
    model: 'One M7',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2013,
    priceTier: 'flagship',
    formFactor: 'bar',
    difficulty: 'medium',
  },
  {
    id: 36,
    brand: 'HTC',
    model: 'U23 Pro',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2023,
    priceTier: 'flagship',
    formFactor: 'bar',
    difficulty: 'medium',
  },
  // ── BlackBerry (2) — medium ───────────────────────────────────
  {
    id: 37,
    brand: 'BlackBerry',
    model: 'Bold 9000',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2008,
    priceTier: 'flagship',
    formFactor: 'bar',
    difficulty: 'medium',
  },
  {
    id: 38,
    brand: 'BlackBerry',
    model: 'KEY2',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2018,
    priceTier: 'flagship',
    formFactor: 'bar',
    difficulty: 'medium',
  },
  // ── Nothing (2) — hard ──────────────────────────────────────
  {
    id: 39,
    brand: 'Nothing',
    model: 'Phone 2',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2023,
    priceTier: 'mid',
    formFactor: 'bar',
    difficulty: 'hard',
  },
  {
    id: 40,
    brand: 'Nothing',
    model: 'Phone 1',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2022,
    priceTier: 'mid',
    formFactor: 'bar',
    difficulty: 'hard',
  },
  // ── OPPO (2) — medium ─────────────────────────────────────────
  {
    id: 41,
    brand: 'OPPO',
    model: 'Find X7 Ultra',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2024,
    priceTier: 'flagship',
    formFactor: 'bar',
    difficulty: 'medium',
  },
  {
    id: 42,
    brand: 'OPPO',
    model: 'Reno 11 Pro',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2024,
    priceTier: 'mid',
    formFactor: 'bar',
    difficulty: 'medium',
  },
  // ── Vivo (2) — medium ─────────────────────────────────────────
  {
    id: 43,
    brand: 'Vivo',
    model: 'X100 Pro',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2024,
    priceTier: 'flagship',
    formFactor: 'bar',
    difficulty: 'medium',
  },
  {
    id: 44,
    brand: 'Vivo',
    model: 'V30',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2024,
    priceTier: 'mid',
    formFactor: 'bar',
    difficulty: 'medium',
  },
  // ── Honor (2) — medium ────────────────────────────────────────
  {
    id: 45,
    brand: 'Honor',
    model: 'Magic6 Pro',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2024,
    priceTier: 'flagship',
    formFactor: 'bar',
    difficulty: 'medium',
  },
  {
    id: 46,
    brand: 'Honor',
    model: '200 Pro',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2024,
    priceTier: 'flagship',
    formFactor: 'bar',
    difficulty: 'medium',
  },
  // ── Realme (2) — medium ───────────────────────────────────────
  {
    id: 47,
    brand: 'Realme',
    model: 'GT 5 Pro',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2024,
    priceTier: 'flagship',
    formFactor: 'bar',
    difficulty: 'medium',
  },
  {
    id: 48,
    brand: 'Realme',
    model: '12 Pro+',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2024,
    priceTier: 'mid',
    formFactor: 'bar',
    difficulty: 'medium',
  },
  // ── ASUS (2) — medium ─────────────────────────────────────────
  {
    id: 49,
    brand: 'ASUS',
    model: 'ROG Phone 8 Pro',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2024,
    priceTier: 'flagship',
    formFactor: 'bar',
    difficulty: 'medium',
  },
  {
    id: 50,
    brand: 'ASUS',
    model: 'Zenfone 11 Ultra',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2024,
    priceTier: 'flagship',
    formFactor: 'bar',
    difficulty: 'medium',
  },
  // ── Tecno (2) — hard ──────────────────────────────────────────
  {
    id: 51,
    brand: 'Tecno',
    model: 'Phantom X2 Pro',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2023,
    priceTier: 'flagship',
    formFactor: 'bar',
    difficulty: 'hard',
  },
  {
    id: 52,
    brand: 'Tecno',
    model: 'Camon 20 Pro',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2023,
    priceTier: 'mid',
    formFactor: 'bar',
    difficulty: 'hard',
  },
  // ── Infinix (2) — hard ────────────────────────────────────────
  {
    id: 53,
    brand: 'Infinix',
    model: 'Zero 30',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2023,
    priceTier: 'mid',
    formFactor: 'bar',
    difficulty: 'hard',
  },
  {
    id: 54,
    brand: 'Infinix',
    model: 'GT 20 Pro',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2024,
    priceTier: 'mid',
    formFactor: 'bar',
    difficulty: 'hard',
  },
  // ── Poco (2) — hard ───────────────────────────────────────────
  {
    id: 55,
    brand: 'Poco',
    model: 'F6 Pro',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2024,
    priceTier: 'flagship',
    formFactor: 'bar',
    difficulty: 'hard',
  },
  {
    id: 56,
    brand: 'Poco',
    model: 'X6 Pro',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2024,
    priceTier: 'mid',
    formFactor: 'bar',
    difficulty: 'hard',
  },
  // ── Fairphone (1) — hard ──────────────────────────────────────
  {
    id: 57,
    brand: 'Fairphone',
    model: '5',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2023,
    priceTier: 'mid',
    formFactor: 'bar',
    difficulty: 'hard',
  },
  // ── Sony Ericsson (2) — medium ────────────────────────────────
  {
    id: 58,
    brand: 'Sony Ericsson',
    model: 'W800',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2005,
    priceTier: 'mid',
    formFactor: 'bar',
    difficulty: 'medium',
  },
  {
    id: 59,
    brand: 'Sony Ericsson',
    model: 'K750',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2005,
    priceTier: 'mid',
    formFactor: 'bar',
    difficulty: 'medium',
  },
  // ── Siemens (1) — hard ────────────────────────────────────────
  {
    id: 60,
    brand: 'Siemens',
    model: 'SL45',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2001,
    priceTier: 'flagship',
    formFactor: 'bar',
    difficulty: 'hard',
  },
  // ── Palm (1) — hard ───────────────────────────────────────────
  {
    id: 61,
    brand: 'Palm',
    model: 'Pre',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2009,
    priceTier: 'flagship',
    formFactor: 'bar',
    difficulty: 'hard',
  },
  // ── Ericsson (1) — hard ───────────────────────────────────────
  {
    id: 62,
    brand: 'Ericsson',
    model: 'T28',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 1999,
    priceTier: 'flagship',
    formFactor: 'bar',
    difficulty: 'hard',
  },
  // ── Essential (1) — hard ──────────────────────────────────────
  {
    id: 63,
    brand: 'Essential',
    model: 'PH-1',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2017,
    priceTier: 'flagship',
    formFactor: 'bar',
    difficulty: 'hard',
  },
  // ── Razer (1) — hard ─────────────────────────────────────────
  {
    id: 64,
    brand: 'Razer',
    model: 'Phone 2',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2018,
    priceTier: 'flagship',
    formFactor: 'bar',
    difficulty: 'hard',
  },
  // ── Lenovo (1) — medium ───────────────────────────────────────
  {
    id: 65,
    brand: 'Lenovo',
    model: 'Legion Phone Duel 2',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2021,
    priceTier: 'flagship',
    formFactor: 'bar',
    difficulty: 'medium',
  },
  // ── ZTE (1) — medium ─────────────────────────────────────────
  {
    id: 66,
    brand: 'ZTE',
    model: 'Axon 60 Ultra',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2024,
    priceTier: 'flagship',
    formFactor: 'bar',
    difficulty: 'medium',
  },
  // ── Nubia (1) — hard ─────────────────────────────────────────
  {
    id: 67,
    brand: 'Nubia',
    model: 'Z60 Ultra',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2024,
    priceTier: 'flagship',
    formFactor: 'bar',
    difficulty: 'hard',
  },
  // ── TCL (1) — hard ───────────────────────────────────────────
  {
    id: 68,
    brand: 'TCL',
    model: '50 XL',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2024,
    priceTier: 'budget',
    formFactor: 'bar',
    difficulty: 'hard',
  },
  // ── Cat (1) — hard ───────────────────────────────────────────
  {
    id: 69,
    brand: 'Cat',
    model: 'S75',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2023,
    priceTier: 'mid',
    formFactor: 'bar',
    difficulty: 'hard',
  },
  // ── Vertu (1) — hard ─────────────────────────────────────────
  {
    id: 70,
    brand: 'Vertu',
    model: 'Signature Touch',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/07/SAMSUNG_Galaxy_S24_Ultra_%282%29.jpg',
    releaseYear: 2014,
    priceTier: 'flagship',
    formFactor: 'bar',
    difficulty: 'hard',
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
