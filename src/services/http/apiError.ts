import { isAxiosError, isCancel } from 'axios';

import { HTTP_STATUS } from '@/services/http/httpStatus';

/** How the request failed — lets UI branch without inspecting raw errors. */
export type AppErrorKind = 'http' | 'network' | 'timeout' | 'canceled' | 'unknown';

export interface AppErrorOptions {
  kind: AppErrorKind;
  status?: number;
  code?: string;
  fieldErrors?: Record<string, string[]>;
  cause?: unknown;
}

/**
 * The single normalized error shape the rest of the app sees.
 * Components must never read raw Axios/backend errors directly.
 */
export class AppError extends Error {
  readonly kind: AppErrorKind;
  readonly status: number | undefined;
  readonly code: string | undefined;
  readonly fieldErrors: Record<string, string[]> | undefined;

  constructor(message: string, options: AppErrorOptions) {
    super(message, { cause: options.cause });
    this.name = 'AppError';
    this.kind = options.kind;
    this.status = options.status;
    this.code = options.code;
    this.fieldErrors = options.fieldErrors;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

const TIMEOUT_CODE = 'ECONNABORTED';

const FALLBACK_MESSAGES = {
  network: 'تعذّر الاتصال بالخادم. تحقّق من اتصالك بالإنترنت.',
  timeout: 'استغرق الطلب وقتًا أطول من المتوقع. يرجى المحاولة مرة أخرى.',
  canceled: 'تم إلغاء الطلب.',
  unknown: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
  server: 'حدث خطأ في الخادم. يرجى المحاولة لاحقًا.',
} as const;

const STATUS_MESSAGES: Partial<Record<number, string>> = {
  [HTTP_STATUS.BAD_REQUEST]: 'البيانات المُرسلة غير صحيحة.',
  [HTTP_STATUS.UNAUTHORIZED]: 'انتهت الجلسة. يرجى تسجيل الدخول مرة أخرى.',
  [HTTP_STATUS.FORBIDDEN]: 'ليست لديك صلاحية لتنفيذ هذا الإجراء.',
  [HTTP_STATUS.NOT_FOUND]: 'العنصر المطلوب غير موجود.',
  [HTTP_STATUS.UNPROCESSABLE_ENTITY]: 'يرجى مراجعة البيانات المُدخلة.',
};

/**
 * Pulls message / field errors out of the backend error body. Formats verified against the live
 * backend (2026-10-06):
 * - ASP.NET ProblemDetails: `{ title, status, errors?: { Field: string[] } }` (validation, 401)
 * - `{ message: string }` (domain errors, mostly Arabic, e.g. "المستخدم غير موجود.")
 * - a bare string, or an array of strings (e.g. reset-password `["Invalid or expired code."]`)
 * ProblemDetails `title` is generic English ("Unauthorized"), so it is never shown to users.
 */
function extractBackendDetails(
  data: unknown,
): Pick<AppErrorOptions, 'code' | 'fieldErrors'> & { message?: string } {
  if (typeof data === 'string') return data.trim() ? { message: data.trim() } : {};
  if (Array.isArray(data)) {
    const messages = data.filter((item): item is string => typeof item === 'string');
    return messages.length > 0 ? { message: messages.join(' ') } : {};
  }
  if (typeof data !== 'object' || data === null) return {};

  const record = data as Record<string, unknown>;
  const result: Pick<AppErrorOptions, 'code' | 'fieldErrors'> & { message?: string } = {};
  if (typeof record.message === 'string' && record.message.trim()) {
    result.message = record.message.trim();
  }
  if (typeof record.errors === 'object' && record.errors !== null) {
    const fieldErrors: Record<string, string[]> = {};
    for (const [field, value] of Object.entries(record.errors as Record<string, unknown>)) {
      if (Array.isArray(value)) {
        fieldErrors[field] = value.filter((item): item is string => typeof item === 'string');
      }
    }
    if (Object.keys(fieldErrors).length > 0) result.fieldErrors = fieldErrors;
  }
  return result;
}

function messageForStatus(status: number): string {
  return (
    STATUS_MESSAGES[status] ??
    (status >= HTTP_STATUS.INTERNAL_SERVER_ERROR
      ? FALLBACK_MESSAGES.server
      : FALLBACK_MESSAGES.unknown)
  );
}

/** Converts anything thrown during a request into an `AppError`. */
export function normalizeError(error: unknown): AppError {
  if (isAppError(error)) return error;

  if (isCancel(error)) {
    return new AppError(FALLBACK_MESSAGES.canceled, { kind: 'canceled', cause: error });
  }

  if (isAxiosError(error)) {
    if (error.code === TIMEOUT_CODE) {
      return new AppError(FALLBACK_MESSAGES.timeout, { kind: 'timeout', cause: error });
    }

    if (!error.response) {
      return new AppError(FALLBACK_MESSAGES.network, { kind: 'network', cause: error });
    }

    const { status } = error.response;
    const details = extractBackendDetails(error.response.data as unknown);

    return new AppError(details.message ?? messageForStatus(status), {
      kind: 'http',
      status,
      cause: error,
      ...(details.code !== undefined && { code: details.code }),
      ...(details.fieldErrors !== undefined && { fieldErrors: details.fieldErrors }),
    });
  }

  return new AppError(FALLBACK_MESSAGES.unknown, { kind: 'unknown', cause: error });
}
