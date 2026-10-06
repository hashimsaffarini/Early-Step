import { z } from 'zod';

/**
 * Typed, validated access to `import.meta.env`.
 *
 * Validation is lazy: it runs the first time `getEnv()` is called (e.g. when the
 * HTTP client is first used), so the app shell can boot before the backend URL
 * is known. Once a value is required it fails fast with a clear message.
 */
const envSchema = z.object({
  VITE_API_BASE_URL: z
    .url({
      message:
        'VITE_API_BASE_URL must be a valid absolute URL. Copy .env.example to .env and set it.',
    })
    .refine((value) => value.endsWith('/api/'), {
      message: 'VITE_API_BASE_URL must end with "/api/" (feature paths are relative to it).',
    }),
});

export interface AppEnv {
  /** e.g. `https://earlystep22.runasp.net/api/` — request paths are relative to it. */
  apiBaseUrl: string;
  /** Origin of the API host — server-relative media (`/uploads/...`) resolves against it. */
  apiOrigin: string;
}

let cachedEnv: AppEnv | undefined;

export function getEnv(): AppEnv {
  if (cachedEnv) return cachedEnv;

  const result = envSchema.safeParse(import.meta.env);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `- ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${details}`);
  }

  const apiBaseUrl = result.data.VITE_API_BASE_URL;
  cachedEnv = { apiBaseUrl, apiOrigin: new URL(apiBaseUrl).origin };
  return cachedEnv;
}

/** Development mock mode (MSW in the browser). Never on in production builds. */
export function isMockMode(): boolean {
  return import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS === 'true';
}
