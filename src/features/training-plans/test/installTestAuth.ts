import { registerHttpAuthHooks } from '@/services/http/interceptors';
import { getAccessToken } from '@/services/session';

/**
 * Sends the signed-in test user's token with every request (the app does this through
 * `AuthHttpBridge`, which page-level tests do not render).
 */
export function installTestAuthHeader(): void {
  beforeAll(() => {
    registerHttpAuthHooks({ getAccessToken, onUnauthorized: () => undefined });
  });
}
