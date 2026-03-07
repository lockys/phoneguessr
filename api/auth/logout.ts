import { COOKIE_NAME, getSessionCookieOptions } from '../../phoneguessr/src/lib/auth.js';
import { serializeCookie } from '../../phoneguessr/src/lib/cookies.js';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const proto = request.headers.get('x-forwarded-proto') || url.protocol.replace(':', '');
  const opts = getSessionCookieOptions();
  const clearCookie = serializeCookie(COOKIE_NAME, '', {
    httpOnly: opts.httpOnly,
    secure: proto === 'https',
    sameSite: opts.sameSite,
    path: '/',
    maxAge: 0,
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: '/',
      'Set-Cookie': clearCookie,
    },
  });
}
