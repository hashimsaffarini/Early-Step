/**
 * Typed, validated access to `import.meta.env`.
 *
 * Validation is lazy: it runs the first time `getEnv()` is called (e.g. when the HTTP client is
 * first used), so the app shell can boot before the backend URL is known. Once a value is
 * required it fails fast with a clear message. Plain checks (no Zod) keep this module out of the
 * way of bundle splitting — it is loaded on every page.
 */
export interface AppEnv {
  /** e.g. `https://earlystep22.runasp.net/api/` — request paths are relative to it. */
  apiBaseUrl: string;
  /** Origin of the API host — server-relative media (`/uploads/...`) resolves against it. */
  apiOrigin: string;
}

let cachedEnv: AppEnv | undefined;

function parseBaseUrl(value: string | undefined): URL {
  let url: URL;
  try {
    url = new URL(value ?? '');
  } catch {
    throw new Error(
      'Invalid environment configuration:\n- VITE_API_BASE_URL must be a valid absolute URL. Copy .env.example to .env and set it.',
    );
  }
  if (!url.href.endsWith('/api/')) {
    throw new Error(
      'Invalid environment configuration:\n- VITE_API_BASE_URL must end with "/api/" (feature paths are relative to it).',
    );
  }
  return url;
}

export function getEnv(): AppEnv {
  if (cachedEnv) return cachedEnv;
  const url = parseBaseUrl(import.meta.env.VITE_API_BASE_URL);
  cachedEnv = { apiBaseUrl: url.href, apiOrigin: url.origin };
  return cachedEnv;
}

/**
 * The static practice tests/games (frontend demo content, not backend Activities) are offered only
 * in development mock mode. Inlined by Vite, so production builds drop them entirely.
 */
export const showPracticeCatalogs: boolean =
  import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS === 'true';

/** Development mock mode (MSW in the browser). Never on in production builds. */
export function isMockMode(): boolean {
  return import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS === 'true';
}
