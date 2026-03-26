import { eq } from 'drizzle-orm';
import { db } from '../../phoneguessr/src/db/index.js';
import {
  dailyPuzzles,
  phones,
  users,
} from '../../phoneguessr/src/db/schema.js';
import {
  COOKIE_NAME,
  verifySessionToken,
} from '../../phoneguessr/src/lib/auth.js';
import { parseCookies } from '../../phoneguessr/src/lib/cookies.js';

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

export async function GET(request: Request): Promise<Response> {
  const admin = await requireAdmin(request);
  if (!admin) return Response.json({ error: 'Forbidden' }, { status: 403 });

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

export async function PATCH(request: Request): Promise<Response> {
  const admin = await requireAdmin(request);
  if (!admin) return Response.json({ error: 'Forbidden' }, { status: 403 });

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

export async function DELETE(request: Request): Promise<Response> {
  const admin = await requireAdmin(request);
  if (!admin) return Response.json({ error: 'Forbidden' }, { status: 403 });

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

export default async function handler(request: Request): Promise<Response> {
  if (request.method === 'GET') return GET(request);
  if (request.method === 'PATCH') return PATCH(request);
  if (request.method === 'DELETE') return DELETE(request);
  return Response.json({ error: 'Method not allowed' }, { status: 405 });
}
