import { and, eq } from 'drizzle-orm';
import { db } from '../phoneguessr/src/db/index.js';
import {
  dailyPuzzles,
  guesses,
  hints,
  phones,
  results,
  streaks,
  users,
} from '../phoneguessr/src/db/schema.js';
import { getTodayPuzzle } from '../phoneguessr/src/lib/puzzle.js';
import {
  COOKIE_NAME,
  verifySessionToken,
} from '../phoneguessr/src/lib/auth.js';
import { parseCookies } from '../phoneguessr/src/lib/cookies.js';

const ADMIN_EMAILS = ['locky4567@gmail.com'];

async function requireAdmin(request: Request) {
  const token = parseCookies(request.headers.get('cookie') ?? '')[COOKIE_NAME];
  if (!token) return null;

  const session = await verifySessionToken(token);
  if (!session) return null;

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

// --- Phones resource ---

async function handlePhones(request: Request): Promise<Response> {
  if (request.method === 'GET') {
    const rows = await db
      .select({
        id: phones.id,
        brand: phones.brand,
        model: phones.model,
        imageUrl: phones.imageUrl,
        active: phones.active,
      })
      .from(phones)
      .orderBy(phones.brand, phones.model);

    return Response.json({ phones: rows, total: rows.length });
  }

  if (request.method === 'PATCH') {
    const url = new URL(request.url);
    const id = Number(url.searchParams.get('id'));
    if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });

    const body = (await request.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;
    const updates: Partial<{ brand: string; model: string; imageUrl: string }> =
      {};

    for (const field of ['brand', 'model', 'imageUrl'] as const) {
      if (field in body) {
        if (
          typeof body[field] !== 'string' ||
          (body[field] as string).trim() === ''
        ) {
          return Response.json(
            { error: `${field} must be a non-empty string` },
            { status: 400 },
          );
        }
        updates[field] = (body[field] as string).trim();
      }
    }

    if (Object.keys(updates).length === 0) {
      return Response.json(
        { error: 'At least one field (brand, model, imageUrl) is required' },
        { status: 400 },
      );
    }

    const [updated] = await db
      .update(phones)
      .set(updates)
      .where(eq(phones.id, id))
      .returning({
        id: phones.id,
        brand: phones.brand,
        model: phones.model,
        imageUrl: phones.imageUrl,
        active: phones.active,
      });

    if (!updated)
      return Response.json({ error: 'Phone not found' }, { status: 404 });
    return Response.json({ success: true, phone: updated });
  }

  if (request.method === 'DELETE') {
    const url = new URL(request.url);
    const id = Number(url.searchParams.get('id'));
    if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });

    const [puzzle] = await db
      .select({ id: dailyPuzzles.id })
      .from(dailyPuzzles)
      .where(eq(dailyPuzzles.phoneId, id))
      .limit(1);

    if (puzzle) {
      return Response.json(
        { error: 'Phone is used in a daily puzzle' },
        { status: 409 },
      );
    }

    await db.delete(phones).where(eq(phones.id, id));
    return Response.json({ success: true });
  }

  return Response.json({ error: 'Method not allowed' }, { status: 405 });
}

// --- Reset resource ---

async function handleReset(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
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

// --- Main handler ---

export default async function handler(request: Request): Promise<Response> {
  const admin = await requireAdmin(request);
  if (!admin) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const url = new URL(request.url);
  const resource = url.searchParams.get('resource');

  if (resource === 'phones') return handlePhones(request);
  if (resource === 'reset') return handleReset(request);

  return Response.json({ error: 'Unknown resource' }, { status: 400 });
}
