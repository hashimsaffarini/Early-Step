import { useState, type ReactNode } from 'react';

import { useLocalMedia } from '@/hooks/useLocalMedia';
import { resolveMediaUrl } from '@/services/api/mediaUrl';

export interface ServerImageProps {
  path: string | null;
  mediaKey?: string | undefined;
  alt: string;
  className?: string | undefined;
  /** Neutral placeholder when the server sent no image or it failed to load. */
  fallback?: ReactNode;
}

/**
 * Server-relative image (`/uploads/...`, resolved against the API host). When the field is null or
 * the image fails to load, renders `fallback` (default: nothing) — never an invented image.
 */
export function ServerImage({ path, alt, className, fallback = null, mediaKey }: ServerImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const remote = resolveMediaUrl(path);
  const local = useLocalMedia(mediaKey, path);
  const src = remote && failedSrc !== remote ? remote : local;
  if (!src || failedSrc === src) return fallback;
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => {
        setFailedSrc(src);
      }}
    />
  );
}

/**
 * Admin notice for an image the server has a path for but does not serve (live 2026-10-16: every
 * `/uploads/...` file answers 404 — BACKEND_REQUESTS). The upload itself was saved.
 */
export const IMAGE_NOT_SERVED =
  'الصورة غير متاحة على الخادم ولا توجد نسخة محلية منها. أعد اختيار الملف الأصلي وحفظه لعرضه على هذا المتصفح.';
