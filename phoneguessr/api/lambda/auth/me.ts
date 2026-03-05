import { useHonoContext } from '@modern-js/server-core';
import { IS_MOCK } from '../../../src/mock/index.ts';
import { MOCK_USER } from '../../../src/mock/data.ts';

export const get = async () => {
  if (IS_MOCK) {
    return Response.json({ user: MOCK_USER });
  }

  const c = useHonoContext();

  const { getCookie } = await import('hono/cookie');
  const { COOKIE_NAME, verifySessionToken } = await import('../../../src/lib/auth');

  const token = getCookie(c, COOKIE_NAME);
  if (!token) {
    return c.json({ user: null });
  }

  const session = await verifySessionToken(token);
  if (!session) {
    return c.json({ user: null });
  }

  return c.json({
    user: {
      id: session.userId,
      displayName: session.displayName,
      avatarUrl: session.avatarUrl,
    },
  });
};
