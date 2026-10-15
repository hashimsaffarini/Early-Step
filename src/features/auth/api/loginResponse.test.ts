import { decodeJwtPayload, parseLoginResponse } from './loginResponse';

function fakeUnsignedJwt(claims: Record<string, unknown>): string {
  const encode = (value: unknown) =>
    btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(value))))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  return `${encode({ alg: 'none' })}.${encode(claims)}.test`;
}

describe('parseLoginResponse (live shape { id, fullName, accessToken, role })', () => {
  it('reads the token and its expiry; the user comes from Auth/me', () => {
    const accessToken = fakeUnsignedJwt({ exp: 2_000_000_000 });

    const token = parseLoginResponse({ id: 'u-1', fullName: 'م', accessToken, role: 'ولي أمر' });

    expect(token).toEqual({ accessToken, expiresAt: 2_000_000_000_000 });
  });

  it('keeps an opaque token without an expiry', () => {
    expect(parseLoginResponse({ accessToken: 'opaque-token' })).toEqual({
      accessToken: 'opaque-token',
      expiresAt: null,
    });
  });

  it('fails clearly when there is no token', () => {
    expect(() => parseLoginResponse({ message: 'ok' })).toThrow('استجابة غير متوقعة');
  });

  it('decodes Arabic claim values', () => {
    expect(decodeJwtPayload(fakeUnsignedJwt({ name: 'ريم' }))).toEqual({ name: 'ريم' });
  });
});
