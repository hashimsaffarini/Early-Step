import { useEffect, useId, useMemo, useRef } from 'react';

import { Button } from '@/components/ui/Button';

import { IMAGE_ACCEPT } from '../schemas/contentForms';

import styles from './content.module.css';
import { ServerImage } from '@/components/shared/ServerImage';

export interface ImageFieldProps {
  label: string;
  value: File | null;
  onChange: (file: File | null) => void;
  /** Current server image (edit forms), shown until a new file is picked. */
  existingPath?: string | null | undefined;
  error?: string | undefined;
  hint?: string;
}

/** Image picker with preview. The preview object URL is revoked on change/unmount. */
export function ImageField({ label, value, onChange, existingPath, error, hint }: ImageFieldProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrl = useMemo(() => (value ? URL.createObjectURL(value) : null), [value]);

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  return (
    <div>
      <label htmlFor={id} className={styles.legend}>
        {label}
      </label>
      <div className={styles.imageField}>
        {previewUrl ? (
          <img src={previewUrl} alt="معاينة الصورة المختارة" className={styles.preview} />
        ) : (
          <ServerImage
            path={existingPath ?? null}
            alt="الصورة الحالية"
            className={styles.preview}
          />
        )}
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={IMAGE_ACCEPT}
          className={styles.fileInput}
          aria-invalid={Boolean(error)}
          aria-describedby={
            [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined
          }
          onChange={(event) => {
            onChange(event.target.files?.[0] ?? null);
          }}
        />
        {value ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onChange(null);
              if (inputRef.current) inputRef.current.value = '';
            }}
          >
            إزالة الصورة
          </Button>
        ) : null}
      </div>
      {hint ? (
        <p id={hintId} className={styles.muted}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className={styles.fieldError} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
