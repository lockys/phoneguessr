import { COOKIE_NAME } from '../../phoneguessr/src/lib/auth';
import { serializeCookie } from '../../phoneguessr/src/lib/cookies';

export async function GET() {
  const clearCookie = serializeCookie(COOKIE_NAME, '', {
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
