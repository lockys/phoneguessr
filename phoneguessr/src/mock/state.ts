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

/**
 * Get yesterday's mock puzzle for the reveal endpoint.
 */
export function getMockYesterdayPuzzle() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().slice(0, 10);
  const [y, m, d] = dateStr.split('-').map(Number);
  const seed = y * 10000 + m * 100 + d;
  const index = seed % MOCK_PHONES.length;
  const phone = MOCK_PHONES[index];

  return {
    phone: {
      brand: phone.brand,
      model: phone.model,
      imagePath: phone.imagePath,
      releaseYear: null,
    },
    facts: [],
    stats: {
      totalPlayers: 42,
      avgGuesses: 3.2,
      winRate: 68,
    },
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
