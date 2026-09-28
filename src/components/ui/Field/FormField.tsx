import { CircleAlert } from 'lucide-react';
import { useId, type ReactNode } from 'react';

import styles from './FormField.module.css';

/** Props a form control must receive to be correctly labelled and described. */
export interface FieldControlProps {
  id: string;
  'aria-invalid': boolean;
  'aria-describedby'?: string;
  'aria-required'?: boolean;
}

export interface FormFieldProps {
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
  isRequired?: boolean;
  /** Optional element next to the label (e.g. "نسيت كلمة المرور؟" link). */
  labelAction?: ReactNode;
  children: (controlProps: FieldControlProps) => ReactNode;
}

/**
 * Label + control + hint + error with guaranteed associations
 * (`htmlFor`/`id`, `aria-describedby`, `aria-invalid`).
 */
export function FormField({
  label,
  error,
  hint,
  isRequired = false,
  labelAction,
  children,
}: FormFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ');

  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label htmlFor={id} className={styles.label}>
          {label}
          {isRequired ? (
            <span className={styles.required} aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
        {labelAction}
      </div>
      {children({
        id,
        'aria-invalid': Boolean(error),
        ...(describedBy && { 'aria-describedby': describedBy }),
        ...(isRequired && { 'aria-required': true }),
      })}
      {hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className={styles.error}>
          <CircleAlert aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
