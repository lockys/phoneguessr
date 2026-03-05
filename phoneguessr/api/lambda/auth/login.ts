import { useHonoContext } from '@modern-js/server-core';
import { IS_MOCK } from '../../../src/mock/index.ts';

export const get = async () => {
  if (IS_MOCK) {
    return new Response(null, { status: 302, headers: { Location: '/' } });
  }

  const c = useHonoContext();

  const { GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI } = await import('../../../src/lib/auth');

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid profile email',
    access_type: 'online',
    prompt: 'select_account',
  });

  return c.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
  );
};
