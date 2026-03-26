import { and, eq } from 'drizzle-orm';
import { db } from '../../phoneguessr/src/db/index.js';
import {
  dailyPuzzles,
  guesses,
  hints,
  results,
  streaks,
  users,
} from '../../phoneguessr/src/db/schema.js';
import { getTodayPuzzle } from '../../phoneguessr/src/lib/puzzle.js';
import {
  COOKIE_NAME,
  verifySessionToken,
} from '../../phoneguessr/src/lib/auth.js';
import { parseCookies } from '../../phoneguessr/src/lib/cookies.js';

const ADMIN_EMAILS = ['locky4567@gmail.com'];

async function requireAdmin(request: Request) {
  const token = parseCookies(request.headers.get('cookie'))[COOKIE_NAME];
  if (!token) return null;

  const session = await verifySessionToken(token);
  if (!session) return null;

  // Check admin status from DB (authoritative, not just JWT claim)
  const [user] = await db
    .select({ isAdmin: users.isAdmin, email: users.email })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  if (!user?.isAdmin && !ADMIN_EMAILS.includes(user?.email ?? '')) {
    return null;
  }

  return session;
}

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  if (action === 'reset-user') {
    return resetUser(request);
  }

  if (action === 'reset-today') {
    return resetToday(request);
  }

  return Response.json({ error: 'Unknown action' }, { status: 400 });
}

async function resetUser(request: Request) {
  const body: { userId?: number; email?: string } = await request.json();

  // Find target user by ID or email
  let targetUserId: number | null = null;

  if (body.userId) {
    targetUserId = body.userId;
  } else if (body.email) {
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, body.email))
      .limit(1);
    targetUserId = user?.id ?? null;
  }

  if (!targetUserId) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  // Delete all game data for this user
  const deletedResults = await db
    .delete(results)
    .where(eq(results.userId, targetUserId))
    .returning({ id: results.id });

  await db.delete(guesses).where(eq(guesses.userId, targetUserId));
  await db.delete(hints).where(eq(hints.userId, targetUserId));
  await db
    .update(streaks)
    .set({ currentStreak: 0, bestStreak: 0, lastPlayedDate: null })
    .where(eq(streaks.userId, targetUserId));

  return Response.json({
    success: true,
    message: `Reset game status for user ${targetUserId}`,
    deletedResults: deletedResults.length,
  });
}

async function resetToday(request: Request) {
  const body: { email?: string } = await request.json();

  if (!body.email) {
    return Response.json({ error: 'email required' }, { status: 400 });
  }

  const [targetUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, body.email))
    .limit(1);

  if (!targetUser) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  const { puzzle } = await getTodayPuzzle();

  await db
    .delete(results)
    .where(
      and(
        eq(results.userId, targetUser.id),
        eq(results.puzzleId, puzzle.id),
      ),
    );

  await db
    .delete(guesses)
    .where(
      and(
        eq(guesses.userId, targetUser.id),
        eq(guesses.puzzleId, puzzle.id),
      ),
    );

  await db
    .delete(hints)
    .where(
      and(
        eq(hints.userId, targetUser.id),
        eq(hints.puzzleId, puzzle.id),
      ),
    );

  return Response.json({
    success: true,
    message: `Reset today's game for ${body.email}`,
  });
}
