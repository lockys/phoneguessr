import { eq, count, notInArray } from 'drizzle-orm';
import { db } from '../db';
import { phones, dailyPuzzles } from '../db/schema';

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
