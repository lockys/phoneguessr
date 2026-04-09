import { eq } from 'drizzle-orm';
import { db } from '../../phoneguessr/src/db/index.js';
import { users, passkeyCredentials } from '../../phoneguessr/src/db/schema.js';
import {
  COOKIE_NAME,
  createSessionToken,
  getSessionCookieOptions,
  verifySessionToken,
  type SessionData,
} from '../../phoneguessr/src/lib/auth.js';
import { parseCookies, serializeCookie } from '../../phoneguessr/src/lib/cookies.js';
import { getRpId, getRpName, getOrigin } from '../../phoneguessr/src/lib/webauthn.js';
import {
  setChallenge,
  getChallenge,
  consumeChallenge,
} from '../../phoneguessr/src/lib/challenge-store.js';
import {
  generateRegistrationOptions,
  generateAuthenticationOptions,
  verifyRegistrationResponse,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
  GenerateRegistrationOptionsOpts,
  GenerateAuthenticationOptionsOpts,
} from '@simplewebauthn/server';

function getBaseUrl(request: Request): string {
  const url = new URL(request.url);
  const proto = request.headers.get('x-forwarded-proto') || url.protocol.replace(':', '');
  const host = request.headers.get('host') || url.host;
  return `${proto}://${host}`;
}

function getRpIdFromRequest(request: Request): string {
  // Use env var if set (e.g., for local dev with custom domain)
  if (process.env.WEBAUTHN_RP_ID) {
    return process.env.WEBAUTHN_RP_ID;
  }
  // Extract domain from request host header (works in production)
  const host = request.headers.get('host') || 'localhost';
  // Remove port if present
  return host.split(':')[0];
}

function getOriginFromRequest(request: Request): string {
  if (process.env.WEBAUTHN_ORIGIN) {
    return process.env.WEBAUTHN_ORIGIN;
  }
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  const host = request.headers.get('host') || 'localhost';
  return `${proto}://${host}`;
}

function parseCookie(cookieHeader: string | null, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  const cookies = parseCookies(cookieHeader);
  return cookies[name];
}

// GET handler - for registration options
async function handleGet(request: Request, action: string) {
  if (action === 'register-options') {
    return handleRegisterOptions(request);
  }
  return Response.json({ error: 'Invalid action' }, { status: 400 });
}

// POST handler - for all other actions
async function handlePost(request: Request, action: string) {
  switch (action) {
    case 'register':
      return handleRegister(request);
    case 'login-options':
      return handleLoginOptions(request);
    case 'login':
      return handleLogin(request);
    default:
      return Response.json({ error: 'Invalid action' }, { status: 400 });
  }
}

async function handleRegisterOptions(request: Request) {
  const cookieHeader = request.headers.get('cookie');
  const sessionToken = parseCookie(cookieHeader, COOKIE_NAME);

  if (!sessionToken) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const session = await verifySessionToken(sessionToken);
  if (!session) {
    return Response.json({ error: 'Invalid session' }, { status: 401 });
  }

  // Get existing credentials for this user
  const existingCreds = await db
    .select({ credentialId: passkeyCredentials.credentialId })
    .from(passkeyCredentials)
    .where(eq(passkeyCredentials.userId, session.userId));

  const options: GenerateRegistrationOptionsOpts = {
    rpName: getRpName(),
    rpID: getRpIdFromRequest(request),
    userID: Buffer.from(String(session.userId)),
    userName: session.displayName,
    timeout: 60000,
    attestationType: 'none',
    excludeCredentials: existingCreds.map((c) => ({
      id: c.credentialId,
      type: 'public-key',
    })),
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
    },
    supportedAlgorithmIDs: [-7, -257],
  };

  const registrationOptions = await generateRegistrationOptions(options);

  // Store challenge with userId as key
  setChallenge(`register_${session.userId}`, registrationOptions.challenge);

  return Response.json(registrationOptions);
}

