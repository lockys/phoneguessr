import { eq } from 'drizzle-orm';
import { db } from '../../phoneguessr/src/db/index.js';
import { phones, users } from '../../phoneguessr/src/db/schema.js';
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
  return Response.json({ error: 'Not implemented' }, { status: 501 });
}

export async function DELETE(request: Request): Promise<Response> {
  return Response.json({ error: 'Not implemented' }, { status: 501 });
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method === 'GET') return GET(request);
  if (request.method === 'PATCH') return PATCH(request);
  if (request.method === 'DELETE') return DELETE(request);
  return Response.json({ error: 'Method not allowed' }, { status: 405 });
}
