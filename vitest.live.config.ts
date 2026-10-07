import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vitest/config';

/**
 * Opt-in LIVE contract tests (`npm run test:live`): run the app's own API functions against the
 * real backend, read-only, with the demo accounts from the gitignored `.env.e2e.local`.
 * Never part of `npm run test` / `validate`. They print no response data.
 */
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/test/live/**/*.live.test.ts'],
    // Write tests depend on each other's records — run files and tests sequentially.
    fileParallelism: false,
    sequence: { concurrent: false },
    testTimeout: 60_000,
    hookTimeout: 60_000,
    env: { VITE_API_BASE_URL: 'https://earlystep22.runasp.net/api/', VITE_USE_MOCKS: 'false' },
  },
});
