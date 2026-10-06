import { normalizeRole } from './backendRoles';

describe('normalizeRole', () => {
  it.each([
    ['ولي أمر', 'Parent'],
    ['معلم/ة', 'Teacher'],
    ['أخصائي/ة', 'Specialist'],
    ['Parent', 'Parent'],
    ['superadmin', 'SuperAdmin'],
    ['  Admin ', 'Admin'],
  ] as const)('maps %s to %s', (raw, expected) => {
    expect(normalizeRole(raw)).toBe(expected);
  });

  it('fails closed for unknown or missing values', () => {
    expect(normalizeRole('Owner')).toBeNull();
    expect(normalizeRole(undefined)).toBeNull();
    expect(normalizeRole(3)).toBeNull();
  });
});
