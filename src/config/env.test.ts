import { ConfigurationError } from './configurationError';
import { normalizeError } from '@/services/http/apiError';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

async function config(value: string | undefined) {
  vi.resetModules();
  vi.stubEnv('VITE_API_BASE_URL', value);
  return import('./env');
}

describe('API environment configuration', () => {
  it.each([
    undefined,
    '',
    'not a URL',
    'https://example.test/',
    'https://example.test/api/?token=example',
    'ftp://example.test/api/',
  ])('explains invalid configuration %s', async (value) => {
    const { getEnv } = await config(value);
    expect(getEnv).toThrow(/VITE_API_BASE_URL/);
  });
  it('accepts an API URL without the final slash and normalizes it', async () => {
    const { getEnv } = await config('https://example.test/api');
    expect(getEnv()).toEqual({
      apiBaseUrl: 'https://example.test/api/',
      apiOrigin: 'https://example.test',
    });
  });
  it('preserves a valid API URL', async () => {
    const { getEnv } = await config('https://example.test/api/');
    expect(getEnv().apiBaseUrl).toBe('https://example.test/api/');
  });
  it('keeps the actionable configuration message during HTTP error normalization', () => {
    const error = normalizeError(new ConfigurationError());
    expect(error.kind).toBe('configuration');
    expect(error.code).toBe('INVALID_API_CONFIGURATION');
    expect(error.message).toContain('.env.example');
    expect(error.status).toBeUndefined();
  });
});
