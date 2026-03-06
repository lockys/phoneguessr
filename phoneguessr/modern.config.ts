import { appTools, defineConfig } from '@modern-js/app-tools';

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  plugins: [appTools()],
  html: {
    tags: [
      {
        tag: 'link',
        attrs: { rel: 'manifest', href: '/manifest.json' },
      },
      {
        tag: 'meta',
        attrs: { name: 'theme-color', content: '#1a1a2e' },
      },
    ],
  },
});
