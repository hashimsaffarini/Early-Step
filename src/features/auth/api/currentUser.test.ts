import { mapCurrentUser } from './currentUser';

describe('mapCurrentUser (GET Auth/me, verified live 2026-10-14)', () => {
  it.each([
    ['ولي أمر', 'Parent'],
    ['أخصائي/ة', 'Specialist'],
    ['معلم/ة', 'Teacher'],
    ['Admin', 'Admin'],
    ['SuperAdmin', 'SuperAdmin'],
  ] as const)('normalizes the backend role %s', (wire, role) => {
    expect(
      mapCurrentUser({ id: 'u-1', fullName: ' محمد ', email: 'p@demo.test', roles: [wire] }),
    ).toEqual({ id: 'u-1', name: 'محمد', email: 'p@demo.test', role });
  });

  it('uses the first known role', () => {
    expect(mapCurrentUser({ id: 'u-1', roles: ['Owner', 'Admin'] }).role).toBe('Admin');
  });

  it('fails closed when no role is known', () => {
    expect(() => mapCurrentUser({ id: 'u-1', roles: ['Owner'] })).toThrow('صلاحية');
    expect(() => mapCurrentUser({ id: 'u-1', roles: null })).toThrow('صلاحية');
  });
});
