import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    exclude: [
      'node_modules/**',
      'tests/api-endpoints.test.ts',
      'tests/frontend-game-flow.test.ts',
      'tests/validation.test.ts',
    ],
  },
});
