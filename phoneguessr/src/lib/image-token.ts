import { SignJWT, jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.IMAGE_TOKEN_SECRET || 'image_token_secret_at_least_32_chars_long',
);

interface ImageTokenPayload {
  puzzleId: number;
  level: number;
}

function getMidnightUTC(): Date {
  const now = new Date();
  const midnight = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
  );
  return midnight;
}

export async function signImageToken(
  puzzleId: number,
  level: number,
): Promise<string> {
  const exp = getMidnightUTC();
  return new SignJWT({ puzzleId, level })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(Math.floor(exp.getTime() / 1000))
    .sign(SECRET);
}

export async function verifyImageToken(
  token: string,
): Promise<ImageTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    const { puzzleId, level } = payload as unknown as ImageTokenPayload;
    if (typeof puzzleId !== 'number' || typeof level !== 'number') {
      return null;
    }
    return { puzzleId, level };
  } catch {
    return null;
  }
}
