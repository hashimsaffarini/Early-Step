import { setupWorker } from 'msw/browser';

import { handlers } from './handlers';

/** Browser MSW worker — development mock mode only (see README). */
export const worker = setupWorker(...handlers);
