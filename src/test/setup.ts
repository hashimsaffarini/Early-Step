import '@testing-library/jest-dom/vitest';

import { resetMockDb } from '@/mocks/db';
import { server } from '@/mocks/server';
import { registerHttpAuthHooks } from '@/services/http/interceptors';
import { getAccessToken, useSessionStore } from '@/services/session';

/* Mocked HTTP for every test — unhandled requests fail loudly; nothing reaches the live backend. */
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
  // Same wiring as AuthHttpBridge: requests carry the signed-in test user's token.
  registerHttpAuthHooks({
    getAccessToken,
    onUnauthorized: () => {
      useSessionStore.getState().signOut();
    },
  });
});
beforeEach(() => {
  resetMockDb();
});
afterEach(() => {
  server.resetHandlers();
  useSessionStore.getState().signOut();
});
afterAll(() => {
  server.close();
});

/*
 * jsdom does not implement HTMLDialogElement.showModal/close.
 * Minimal stand-in: toggles the `open` attribute and fires `close`.
 */
if (typeof HTMLDialogElement.prototype.showModal !== 'function') {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
}
