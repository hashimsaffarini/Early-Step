import { z } from 'zod';

/**
 * Typed, validated access to `import.meta.env`.
 *
 * Validation is lazy: it runs the first time `getEnv()` is called (e.g. when the
 * HTTP client is first used), so the app shell can boot before the backend URL
 * is known. Once a value is required it fails fast with a clear message.
 */
const envSchema = z.object({
  VITE_API_BASE_URL: z.url({
    message:
      'VITE_API_BASE_URL must be a valid absolute URL. Copy .env.example to .env and set it.',
  }),
});

export interface AppEnv {
  apiBaseUrl: string;
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

  cachedEnv = { apiBaseUrl: result.data.VITE_API_BASE_URL };
  return cachedEnv;
}
