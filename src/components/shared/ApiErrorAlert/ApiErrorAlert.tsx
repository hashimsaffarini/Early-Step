import { Alert } from '@/components/ui/Feedback';
import type { AppError } from '@/services/http/apiError';

export interface ApiErrorAlertProps {
  error: AppError | null | undefined;
  /** Replaces the error's own message (e.g. a friendlier text for 401 on login). */
  message?: string | undefined;
}

/**
 * Shows a normalized API error: the Arabic message plus any server field errors.
 * Server text is rendered as plain text (React escapes it) — never as HTML.
 */
export function ApiErrorAlert({ error, message }: ApiErrorAlertProps) {
  if (!error) return null;
  const fieldMessages = Object.values(error.fieldErrors ?? {}).flat();
  return (
    <Alert tone="danger">
      {message ?? error.message}
      {fieldMessages.length > 0 ? (
        <ul>
          {fieldMessages.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
      ) : null}
    </Alert>
  );
}
