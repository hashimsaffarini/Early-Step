import { rmSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    react(),
    {
      // The MSW worker is for development mock mode only — never ship it.
      name: 'drop-mock-service-worker',
      apply: 'build',
      closeBundle() {
        rmSync(fileURLToPath(new URL('./dist/mockServiceWorker.js', import.meta.url)), {
          force: true,
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // Live contract tests run only via `npm run test:live` (never in validate/CI).
    exclude: [...configDefaults.exclude, 'src/test/live/**'],
    css: false,
    // Deterministic test API origin — tests never call the live backend (MSW intercepts).
    env: { VITE_API_BASE_URL: 'https://api.test/api/', VITE_USE_MOCKS: 'false' },
  },
});
