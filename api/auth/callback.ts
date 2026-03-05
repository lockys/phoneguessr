import { eq } from 'drizzle-orm';
import { db } from '../../phoneguessr/src/db';
import { users } from '../../phoneguessr/src/db/schema';
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  createSessionToken,
  getSessionCookieOptions,
} from '../../phoneguessr/src/lib/auth';
import { serializeCookie } from '../../phoneguessr/src/lib/cookies';

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
}

interface GoogleUserInfo {
  sub: string;
  name: string;
  picture?: string;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return new Response(null, {
      status: 302,
      headers: { Location: '/?error=no_code' },
    });
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokens: GoogleTokenResponse = await tokenRes.json();

    const userRes = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      { headers: { Authorization: `Bearer ${tokens.access_token}` } },
    );

    const googleUser: GoogleUserInfo = await userRes.json();

    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.googleId, googleUser.sub))
      .limit(1);

    if (!user) {
      [user] = await db
        .insert(users)
        .values({
          googleId: googleUser.sub,
          displayName: googleUser.name,
          avatarUrl: googleUser.picture,
        })
        .returning();
    }

    const token = await createSessionToken({
      userId: user.id,
      googleId: user.googleId,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl ?? undefined,
    });

    const cookieOpts = getSessionCookieOptions();
    const setCookieHeader = serializeCookie(cookieOpts.name, token, {
      httpOnly: cookieOpts.httpOnly,
      secure: cookieOpts.secure,
      sameSite: cookieOpts.sameSite,
      path: cookieOpts.path,
      maxAge: cookieOpts.maxAge,
    });

    return new Response(null, {
      status: 302,
      headers: {
        Location: '/',
        'Set-Cookie': setCookieHeader,
      },
    });
  } catch {
    return new Response(null, {
      status: 302,
      headers: { Location: '/?error=auth_failed' },
    });
  }
}
