import type { AxiosInstance } from 'axios';

import { getEnv } from '@/config/env';
import { normalizeError } from '@/services/http/apiError';
import { HTTP_STATUS } from '@/services/http/httpStatus';

/**
 * Hooks the auth feature registers at startup. Keeping them as injected
 * callbacks means the HTTP layer never imports from `features/*`.
 */
export interface HttpAuthHooks {
  /** Returns the current access token, or null when signed out. */
  getAccessToken: () => string | null;
  /**
   * Called when the API answers 401. Future refresh-token logic (if the
   * backend supports it — TBD) plugs in here or in a dedicated interceptor.
   */
  onUnauthorized: () => void;
}

let authHooks: HttpAuthHooks | null = null;

export function registerHttpAuthHooks(hooks: HttpAuthHooks): void {
  authHooks = hooks;
}

export function setupInterceptors(client: AxiosInstance): void {
  client.interceptors.request.use((config) => {
    config.baseURL ??= getEnv().apiBaseUrl;

    const token = authHooks?.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      const appError = normalizeError(error);

      if (appError.status === HTTP_STATUS.UNAUTHORIZED) {
        authHooks?.onUnauthorized();
      }

      return Promise.reject(appError);
    },
  );
}
