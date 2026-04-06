import type { IncomingMessage, ServerResponse } from 'node:http';
import { appTools, defineConfig } from '@modern-js/app-tools';

const IS_MOCK = process.env.MOCK_API === 'true';

type Middleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void,
) => void;

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  plugins: [appTools()],
  html: {
    tags: [
      {
        tag: 'script',
        attrs: { src: 'https://telegram.org/js/telegram-web-app.js' },
      },
      { tag: 'link', attrs: { rel: 'manifest', href: '/manifest.json' } },
      { tag: 'meta', attrs: { name: 'theme-color', content: '#1a1a2e' } },
      {
        tag: 'meta',
        attrs: { name: 'apple-mobile-web-app-capable', content: 'yes' },
      },
      {
        tag: 'meta',
        attrs: {
          name: 'apple-mobile-web-app-status-bar-style',
          content: 'black-translucent',
        },
      },
      {
        tag: 'meta',
        attrs: { name: 'apple-mobile-web-app-title', content: 'PhoneGuessr' },
      },
      {
        tag: 'link',
        attrs: { rel: 'apple-touch-icon', href: '/icons/apple-touch-icon.png' },
      },
      {
        tag: 'link',
        attrs: {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          href: '/icons/favicon-32x32.png',
        },
      },
    ],
  },
  ...(IS_MOCK && {
    dev: {
      setupMiddlewares: [
        (middlewares: {
          unshift: (...handlers: Middleware[]) => void;
          push: (...handlers: Middleware[]) => void;
        }) => {
          let handler: Middleware | null = null;
          const loaded = import('./src/mock/middleware.ts').then(m => {
            handler = m.mockApiMiddleware;
          });
          middlewares.unshift((req, res, next) => {
            if (!req.url?.startsWith('/api/')) return next();
            if (handler) return handler(req, res, next);
            loaded.then(() => handler?.(req, res, next));
          });
        },
      ],
    },
  }),
});
