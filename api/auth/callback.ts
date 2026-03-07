import { eq } from 'drizzle-orm';
import { db } from '../../phoneguessr/src/db/index.js';
import { users } from '../../phoneguessr/src/db/schema.js';
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  createSessionToken,
  getSessionCookieOptions,
} from '../../phoneguessr/src/lib/auth.js';
import { serializeCookie } from '../../phoneguessr/src/lib/cookies.js';

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

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error('Google token exchange failed:', tokenRes.status, err);
      return new Response(null, {
        status: 302,
        headers: { Location: '/?error=token_exchange' },
      });
    }

    const tokens: GoogleTokenResponse = await tokenRes.json();

    if (!tokens.access_token) {
      console.error('No access_token in Google response:', JSON.stringify(tokens));
      return new Response(null, {
        status: 302,
        headers: { Location: '/?error=no_token' },
      });
    }

    const userRes = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      { headers: { Authorization: `Bearer ${tokens.access_token}` } },
    );

    if (!userRes.ok) {
      console.error('Google userinfo failed:', userRes.status);
      return new Response(null, {
        status: 302,
        headers: { Location: '/?error=userinfo' },
      });
    }

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

    const isHttps = url.protocol === 'https:';
    const cookieOpts = getSessionCookieOptions();
    const setCookieHeader = serializeCookie(cookieOpts.name, token, {
      httpOnly: cookieOpts.httpOnly,
      secure: isHttps,
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
  } catch (err) {
    console.error('Auth callback error:', err);
    return new Response(null, {
      status: 302,
      headers: { Location: '/?error=auth_failed' },
    });
  }
}
