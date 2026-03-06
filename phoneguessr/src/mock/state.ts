import fs from 'node:fs';
import path from 'node:path';
import { MOCK_PHONES } from './data.ts';

/**
 * Get today's mock puzzle. Uses date-based index into the phone array.
 */
function getDailyIndex(): number {
  const today = new Date().toISOString().slice(0, 10);
  const [y, m, d] = today.split('-').map(Number);
  const seed = y * 10000 + m * 100 + d;
  return seed % MOCK_PHONES.length;
}

export function getMockPuzzle() {
  const index = getDailyIndex();
  const phone = MOCK_PHONES[index];
  const today = new Date().toISOString().slice(0, 10);
  const puzzleNumber = Math.floor(
    (Date.now() - new Date('2026-01-01').getTime()) / 86400000,
  );

  return {
    puzzleId: 1,
    puzzleNumber: Math.max(1, puzzleNumber),
    puzzleDate: today,
    imagePath: phone.imagePath,
    _answerId: phone.id,
    _answerBrand: phone.brand,
  };
}

export function getMockImageData(): string | null {
  const puzzle = getMockPuzzle();
  const imagePath = path.resolve(
    'config/public',
    puzzle.imagePath.replace(/^\/public\//, ''),
  );
  if (!fs.existsSync(imagePath)) return null;
  const buffer = fs.readFileSync(imagePath);
  const ext = path.extname(imagePath).slice(1).toLowerCase();
  const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
  return `data:${mime};base64,${buffer.toString('base64')}`;
}

export function getMockProfileStats() {
  return {
    gamesPlayed: 10,
    wins: 7,
    winRate: 70,
    currentStreak: 3,
    bestStreak: 5,
  };
}

export function getMockStreak() {
  const today = new Date().toISOString().slice(0, 10);
  return {
    currentStreak: 3,
    bestStreak: 8,
    lastPlayedDate: today,
    milestones: { '7day': true, '30day': false, '100day': false },
  };
}

export function getMockFeedback(
  guessedPhoneId: number,
): 'correct' | 'right_brand' | 'wrong_brand' {
  const puzzle = getMockPuzzle();
  const guessed = MOCK_PHONES.find(p => p.id === guessedPhoneId);

  if (!guessed) return 'wrong_brand';

  if (guessed.id === puzzle._answerId) return 'correct';
  if (guessed.brand === puzzle._answerBrand) return 'right_brand';
  return 'wrong_brand';
}

function getYesterdayIndex(): number {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().slice(0, 10);
  const [y, m, d] = dateStr.split('-').map(Number);
  const seed = y * 10000 + m * 100 + d;
  return seed % MOCK_PHONES.length;
}

export function getMockYesterdayPuzzle() {
  const index = getYesterdayIndex();
  const phone = MOCK_PHONES[index];
  return {
    phone: {
      brand: phone.brand,
      model: phone.model,
      imagePath: phone.imagePath,
      releaseYear: null,
    },
    facts: [],
    stats: { totalPlayers: 42, avgGuesses: 3.2, winRate: 68 },
  };
}

export function getMockYesterdayImageData(): string | null {
  const index = getYesterdayIndex();
  const phone = MOCK_PHONES[index];
  const imagePath = path.resolve(
    'config/public',
    phone.imagePath.replace(/^\/public\//, ''),
  );
  if (!fs.existsSync(imagePath)) return null;
  const buffer = fs.readFileSync(imagePath);
  const ext = path.extname(imagePath).slice(1).toLowerCase();
  const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
  return `data:${mime};base64,${buffer.toString('base64')}`;
}

type HintType = 'brand' | 'year' | 'price_tier';
const usedHints: Set<HintType> = new Set();

export function resetMockHints(): void {
  usedHints.clear();
}

export function getMockHint(
  hintType: HintType,
):
  | { hint: string; penalty: number; hintsUsed: number; hintsRemaining: number }
  | { error: string; status: number } {
  if (usedHints.size >= 2) {
    return { error: 'max_hints_reached', status: 409 };
  }
  if (usedHints.has(hintType)) {
    return { error: 'max_hints_reached', status: 409 };
  }

  const puzzle = getMockPuzzle();
  const phone = MOCK_PHONES.find(p => p.id === puzzle._answerId);
  const phoneAny = phone as Record<string, unknown> | undefined;

  let hint: string;
  switch (hintType) {
    case 'brand':
      hint = phone?.brand ?? 'Unknown';
      break;
    case 'year':
      hint = String(phoneAny?.releaseYear);
      break;
    case 'price_tier':
      hint = phoneAny?.priceTier as string;
      break;
  }

  usedHints.add(hintType);
  const hintsUsed = usedHints.size;

  return {
    hint,
    penalty: 15,
    hintsUsed,
    hintsRemaining: 2 - hintsUsed,
  };
}
