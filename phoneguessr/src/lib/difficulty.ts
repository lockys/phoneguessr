const BRAND_POPULARITY: Record<string, number> = {
  Apple: 3,
  Samsung: 3,
  Google: 2,
  OnePlus: 1,
  Xiaomi: 2,
  Nothing: 1,
  Sony: 1,
  Motorola: 2,
  OPPO: 1,
  Huawei: 1,
  Vivo: 1,
  Asus: 1,
  Realme: 1,
  Honor: 1,
  Nokia: 1,
};

export type Difficulty = 'easy' | 'medium' | 'hard';

export function computeDifficulty(phone: {
  brand: string;
  releaseYear?: number | null;
}): Difficulty {
  const popularity = BRAND_POPULARITY[phone.brand] ?? 1;
  const currentYear = new Date().getFullYear();
  const recency = phone.releaseYear
    ? Math.max(0, currentYear - phone.releaseYear)
    : 2;

  if (popularity >= 3 && recency <= 1) return 'easy';
  if (popularity <= 1 || recency >= 3) return 'hard';
  return 'medium';
}
