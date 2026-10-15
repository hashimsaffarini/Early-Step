import { toUsersByRole } from './dashboardsApi';

describe('toUsersByRole', () => {
  it('maps the live backend role values and keeps the server counts', () => {
    expect(
      toUsersByRole({
        totalUsers: 40,
        usersByRole: [
          { role: 'أخصائي/ة', count: 9 },
          { role: 'ولي أمر', count: 23 },
          { role: 'معلم/ة', count: 6 },
          { role: 'Admin', count: 1 },
          { role: 'SuperAdmin', count: 1 },
        ],
      }),
    ).toEqual([
      { role: 'Specialist', count: 9 },
      { role: 'Parent', count: 23 },
      { role: 'Teacher', count: 6 },
      { role: 'Admin', count: 1 },
      { role: 'SuperAdmin', count: 1 },
    ]);
  });

  it('drops unknown roles and returns null when the field is missing', () => {
    expect(toUsersByRole({ usersByRole: [{ role: 'Guest', count: 3 }] })).toEqual([]);
    expect(toUsersByRole({ totalUsers: 1 })).toBeNull();
  });
});
