import { decodeJwtPayload, parseLoginResponse } from './loginResponse';

function fakeUnsignedJwt(claims: Record<string, unknown>): string {
  const encode = (value: unknown) =>
    btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(value))))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  return `${encode({ alg: 'none' })}.${encode(claims)}.test`;
}

describe('parseLoginResponse (contract NOT LIVE-VERIFIED)', () => {
  it('reads token, role and name from ASP.NET-style JWT claims', () => {
    const token = fakeUnsignedJwt({
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'ولي أمر',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': 'محمد أحمد',
      sub: 'u-1',
      exp: 2_000_000_000,
    });

    const session = parseLoginResponse({ token });

    expect(session.user).toEqual({ id: 'u-1', name: 'محمد أحمد', email: null, role: 'Parent' });
    expect(session.expiresAt).toBe(2_000_000_000_000);
  });

  it('prefers explicit response fields and accepts accessToken / nested data', () => {
    const session = parseLoginResponse({
      data: { accessToken: 'opaque-token', role: 'Specialist', fullName: 'أ. ليلى' },
    });

    expect(session.accessToken).toBe('opaque-token');
    expect(session.user.role).toBe('Specialist');
    expect(session.expiresAt).toBeNull();
  });

  it('fails clearly when there is no token', () => {
    expect(() => parseLoginResponse({ message: 'ok' })).toThrow('استجابة غير متوقعة');
  });

  it('fails closed when the role is unknown', () => {
    expect(() => parseLoginResponse({ token: 'x', role: 'Owner' })).toThrow('صلاحية');
  });

  it('decodes Arabic claim values', () => {
    expect(decodeJwtPayload(fakeUnsignedJwt({ name: 'ريم' }))).toEqual({ name: 'ريم' });
  });
});
