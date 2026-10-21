import { useState, type ReactNode } from 'react';

import { resolveMediaUrl } from '@/services/api/mediaUrl';

export interface ServerImageProps {
  path: string | null;
  alt: string;
  className?: string | undefined;
  /** Neutral placeholder when the server sent no image or it failed to load. */
  fallback?: ReactNode;
}

/**
 * Server-relative image (`/uploads/...`, resolved against the API host). When the field is null or
 * the image fails to load, renders `fallback` (default: nothing) — never an invented image.
 */
export function ServerImage({ path, alt, className, fallback = null }: ServerImageProps) {
  const [failed, setFailed] = useState(false);
  const src = resolveMediaUrl(path);
  if (!src || failed) return fallback;
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => {
        setFailed(true);
      }}
    />
  );
}

/**
 * Admin notice for an image the server has a path for but does not serve (live 2026-10-16: every
 * `/uploads/...` file answers 404 — BACKEND_REQUESTS). The upload itself was saved.
 */
export const IMAGE_NOT_SERVED = 'الصورة محفوظة لكن الخادم لا يعرضها حالياً.';
