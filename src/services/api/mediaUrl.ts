import { getEnv } from '@/config/env';

/**
 * Resolves server-relative media paths (`/uploads/...`) against the API origin.
 * Absolute `https:` URLs pass through; anything else (e.g. `javascript:`) is rejected.
 */
export function resolveMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  try {
    const url = new URL(path, getEnv().apiOrigin);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
}
