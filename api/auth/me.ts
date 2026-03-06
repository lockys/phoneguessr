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

  return Response.json({
    user: {
      id: session.userId,
      displayName: session.displayName,
      avatarUrl: session.avatarUrl,
    },
  });
}
