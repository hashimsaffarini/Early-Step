import { ImageIcon, ImagePlus, X } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';

import { useLocalMedia } from '@/hooks/useLocalMedia';
import { IMAGE_NOT_SERVED } from '@/components/shared/ServerImage';
import { resolveMediaUrl } from '@/services/api/mediaUrl';
import { Button } from '@/components/ui/Button';

import { IMAGE_ACCEPT } from '../schemas/contentForms';

import styles from './content.module.css';

export interface ImageFieldProps {
  label: string;
  mediaKey?: string | undefined;
  value: File | null;
  onChange: (file: File | null) => void;
  /** Current server image (edit forms), shown until a new file is picked. */
  existingPath?: string | null | undefined;
  error?: string | undefined;
  hint?: string;
}

/** A neutral placeholder in the preview box (no broken-image icon). */
function PreviewPlaceholder({ text }: { text: string }) {
  return (
    <span className={styles.previewEmpty}>
      <ImageIcon aria-hidden="true" />
      <span>{text}</span>
    </span>
  );
}

/**
 * Image picker in Arabic: a preview box (the current server image, the newly chosen file, or a
 * neutral placeholder), a choose / replace button over the native file input (still focusable and
 * labelled), the chosen file's name and a remove action. The preview URL is revoked on change.
 */
export function ImageField({
  label,
  value,
  onChange,
  existingPath,
  error,
  hint,
  mediaKey,
}: ImageFieldProps) {
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
  const statusId = `${id}-status`;
  const localSrc = useLocalMedia(mediaKey, existingPath);
  const currentSrc = localSrc ?? resolveMediaUrl(existingPath);
  const hasCurrent = currentSrc !== null;
  // The server keeps the path even when it does not serve the file: say so instead of a broken icon.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const currentFailed = currentSrc !== null && failedSrc === currentSrc;

  let preview;
  let status;
  if (previewUrl && value) {
    preview = <img src={previewUrl} alt="معاينة الصورة المختارة" className={styles.preview} />;
    status = `صورة جديدة: ${value.name} — تُحفظ عند الضغط على «حفظ».`;
  } else if (currentSrc && currentFailed) {
    preview = <PreviewPlaceholder text="غير متاحة" />;
    status = IMAGE_NOT_SERVED;
  } else if (currentSrc) {
    preview = (
      <img
        src={currentSrc}
        alt="الصورة الحالية"
        className={styles.preview}
        onError={() => {
          setFailedSrc(currentSrc);
        }}
      />
    );
    status = localSrc
      ? 'نسخة محلية محفوظة على هذا المتصفح — اختر صورة أخرى لاستبدالها.'
      : 'الصورة الحالية — اختر صورة أخرى لاستبدالها.';
  } else {
    preview = <PreviewPlaceholder text="لا توجد صورة" />;
    status = 'لا توجد صورة بعد.';
  }

  return (
    <div className={styles.imageFieldWrap}>
      <span className={styles.fieldLabel} id={`${id}-label`}>
        {label}
      </span>
      <div className={styles.imageField}>
        <div className={styles.previewBox}>{preview}</div>
        <div className={styles.imageActions}>
          <label htmlFor={id} className={styles.fileButton}>
            <ImagePlus aria-hidden="true" />
            {value || hasCurrent ? 'استبدال الصورة' : 'اختيار صورة'}
          </label>
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept={IMAGE_ACCEPT}
            className={styles.fileInput}
            aria-labelledby={`${id}-label`}
            aria-invalid={Boolean(error)}
            aria-describedby={[statusId, hint ? hintId : null, error ? errorId : null]
              .filter(Boolean)
              .join(' ')}
            onChange={(event) => {
              onChange(event.target.files?.[0] ?? null);
            }}
          />
          {value ? (
            <Button
              variant="ghost"
              size="sm"
              iconStart={<X aria-hidden="true" />}
              onClick={() => {
                onChange(null);
                if (inputRef.current) inputRef.current.value = '';
              }}
            >
              إلغاء الصورة المختارة
            </Button>
          ) : null}
          <p id={statusId} className={styles.muted}>
            {status}
          </p>
        </div>
      </div>
      <p className={styles.muted}>
        تظهر الصورة محلياً على هذا المتصفح، وتبقى بعد إعادة التحميل إذا كان التخزين المحلي متاحاً.
        لا تنتقل تلقائياً إلى أجهزة أخرى.
      </p>
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
