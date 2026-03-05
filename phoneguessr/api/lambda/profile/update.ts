import { useHonoContext } from '@modern-js/server-core';
import { validateDisplayName } from '../../../src/lib/validation.ts';
import { IS_MOCK } from '../../../src/mock/index.ts';

export const post = async () => {
  if (IS_MOCK) {
    return Response.json({ success: true });
  }

  const c = useHonoContext();
  const body = await c.req.json<{ displayName: string }>();

  const { getCookie } = await import('hono/cookie');
  const { COOKIE_NAME, verifySessionToken } = await import(
    '../../../src/lib/auth'
  );

  const token = getCookie(c, COOKIE_NAME);
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const session = await verifySessionToken(token);
  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const result = validateDisplayName(body.displayName);
  if (!result.valid) {
    return c.json({ error: result.error }, 400);
  }

  const { eq } = await import('drizzle-orm');
  const { db } = await import('../../../src/db');
  const { users } = await import('../../../src/db/schema');

  await db
    .update(users)
    .set({ displayName: result.value })
    .where(eq(users.id, session.userId));

  return c.json({ success: true });
};