async function handleRegister(request: Request) {
  const cookieHeader = request.headers.get('cookie');
  const sessionToken = parseCookie(cookieHeader, COOKIE_NAME);

  if (!sessionToken) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const session = await verifySessionToken(sessionToken);
  if (!session) {
    return Response.json({ error: 'Invalid session' }, { status: 401 });
  }

  const body = await request.json();

  // Get the expected challenge
  const expectedChallenge = getChallenge(`register_${session.userId}`);
  if (!expectedChallenge) {
    return Response.json({ error: 'Challenge not found or expired' }, { status: 400 });
  }

  try {
    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: getOriginFromRequest(request),
      expectedRPID: getRpIdFromRequest(request),
    });

    const { verified, registrationInfo } = verification;

    if (!verified || !registrationInfo) {
      return Response.json({ error: 'Registration verification failed' }, { status: 400 });
    }

    const { credential, aaguid } = registrationInfo;

    // Insert credential into database
    await db.insert(passkeyCredentials).values({
      userId: session.userId,
      credentialId: credential.id,
      publicKey: Buffer.from(credential.publicKey).toString('base64'),
      counter: credential.counter,
      transports: credential.transports,
    });

    // Clean up challenge
    consumeChallenge(`register_${session.userId}`);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Passkey registration error:', error);
    return Response.json({ error: 'Registration failed' }, { status: 400 });
  }
}

async function handleLoginOptions(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { email } = body as { email?: string };

  let userCredentials: Array<{ credentialId: string; userId: number }> = [];

  if (email) {
    // Look up user by email and get their credentials
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (user) {
      const creds = await db
        .select({ credentialId: passkeyCredentials.credentialId, userId: passkeyCredentials.userId })
        .from(passkeyCredentials)
        .where(eq(passkeyCredentials.userId, user.id));
      userCredentials = creds;
    }
  }

  const options: GenerateAuthenticationOptionsOpts = {
    timeout: 60000,
    allowCredentials: userCredentials.length > 0 ? userCredentials.map((c) => ({
      id: c.credentialId,
      type: 'public-key',
    })) : undefined,
    userVerification: 'preferred',
    rpID: getRpIdFromRequest(request),
  };

  const authOptions = await generateAuthenticationOptions(options);

  // Store challenge with a temporary key (will be cleaned up after login)
  setChallenge(`login_${authOptions.challenge}`, authOptions.challenge);

  return Response.json(authOptions);
}

async function handleLogin(request: Request) {
  const body = await request.json();

  const expectedChallenge = getChallenge(`login_${body.challenge}`) || body.challenge;

  try {
    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: getOriginFromRequest(request),
      expectedRPID: getRpIdFromRequest(request),
      requireUserVerification: true,
    });

    const { verified, authenticationInfo } = verification;

    if (!verified || !authenticationInfo) {
      return Response.json({ error: 'Authentication verification failed', verified: false }, { status: 400 });
    }

    // Find the credential in database
    const credential = await db.query.passkeyCredentials.findFirst({
      where: eq(passkeyCredentials.credentialId, authenticationInfo.credentialID),
      with: { user: true },
    });

    if (!credential) {
      return Response.json({ error: 'Credential not found', verified: false }, { status: 404 });
    }

    // Update counter
    await db
      .update(passkeyCredentials)
      .set({ counter: authenticationInfo.newCounter })
      .where(eq(passkeyCredentials.credentialId, authenticationInfo.credentialID));

    // Create session
    const sessionData: SessionData = {
      userId: credential.userId,
      displayName: credential.user.displayName,
      email: credential.user.email,
      avatarUrl: credential.user.avatarUrl,
      isAdmin: credential.user.isAdmin,
    };

    const token = await createSessionToken(sessionData);
    const cookieOptions = getSessionCookieOptions();
    const cookie = serializeCookie(COOKIE_NAME, token, cookieOptions);

    // Clean up challenge
    consumeChallenge(`login_${body.challenge}`);

    return Response.json(
      { verified: true, user: sessionData },
      {
        headers: {
          'Set-Cookie': cookie,
        },
      }
    );
  } catch (error) {
    console.error('Passkey login error:', error);
    return Response.json({ error: 'Login failed', verified: false }, { status: 400 });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  if (!action) {
    return Response.json({ error: 'Missing action parameter' }, { status: 400 });
  }

  return handleGet(request, action);
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  if (!action) {
    return Response.json({ error: 'Missing action parameter' }, { status: 400 });
  }

  return handlePost(request, action);
}
