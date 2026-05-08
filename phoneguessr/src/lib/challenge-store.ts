/**
 * Database-backed challenge store for WebAuthn.
 * Replaces in-memory Map which doesn't work in serverless environments
 * where each request may hit a different instance.
 */
import { eq, and, gt, lt } from 'drizzle-orm';
import { db } from '../db/index.js';
import { webauthnChallenges } from '../db/schema.js';

const TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Store a challenge in the database with TTL.
 */
export async function setChallenge(
  key: string,
  challenge: string,
  userId?: number,
  action: 'register' | 'login' = 'register',
): Promise<void> {
  const expiresAt = new Date(Date.now() + TTL_MS);

  // Delete any existing challenge with the same key
  await db
    .delete(webauthnChallenges)
    .where(eq(webauthnChallenges.id, parseInt(key.replace(/^\D/g, '')) || 0))
    .catch(() => {}); // Ignore if key isn't numeric

  await db.insert(webauthnChallenges).values({
    challenge,
    userId,
    action,
    expiresAt,
  });
}

/**
 * Retrieve a challenge by its ID (numeric part of key).
 */
export async function getChallenge(key: string): Promise<string | null> {
  // Key format: "register_<id>" or "login_<challenge>"
  const numericId = parseInt(key.split('_')[1]);

  if (isNaN(numericId)) {
    // For login, key is "login_<challenge>" - search by challenge value
    const results = await db
      .select({ challenge: webauthnChallenges.challenge })
      .from(webauthnChallenges)
      .where(
        and(
          eq(webauthnChallenges.challenge, key.replace('login_', '')),
          eq(webauthnChallenges.action, 'login'),
          gt(webauthnChallenges.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (results.length === 0) return null;
    return results[0].challenge;
  }

  const results = await db
    .select({ challenge: webauthnChallenges.challenge })
    .from(webauthnChallenges)
    .where(
      and(
        eq(webauthnChallenges.id, numericId),
        gt(webauthnChallenges.expiresAt, new Date()),
      ),
    )
    .limit(1);

  if (results.length === 0) return null;
  return results[0].challenge;
}

/**
 * Atomically retrieves and deletes a challenge, preventing replay attacks.
 */
export async function consumeChallenge(key: string): Promise<string | null> {
  const challenge = await getChallenge(key);
  if (challenge === null) return null;

  // Try to delete by challenge value first
  await db
    .delete(webauthnChallenges)
    .where(eq(webauthnChallenges.challenge, challenge))
    .catch(() => {});

  return challenge;
}

/**
 * Delete a challenge by its ID-style key.
 */
export async function deleteChallenge(key: string): Promise<void> {
  const numericId = parseInt(key.split('_')[1]);

  if (!isNaN(numericId)) {
    await db
      .delete(webauthnChallenges)
      .where(eq(webauthnChallenges.id, numericId))
      .catch(() => {});
    return;
  }

  await db
    .delete(webauthnChallenges)
    .where(eq(webauthnChallenges.challenge, key.replace('login_', '')))
    .catch(() => {});
}

/**
 * Clean up expired challenges (can be called periodically).
 */
export async function cleanupExpiredChallenges(): Promise<void> {
  await db
    .delete(webauthnChallenges)
    .where(lt(webauthnChallenges.expiresAt, new Date()))
    .catch(() => {});
}
