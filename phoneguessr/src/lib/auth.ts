import { SignJWT, jwtVerify } from 'jose';

export interface SessionData {
  userId: number;
  googleId: string;
  displayName: string;
  avatarUrl?: string;
  email?: string;
}

const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long',
);

const COOKIE_NAME = 'phoneguessr_session';

export async function createSessionToken(data: SessionData): Promise<string> {
  return new SignJWT({ ...data })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(SECRET);
}

export async function verifySessionToken(
  token: string,
): Promise<SessionData | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionData;
  } catch {
    return null;
  }
}

export function getSessionCookieOptions() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  };
}

export { COOKIE_NAME };

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
export const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback';
