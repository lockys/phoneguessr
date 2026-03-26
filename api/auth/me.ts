import { eq } from 'drizzle-orm';
import { db } from '../../phoneguessr/src/db/index.js';
import { users } from '../../phoneguessr/src/db/schema.js';
import { COOKIE_NAME, verifySessionToken } from '../../phoneguessr/src/lib/auth.js';
import { parseCookies } from '../../phoneguessr/src/lib/cookies.js';

export async function GET(request: Request) {
  const token = parseCookies(request.headers.get('cookie'))[COOKIE_NAME];
  if (!token) {
    return Response.json({ user: null });
  }

  const session = await verifySessionToken(token);
  if (!session) {
    return Response.json({ user: null });
  }

  // Read from DB so displayName updates and isAdmin are always current
  const [dbUser] = await db
    .select({
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      isAdmin: users.isAdmin,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  return Response.json({
    user: {
      id: session.userId,
      displayName: dbUser?.displayName ?? session.displayName,
      avatarUrl: dbUser?.avatarUrl ?? session.avatarUrl,
      email: session.email ?? null,
      isAdmin: dbUser?.isAdmin ?? false,
    },
  });
}
