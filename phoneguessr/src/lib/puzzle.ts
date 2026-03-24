import { avg, count, eq, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { dailyPuzzles, phones, results } from '../db/schema.js';
import type { Difficulty } from './difficulty.js';

/**
 * Get today's UTC date string (YYYY-MM-DD).
 */
function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Simple seeded PRNG (mulberry32) for deterministic puzzle selection.
 */
function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Convert a date string to a numeric seed.
 */
function dateSeed(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  return y * 10000 + m * 100 + d;
}

/**
 * Get or create today's puzzle. Returns the puzzle with phone data.
 */
export async function getTodayPuzzle() {
  const today = todayUTC();

  // Check if today's puzzle already exists
  const existing = await db
    .select()
    .from(dailyPuzzles)
    .where(eq(dailyPuzzles.puzzleDate, today))
    .limit(1);

  if (existing.length > 0) {
    const puzzle = existing[0];
    const [phone] = await db
      .select()
      .from(phones)
      .where(eq(phones.id, puzzle.phoneId))
      .limit(1);
    return { puzzle, phone };
  }

  // Create today's puzzle
  const selectedPhone = await selectPhoneForDate(today);

  // Get next puzzle number
  const [{ value: totalPuzzles }] = await db
    .select({ value: count() })
    .from(dailyPuzzles);
  const puzzleNumber = totalPuzzles + 1;

  const [puzzle] = await db
    .insert(dailyPuzzles)
    .values({
      phoneId: selectedPhone.id,
      puzzleDate: today,
      puzzleNumber,
    })
    .returning();

  return { puzzle, phone: selectedPhone };
}

// Difficulty weights: easy 20%, medium 25%, hard 55% (meets ≥30% hard requirement).
export const DIFFICULTY_WEIGHTS = {
  easy: 0.2,
  medium: 0.25,
  hard: 0.55,
} as const;

/**
 * Pick a difficulty tier based on a random roll in [0, 1).
 * Exported for testing.
 */
export function pickDifficulty(roll: number): Difficulty {
  if (roll < DIFFICULTY_WEIGHTS.easy) return 'easy';
  if (roll < DIFFICULTY_WEIGHTS.easy + DIFFICULTY_WEIGHTS.medium)
    return 'medium';
  return 'hard';
}

/**
 * Select a phone for a given date using seeded randomness.
 * Applies difficulty weighting (20% easy, 25% medium, 55% hard) with
 * fallback to any tier if the target tier has no available phones.
 * Cycles through phones within each tier before repeating.
 */
async function selectPhoneForDate(dateStr: string) {
  const activePhones = await db
    .select()
    .from(phones)
    .where(eq(phones.active, true));

  if (activePhones.length === 0) {
    throw new Error('No active phones in database');
  }

  const rng = seededRandom(dateSeed(dateStr));
  const targetDifficulty = pickDifficulty(rng());

  // Group phones by difficulty
  const byDifficulty: Record<Difficulty, typeof activePhones> = {
    easy: activePhones.filter(p => p.difficulty === 'easy'),
    medium: activePhones.filter(p => p.difficulty === 'medium'),
    hard: activePhones.filter(p => p.difficulty === 'hard'),
  };

  // Get available phones for the target tier (unused in current tier cycle).
  // Fallback to all phones if the tier is empty.
  const tierPool = byDifficulty[targetDifficulty];
  let available: typeof activePhones;
  if (tierPool.length > 0) {
    const usedInTier = await getUsedPhoneIdsInCurrentCycle(tierPool.length);
    available = tierPool.filter(p => !usedInTier.includes(p.id));
    if (available.length === 0) available = tierPool;
  } else {
    const usedAll = await getUsedPhoneIdsInCurrentCycle(activePhones.length);
    available = activePhones.filter(p => !usedAll.includes(p.id));
    if (available.length === 0) available = activePhones;
  }

  const index = Math.floor(rng() * available.length);
  return available[index];
}

/**
 * Get phone IDs used in the current rotation cycle.
 */
async function getUsedPhoneIdsInCurrentCycle(
  poolSize: number,
): Promise<number[]> {
  const recent = await db
    .select({ phoneId: dailyPuzzles.phoneId })
    .from(dailyPuzzles)
    .orderBy(dailyPuzzles.puzzleDate)
    .limit(poolSize);

  return recent.map(r => r.phoneId);
}

/**
 * Get yesterday's UTC date string (YYYY-MM-DD).
 */
function yesterdayUTC(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Get yesterday's puzzle with phone details and aggregate stats.
 * Returns null if no puzzle exists for yesterday.
 */
export async function getYesterdayPuzzle() {
  const yesterday = yesterdayUTC();

  const [puzzle] = await db
    .select()
    .from(dailyPuzzles)
    .where(eq(dailyPuzzles.puzzleDate, yesterday))
    .limit(1);

  if (!puzzle) return null;

  const [phone] = await db
    .select()
    .from(phones)
    .where(eq(phones.id, puzzle.phoneId))
    .limit(1);

  if (!phone) return null;

  const [stats] = await db
    .select({
      totalPlayers: count(),
      avgGuesses: avg(results.guessCount),
      winCount: sql<number>`count(*) filter (where ${results.isWin} = true)`,
    })
    .from(results)
    .where(eq(results.puzzleId, puzzle.id));

  const totalPlayers = stats?.totalPlayers ?? 0;
  const avgGuesses = stats?.avgGuesses
    ? Number.parseFloat(String(stats.avgGuesses))
    : 0;
  const winRate =
    totalPlayers > 0
      ? Math.round(((stats?.winCount ?? 0) / totalPlayers) * 100)
      : 0;

  return {
    phone: {
      brand: phone.brand,
      model: phone.model,
      imageUrl: phone.imageUrl,
      releaseYear: null as number | null,
    },
    facts: [] as string[],
    stats: {
      totalPlayers,
      avgGuesses: Math.round(avgGuesses * 10) / 10,
      winRate,
    },
  };
}
