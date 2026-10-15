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
