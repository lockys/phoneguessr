import fs from 'node:fs';
import path from 'node:path';
import { MOCK_PHONES } from './data.ts';

/**
 * Get a date-based index into the phone array for a given date string.
 */
function getIndexForDate(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  const seed = y * 10000 + m * 100 + d;
  return seed % MOCK_PHONES.length;
}

/**
 * Get today's mock puzzle. Uses date-based index into the phone array.
 */
function getDailyIndex(): number {
  const today = new Date().toISOString().slice(0, 10);
  return getIndexForDate(today);
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
  const mime =
    ext === 'png'
      ? 'image/png'
      : ext === 'svg'
        ? 'image/svg+xml'
        : 'image/jpeg';
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

/**
 * Get yesterday's mock puzzle data for the yesterday endpoint.
 */
export function getMockYesterdayPuzzle() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  const yesterday = d.toISOString().slice(0, 10);
  const index = getIndexForDate(yesterday);
  const phone = MOCK_PHONES[index];

  return {
    phone: {
      brand: phone.brand,
      model: phone.model,
      imagePath: phone.imagePath,
      releaseYear: null as number | null,
    },
    facts: [] as string[],
    stats: {
      totalPlayers: 42,
      avgGuesses: 3.2,
      winRate: 68,
    },
  };
}

/**
 * Get yesterday's mock image data as base64 data URL.
 */
export function getMockYesterdayImageData(): string | null {
  const data = getMockYesterdayPuzzle();
  const imagePath = path.resolve(
    'config/public',
    data.phone.imagePath.replace(/^\/public\//, ''),
  );
  if (!fs.existsSync(imagePath)) return null;
  const buffer = fs.readFileSync(imagePath);
  const ext = path.extname(imagePath).slice(1).toLowerCase();
  const mime =
    ext === 'png'
      ? 'image/png'
      : ext === 'svg'
        ? 'image/svg+xml'
        : 'image/jpeg';
  return `data:${mime};base64,${buffer.toString('base64')}`;
}

/** Track mock hints used in the current session */
let mockHintsUsed: string[] = [];

export function resetMockHints(): void {
  mockHintsUsed = [];
}

type HintType = 'brand' | 'year' | 'price_tier';

interface MockHintSuccess {
  hint: string;
  penalty: number;
  hintsUsed: number;
  hintsRemaining: number;
}

interface MockHintError {
  error: string;
  status: number;
}

/**
 * Get a mock hint for the current puzzle.
 */
export function getMockHint(
  hintType: HintType,
): MockHintSuccess | MockHintError {
  if (mockHintsUsed.length >= 2) {
    return { error: 'max_hints_reached', status: 409 };
  }

  if (mockHintsUsed.includes(hintType)) {
    return { error: 'max_hints_reached', status: 409 };
  }

  const puzzle = getMockPuzzle();
  const phone = MOCK_PHONES.find(p => p.id === puzzle._answerId);
  if (!phone) {
    return { error: 'phone_not_found', status: 404 };
  }

  let hint: string;
  switch (hintType) {
    case 'brand':
      hint = phone.brand;
      break;
    case 'year':
      hint = String(
        (phone as Record<string, unknown>).releaseYear ?? 'Unknown',
      );
      break;
    case 'price_tier':
      hint = String((phone as Record<string, unknown>).priceTier ?? 'Unknown');
      break;
  }

  mockHintsUsed.push(hintType);

  return {
    hint,
    penalty: 15,
    hintsUsed: mockHintsUsed.length,
    hintsRemaining: 2 - mockHintsUsed.length,
  };
}
