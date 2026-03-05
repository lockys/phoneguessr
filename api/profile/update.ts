import { eq } from 'drizzle-orm';
import { db } from '../../phoneguessr/src/db';
import { users } from '../../phoneguessr/src/db/schema';
import { COOKIE_NAME, verifySessionToken } from '../../phoneguessr/src/lib/auth';
import { parseCookies } from '../../phoneguessr/src/lib/cookies';
import { validateDisplayName } from '../../phoneguessr/src/lib/validation';

export async function POST(request: Request) {
  const body: { displayName: string } = await request.json();

  const token = parseCookies(request.headers.get('cookie'))[COOKIE_NAME];
  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const session = await verifySessionToken(token);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = validateDisplayName(body.displayName);
  if (!result.valid) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  await db
    .update(users)
    .set({ displayName: result.value })
    .where(eq(users.id, session.userId));

  return Response.json({ success: true });
}
