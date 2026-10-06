import { useState } from 'react';

import { resolveMediaUrl } from '@/services/api/mediaUrl';

export interface ServerImageProps {
  path: string | null;
  alt: string;
  className?: string | undefined;
}

/** Server-relative image (`/uploads/...`). Renders nothing when missing or failing to load. */
export function ServerImage({ path, alt, className }: ServerImageProps) {
  const [failed, setFailed] = useState(false);
  const src = resolveMediaUrl(path);
  if (!src || failed) return null;
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
