import { useHonoContext } from '@modern-js/server-core';
import { IS_MOCK } from '../../../src/mock/index.ts';

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
}

interface GoogleUserInfo {
  sub: string;
  name: string;
  picture?: string;
}

export const get = async () => {
  if (IS_MOCK) {
    return new Response(null, { status: 302, headers: { Location: '/' } });
  }

  const c = useHonoContext();

  const code = c.req.query('code');

  if (!code) {
    return c.redirect('/?error=no_code');
  }

  const { setCookie } = await import('hono/cookie');
  const { eq } = await import('drizzle-orm');
  const { db } = await import('../../../src/db');
  const { users } = await import('../../../src/db/schema');
  const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI,
    createSessionToken,
    getSessionCookieOptions,
  } = await import('../../../src/lib/auth');

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
    setCookie(c, cookieOpts.name, token, {
      httpOnly: cookieOpts.httpOnly,
      secure: cookieOpts.secure,
      sameSite: cookieOpts.sameSite,
      path: cookieOpts.path,
      maxAge: cookieOpts.maxAge,
    });

    return c.redirect('/');
  } catch {
    return c.redirect('/?error=auth_failed');
  }
};
