import { rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { configDefaults, defineConfig } from 'vitest/config';

/**
 * GitHub Pages serves the app from https://hashimsaffarini.github.io/Early-Step/, so production
 * assets live under `/Early-Step/`. Development (`npm run dev`) and tests stay at `/`.
 * `BASE_PATH` overrides the production base (e.g. `BASE_PATH=/ npm run build` for a root host).
 */
const PAGES_BASE_PATH = '/Early-Step/';

export default defineConfig(({ command, isPreview }) => ({
  // `vite preview` serves the production build, so it uses the same base as `vite build`.
  base: command === 'build' || isPreview ? (process.env.BASE_PATH ?? PAGES_BASE_PATH) : '/',
  plugins: [
    react(),
    (() => {
      // The MSW worker is for development mock mode only — never ship it (whatever the outDir).
      let outDir = 'dist';
      return {
        name: 'drop-mock-service-worker',
        apply: 'build' as const,
        configResolved(config: { root: string; build: { outDir: string } }) {
          outDir = resolve(config.root, config.build.outDir);
        },
        closeBundle() {
          rmSync(resolve(outDir, 'mockServiceWorker.js'), { force: true });
        },
      };
    })(),
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
}));
