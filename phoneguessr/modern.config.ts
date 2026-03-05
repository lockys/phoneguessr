import { appTools, defineConfig } from '@modern-js/app-tools';
import { bffPlugin } from '@modern-js/plugin-bff';

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  plugins: [appTools(), bffPlugin()],
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
