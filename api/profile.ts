import { eq, sql } from 'drizzle-orm';
import { db } from '../phoneguessr/src/db/index.js';
import {
  dailyPuzzles,
  phones,
  results,
  users,
} from '../phoneguessr/src/db/schema.js';
import {
  COOKIE_NAME,
  verifySessionToken,
} from '../phoneguessr/src/lib/auth.js';
import { parseCookies } from '../phoneguessr/src/lib/cookies.js';
import { COUNTRY_CODES } from '../phoneguessr/src/lib/region.js';
import { validateDisplayName } from '../phoneguessr/src/lib/validation.js';

async function getAuth(request: Request) {
  const token = parseCookies(request.headers.get('cookie'))[COOKIE_NAME];
  if (!token) return null;
  return verifySessionToken(token);
}

export async function GET(request: Request) {
  const session = await getAuth(request);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const path = url.pathname;

  if (path.includes('/history')) {
    return getHistory(request, session.userId);
  }

  return getStats(session.userId);
}

async function getStats(userId: number) {
  const rows = await db
    .select({
      gamesPlayed: sql<number>`count(*)`,
      wins: sql<number>`count(*) filter (where ${results.isWin} = true)`,
    })
    .from(results)
    .where(eq(results.userId, userId));

  const { gamesPlayed, wins } = rows[0] || { gamesPlayed: 0, wins: 0 };

  const allResults = await db
    .select({ isWin: results.isWin })
    .from(results)
    .where(eq(results.userId, userId))
    .orderBy(sql`${results.createdAt} desc`);

  let currentStreak = 0;
  let bestStreak = 0;
  let streak = 0;

  for (const r of allResults) {
    if (r.isWin) {
      streak++;
      bestStreak = Math.max(bestStreak, streak);
    } else {
      if (currentStreak === 0) currentStreak = streak;
      streak = 0;
    }
  }
  if (currentStreak === 0) currentStreak = streak;
  bestStreak = Math.max(bestStreak, streak);

  return Response.json({
    gamesPlayed,
    wins,
    winRate: gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0,
    currentStreak,
    bestStreak,
  });
}

async function getHistory(request: Request, userId: number) {
  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get('limit')) || 20, 100);
  const offset = Number(url.searchParams.get('offset')) || 0;

  const [countRow] = await db
    .select({ total: sql<number>`count(*)` })
    .from(results)
    .where(eq(results.userId, userId));

  const total = countRow?.total ?? 0;

  const rows = await db
    .select({
      puzzleDate: dailyPuzzles.puzzleDate,
      puzzleNumber: dailyPuzzles.puzzleNumber,
      isWin: results.isWin,
      guessCount: results.guessCount,
      score: results.score,
      phoneBrand: phones.brand,
      phoneModel: phones.model,
    })
    .from(results)
    .innerJoin(dailyPuzzles, eq(results.puzzleId, dailyPuzzles.id))
    .innerJoin(phones, eq(dailyPuzzles.phoneId, phones.id))
    .where(eq(results.userId, userId))
    .orderBy(sql`${dailyPuzzles.puzzleDate} desc`)
    .limit(limit)
    .offset(offset);

  return Response.json({ results: rows, total });
}

export async function POST(request: Request) {
  const session = await getAuth(request);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { displayName?: string; region?: string | null };
  try {
    body = (await request.json()) as {
      displayName?: string;
      region?: string | null;
    };
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const updates: { displayName?: string; region?: string | null } = {};

  if ('displayName' in body) {
    const result = validateDisplayName(body.displayName);
    if (!result.valid) {
      return Response.json({ error: result.error }, { status: 400 });
    }
    updates.displayName = result.value;
  }

  if ('region' in body) {
    const r = body.region;
    if (r === null || r === '') {
      updates.region = null;
    } else if (
      typeof r !== 'string' ||
      !COUNTRY_CODES.includes(r.toUpperCase())
    ) {
      return Response.json({ error: 'Invalid region code' }, { status: 400 });
    } else {
      updates.region = r.toUpperCase();
    }
  }

  if (Object.keys(updates).length === 0) {
    return Response.json({ success: true });
  }

  await db.update(users).set(updates).where(eq(users.id, session.userId));
  return Response.json({ success: true });
}
