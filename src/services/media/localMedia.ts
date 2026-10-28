import { getEnv } from '@/config/env';
import { resolveMediaUrl } from '@/services/api/mediaUrl';

const CACHE_NAME = 'early-step-local-media-v1';
const SAVED_AT = 'X-Early-Step-Saved-At';
const MAX_ENTRIES = 64;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const memory = new Map<string, { blob: Blob; savedAt: number }>();
export const LOCAL_MEDIA_CHANGED = 'early-step:local-media-changed';

export const mediaKeys = {
  activity: (type: string, id: string) => `activity:${type}:${id}`,
  question: (id: string) => `question:${id}`,
  option: (id: string) => `option:${id}`,
};

function storageKeys(entity: string | undefined, path?: string | null): string[] {
  const keys: string[] = [];
  if (entity)
    keys.push(new URL(`__local_media/${encodeURIComponent(entity)}`, getEnv().apiBaseUrl).href);
  const url = resolveMediaUrl(path);
  if (url) keys.push(url);
  return keys;
}

async function bytes(blob: Blob): Promise<ArrayBuffer> {
  if (typeof blob.arrayBuffer === 'function') return blob.arrayBuffer();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result && typeof reader.result !== 'string') resolve(reader.result);
      else reject(new Error('Image could not be read'));
    };
    reader.onerror = () => {
      reject(new Error('Image could not be read'));
    };
    reader.readAsArrayBuffer(blob);
  });
}

/** Local content images only. No tokens, responses, child records or private portraits are cached. */
export async function saveLocalMedia(
  entity: string,
  blob: Blob | null,
  path?: string | null,
): Promise<void> {
  if (!blob) return;
  try {
    const keys = storageKeys(entity, path);
    const savedAt = Date.now();
    for (const key of keys) {
      memory.delete(key);
      memory.set(key, { blob, savedAt });
    }
    while (memory.size > MAX_ENTRIES) {
      const oldest = memory.keys().next().value;
      if (!oldest) break;
      memory.delete(oldest);
    }
    // CacheStorage persists blobs across reloads on HTTPS / localhost. Memory still works if
    // browser storage is unavailable; a successful server upload must never be reported as failed.
    if (typeof caches !== 'undefined') {
      try {
        const cache = await caches.open(CACHE_NAME);
        const body = await bytes(blob);
        for (const key of keys)
          await cache.put(
            key,
            new Response(body, {
              headers: { [SAVED_AT]: String(savedAt), 'Content-Type': blob.type },
            }),
          );
        const entries = await cache.keys();
        for (const key of entries.slice(0, Math.max(0, entries.length - MAX_ENTRIES)))
          await cache.delete(key);
      } catch {
        /* Storage denied/full: retain the in-memory copy for this visit. */
      }
    }
    window.dispatchEvent(new Event(LOCAL_MEDIA_CHANGED));
  } catch {
    /* Local fallback must not change the outcome of an API mutation. */
  }
}

export async function readLocalMedia(entity?: string, path?: string | null): Promise<Blob | null> {
  try {
    const keys = storageKeys(entity, path);
    for (const key of keys) {
      const entry = memory.get(key);
      if (entry && Date.now() - entry.savedAt < MAX_AGE_MS) return entry.blob;
      memory.delete(key);
    }
    if (typeof caches === 'undefined') return null;
    const cache = await caches.open(CACHE_NAME);
    for (const key of keys) {
      const response = await cache.match(key);
      if (!response) continue;
      const savedAt = Number(response.headers.get(SAVED_AT));
      if (!savedAt || Date.now() - savedAt >= MAX_AGE_MS) {
        await cache.delete(key);
        continue;
      }
      const blob = await response.blob();
      memory.set(key, { blob, savedAt });
      return blob;
    }
  } catch {
    /* A missing local copy simply leaves the normal server image/fallback in place. */
  }
  return null;
}

export async function removeLocalMedia(entity: string, path?: string | null): Promise<void> {
  try {
    const keys = storageKeys(entity, path);
    for (const key of keys) memory.delete(key);
    if (typeof caches !== 'undefined') {
      const cache = await caches.open(CACHE_NAME);
      for (const key of keys) await cache.delete(key);
    }
    window.dispatchEvent(new Event(LOCAL_MEDIA_CHANGED));
  } catch {
    /* Best-effort cleanup. */
  }
}

/** Clear only Early Step's temporary media; leave session and other site storage alone. */
export async function clearLocalMedia(): Promise<void> {
  memory.clear();
  try {
    if (typeof caches !== 'undefined') await caches.delete(CACHE_NAME);
  } catch {
    /* Best effort. */
  }
  window.dispatchEvent(new Event(LOCAL_MEDIA_CHANGED));
}
