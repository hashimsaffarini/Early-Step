import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from '@/app/App';
import { isMockMode } from '@/config/env';
import '@/styles/index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element "#root" was not found in index.html.');
}

/** Development mock mode (VITE_USE_MOCKS=true): MSW answers every API call. Never in production. */
async function startMockServer(): Promise<void> {
  if (!isMockMode()) return;
  const { worker } = await import('@/mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass', quiet: true });
}

void startMockServer().then(() => {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
