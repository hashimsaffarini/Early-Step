import { normalizeRole } from './backendRoles';

describe('normalizeRole', () => {
  it.each([
    ['ولي أمر', 'Parent'],
    ['معلم/ة', 'Teacher'],
    ['أخصائي/ة', 'Specialist'],
    ['superadmin', 'SuperAdmin'],
    ['  Admin ', 'Admin'],
  ] as const)('maps the live value %s to %s', (raw, expected) => {
    expect(normalizeRole(raw)).toBe(expected);
  });

  it('fails closed for unknown or missing values', () => {
    expect(normalizeRole('Owner')).toBeNull();
    // Never observed live, so not accepted (only the five live values are).
    expect(normalizeRole('Parent')).toBeNull();
    expect(normalizeRole('Super Admin')).toBeNull();
    expect(normalizeRole(undefined)).toBeNull();
    expect(normalizeRole(3)).toBeNull();
  });
});
