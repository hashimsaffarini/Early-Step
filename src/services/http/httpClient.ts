import axios from 'axios';

import { setupInterceptors } from '@/services/http/interceptors';

const REQUEST_TIMEOUT_MS = 30_000;

/**
 * Shared Axios instance. Feature API modules (`features/<x>/api/*`) use this;
 * components never call it directly.
 *
 * The base URL is resolved lazily in the request interceptor from the
 * validated env, so importing this module never throws.
 */
export const httpClient = axios.create({
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    Accept: 'application/json',
  },
});

setupInterceptors(httpClient);
