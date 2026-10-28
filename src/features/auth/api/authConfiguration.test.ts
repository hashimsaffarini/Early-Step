afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('auth with missing local configuration', () => {
  it('reports missing configuration for login and registration before making any network request', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_API_BASE_URL', undefined);
    const { httpClient } = await import('@/services/http/httpClient');
    const adapter = vi.fn();
    httpClient.defaults.adapter = adapter;
    const { login, registerParent } = await import('./authApi');
    await expect(
      login({ email: 'parent@example.test', password: 'Example1!', rememberMe: false }),
    ).rejects.toMatchObject({
      kind: 'configuration',
      code: 'INVALID_API_CONFIGURATION',
    });
    await expect(
      registerParent({
        fullName: 'اختبار',
        email: 'parent@example.test',
        password: 'Example1!',
        confirmPassword: 'Example1!',
      }),
    ).rejects.toMatchObject({
      kind: 'configuration',
      code: 'INVALID_API_CONFIGURATION',
    });
    expect(adapter).not.toHaveBeenCalled();
  });
});
