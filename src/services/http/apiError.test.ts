import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios';

import { normalizeError } from './apiError';

function httpError(status: number, data: unknown): AxiosError {
  const response = {
    status,
    data,
    statusText: '',
    headers: {},
    config: { headers: new AxiosHeaders() },
  } as AxiosResponse;
  return new AxiosError('failed', 'ERR_BAD_RESPONSE', response.config, null, response);
}

describe('normalizeError', () => {
  it('uses the backend { message } when present', () => {
    const error = normalizeError(httpError(404, { message: 'المستخدم غير موجود.' }));
    expect(error.message).toBe('المستخدم غير موجود.');
    expect(error.status).toBe(404);
  });

  it('reads ProblemDetails field errors and keeps an Arabic message (never the English title)', () => {
    const error = normalizeError(
      httpError(400, {
        title: 'One or more validation errors occurred.',
        status: 400,
        errors: { Email: ['The Email field is required.'] },
      }),
    );
    expect(error.fieldErrors).toEqual({ Email: ['The Email field is required.'] });
    expect(error.message).toBe('البيانات المُرسلة غير صحيحة.');
  });

  it('joins a string array body', () => {
    expect(normalizeError(httpError(400, ['Invalid or expired code.'])).message).toBe(
      'Invalid or expired code.',
    );
  });

  it('falls back to an Arabic status message', () => {
    const error = normalizeError(httpError(401, { title: 'Unauthorized', status: 401 }));
    expect(error.message).toBe('انتهت الجلسة. يرجى تسجيل الدخول مرة أخرى.');
  });

  it('maps a missing response to a network error', () => {
    const error = normalizeError(new AxiosError('Network Error', 'ERR_NETWORK'));
    expect(error.kind).toBe('network');
  });
});
