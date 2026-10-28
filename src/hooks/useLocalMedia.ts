import { useEffect, useState } from 'react';
import { LOCAL_MEDIA_CHANGED, readLocalMedia } from '@/services/media/localMedia';

/** Object URLs are short-lived view resources; the stored copy is the original image blob. */
export function useLocalMedia(
  entity: string | undefined,
  path: string | null | undefined,
): string | null {
  const key = `${entity ?? ''}|${path ?? ''}`;
  const [image, setImage] = useState<{ key: string; url: string } | null>(null);
  useEffect(() => {
    if (!entity && !path) return undefined;
    let alive = true;
    let currentUrl: string | null = null;
    let generation = 0;
    const load = async () => {
      const ownGeneration = ++generation;
      const blob = await readLocalMedia(entity, path);
      if (!alive || generation !== ownGeneration) return;
      const next =
        blob && typeof URL.createObjectURL === 'function' ? URL.createObjectURL(blob) : null;
      const previous = currentUrl;
      currentUrl = next;
      if (next || previous) setImage(next ? { key, url: next } : null);
      if (previous) URL.revokeObjectURL(previous);
    };
    void load();
    const refresh = () => {
      void load();
    };
    window.addEventListener(LOCAL_MEDIA_CHANGED, refresh);
    return () => {
      alive = false;
      window.removeEventListener(LOCAL_MEDIA_CHANGED, refresh);
      if (currentUrl) URL.revokeObjectURL(currentUrl);
    };
  }, [entity, path, key]);
  return image?.key === key ? image.url : null;
}
