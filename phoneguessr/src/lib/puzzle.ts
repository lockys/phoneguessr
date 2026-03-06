import { avg, count, eq, notInArray, sql } from 'drizzle-orm';
import { db } from '../db';
import { dailyPuzzles, phones, results } from '../db/schema';

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

/**
 * Get yesterday's puzzle data for the reveal section.
 */
export async function getYesterdayPuzzle() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().slice(0, 10);

  const existing = await db
    .select()
    .from(dailyPuzzles)
    .where(eq(dailyPuzzles.puzzleDate, dateStr))
    .limit(1);

  if (existing.length === 0) {
    throw new Error('No puzzle for yesterday');
  }

  const puzzle = existing[0];
  const [phone] = await db
    .select()
    .from(phones)
    .where(eq(phones.id, puzzle.phoneId))
    .limit(1);

  return {
    phone: {
      brand: phone.brand,
      model: phone.model,
      imagePath: phone.imagePath,
    },
    facts: [] as string[],
    stats: {
      totalPlayers: 0,
      avgGuesses: 0,
      winRate: 0,
    },
  };
}

/**
 * Select a phone for a given date using seeded randomness.
 * Cycles through all active phones before repeating.
 */
async function selectPhoneForDate(dateStr: string) {
  const activePhones = await db
    .select()
    .from(phones)
    .where(eq(phones.active, true));

  if (activePhones.length === 0) {
    throw new Error('No active phones in database');
  }

  // Get phones already used in the current cycle
  const usedPhoneIds = await getUsedPhoneIdsInCurrentCycle(activePhones.length);

  // Filter to unused phones, or reset if all used
  let available = activePhones.filter(p => !usedPhoneIds.includes(p.id));
  if (available.length === 0) {
    available = activePhones;
  }

  // Use seeded random to pick from available phones
  const rng = seededRandom(dateSeed(dateStr));
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
      imagePath: phone.imagePath,
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
