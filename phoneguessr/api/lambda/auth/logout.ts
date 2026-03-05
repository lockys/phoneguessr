import { useHonoContext } from '@modern-js/server-core';
import { IS_MOCK } from '../../../src/mock/index.ts';

export const get = async () => {
  const c = useHonoContext();

  if (IS_MOCK) {
    return c.redirect('/');
  }

  const { deleteCookie } = await import('hono/cookie');
  const { COOKIE_NAME } = await import('../../../src/lib/auth');

  deleteCookie(c, COOKIE_NAME, { path: '/' });
  return c.redirect('/');
};
