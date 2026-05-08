import { eq } from 'drizzle-orm';
import { db } from '../phoneguessr/src/db/index.js';
import { users } from '../phoneguessr/src/db/schema.js';
import {
  COOKIE_NAME,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  createSessionToken,
  getSessionCookieOptions,
  verifySessionToken,
} from '../phoneguessr/src/lib/auth.js';
import {
  parseCookies,
  serializeCookie,
} from '../phoneguessr/src/lib/cookies.js';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
}

interface GoogleUserInfo {
  sub: string;
  name: string;
  picture?: string;
  email?: string;
}

function getGoogleRedirectUri(request: Request) {
  if (GOOGLE_REDIRECT_URI.trim()) {
    return GOOGLE_REDIRECT_URI;
  }

  const url = new URL(request.url);
  const proto =
    request.headers.get('x-forwarded-proto') || url.protocol.replace(':', '');
  const host = request.headers.get('host') || url.host;
  return `${proto}://${host}/api/auth/callback`;
}

async function handleLogin(request: Request) {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: getGoogleRedirectUri(request),
    response_type: 'code',
    scope: 'openid profile email',
    access_type: 'online',
    prompt: 'select_account',
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    },
  });
}

async function handleLogout(request: Request) {
  const url = new URL(request.url);
  const proto =
    request.headers.get('x-forwarded-proto') || url.protocol.replace(':', '');
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
    headers: { Location: '/', 'Set-Cookie': clearCookie },
  });
}

async function handleMe(request: Request) {
  const token = parseCookies(request.headers.get('cookie'))[COOKIE_NAME];
  if (!token) return Response.json({ user: null });

  const session = await verifySessionToken(token);
  if (!session) return Response.json({ user: null });

  const [dbUser] = await db
    .select({
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      isAdmin: users.isAdmin,
      region: users.region,
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
      region: dbUser?.region ?? null,
    },
  });
}

async function handleCallback(request: Request) {
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
        redirect_uri: getGoogleRedirectUri(request),
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      console.error('Google token exchange failed:', tokenRes.status);
      return new Response(null, {
        status: 302,
        headers: { Location: '/?error=token_exchange' },
      });
    }

    const tokens: GoogleTokenResponse = await tokenRes.json();

    if (!tokens.access_token) {
      console.error('No access_token in Google response');
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

    if (user) {
      [user] = await db
        .update(users)
        .set({
          displayName: googleUser.name,
          avatarUrl: googleUser.picture,
          email: googleUser.email,
        })
        .where(eq(users.googleId, googleUser.sub))
        .returning();
    } else {
      [user] = await db
        .insert(users)
        .values({
          googleId: googleUser.sub,
          displayName: googleUser.name,
          avatarUrl: googleUser.picture,
          email: googleUser.email,
        })
        .returning();
    }

    const token = await createSessionToken({
      userId: user.id,
      googleId: user.googleId,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl ?? undefined,
      email: user.email ?? undefined,
      isAdmin: user.isAdmin,
    });

    const proto =
      request.headers.get('x-forwarded-proto') || url.protocol.replace(':', '');
    const isHttps = proto === 'https';
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
      headers: { Location: '/', 'Set-Cookie': setCookieHeader },
    });
  } catch (err) {
    console.error(
      'Auth callback error:',
      err instanceof Error ? err.message : 'Unknown error',
    );
    return new Response(null, {
      status: 302,
      headers: { Location: '/?error=auth_failed' },
    });
  }
}

async function handleTelegramAuth(request: Request): Promise<Response> {
  const body = await request.json().catch(() => null);
  const initData: string | undefined = body?.initData;
  if (!initData) {
    return Response.json({ error: 'Missing initData' }, { status: 400 });
  }

  if (!TELEGRAM_BOT_TOKEN) {
    return Response.json({ error: 'Telegram not configured' }, { status: 500 });
  }

  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) {
    return Response.json({ error: 'Missing hash in initData' }, { status: 400 });
  }
  params.delete('hash');

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const encoder = new TextEncoder();
  const secretKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode('WebAppData'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const secretKeyBytes = await crypto.subtle.sign(
    'HMAC',
    secretKey,
    encoder.encode(TELEGRAM_BOT_TOKEN),
  );
  const verifyKey = await crypto.subtle.importKey(
    'raw',
    secretKeyBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const computedHashBytes = await crypto.subtle.sign(
    'HMAC',
    verifyKey,
    encoder.encode(dataCheckString),
  );
  const computedHash = [...new Uint8Array(computedHashBytes)]
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  if (computedHash !== hash) {
    return Response.json({ error: 'Invalid initData signature' }, { status: 401 });
  }

  const userParam = params.get('user');
  if (!userParam) {
    return Response.json({ error: 'No user in initData' }, { status: 400 });
  }

  let tgUser: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
  };
  try {
    tgUser = JSON.parse(userParam);
  } catch {
    return Response.json({ error: 'Invalid user JSON' }, { status: 400 });
  }

  const telegramId = String(tgUser.id);
  const displayName = [tgUser.first_name, tgUser.last_name]
    .filter(Boolean)
    .join(' ');
  const avatarUrl = tgUser.photo_url ?? null;

  let [user] = await db
    .select()
    .from(users)
    .where(eq(users.telegramId, telegramId))
    .limit(1);

  if (user) {
    [user] = await db
      .update(users)
      .set({ displayName, avatarUrl })
      .where(eq(users.telegramId, telegramId))
      .returning();
  } else {
    [user] = await db
      .insert(users)
      .values({ telegramId, displayName, avatarUrl })
      .returning();
  }

  const token = await createSessionToken({
    userId: user.id,
    telegramId,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl ?? undefined,
    isAdmin: user.isAdmin,
  });

  const url = new URL(request.url);
  const proto =
    request.headers.get('x-forwarded-proto') || url.protocol.replace(':', '');
  const cookieOpts = getSessionCookieOptions();
  const setCookieHeader = serializeCookie(cookieOpts.name, token, {
    httpOnly: cookieOpts.httpOnly,
    secure: proto === 'https',
    sameSite: cookieOpts.sameSite,
    path: cookieOpts.path,
    maxAge: cookieOpts.maxAge,
  });

  return Response.json(
    {
      user: {
        id: user.id,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        isAdmin: user.isAdmin,
        region: user.region ?? null,
      },
    },
    { headers: { 'Set-Cookie': setCookieHeader } },
  );
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  if (action === 'login') return handleLogin(request);
  if (action === 'logout') return handleLogout(request);
  if (action === 'me') return handleMe(request);
  if (action === 'callback') return handleCallback(request);

  return Response.json({ error: 'Unknown action' }, { status: 400 });
}

export async function POST(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  if (action === 'telegram') return handleTelegramAuth(request);

  return Response.json({ error: 'Unknown action' }, { status: 400 });
}
