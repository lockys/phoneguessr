import { useHonoContext } from '@modern-js/server-core';
import { IS_MOCK } from '../../../src/mock/index.ts';

export const get = async () => {
  if (IS_MOCK) {
    return new Response(null, { status: 302, headers: { Location: '/' } });
  }

  const c = useHonoContext();

  const { deleteCookie } = await import('hono/cookie');
  const { COOKIE_NAME } = await import('../../../src/lib/auth');

  deleteCookie(c, COOKIE_NAME, { path: '/' });
  return c.redirect('/');
};
