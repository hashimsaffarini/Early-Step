import { toDashboardStats } from './dashboardStats';

describe('toDashboardStats', () => {
  it('maps the Admin dashboard keys observed live to labelled stats', () => {
    const stats = toDashboardStats({ 'إجمالي المستخدمين': 28, 'إجمالي الانشطة': 4 });

    expect(stats.map((stat) => [stat.label, stat.value])).toEqual([
      ['إجمالي المستخدمين', 28],
      ['إجمالي الأنشطة', 4],
    ]);
  });

  it('keeps unknown numeric fields with the server label and ignores everything else', () => {
    const stats = toDashboardStats({
      totalChildren: 3,
      pendingReviews: 2,
      name: 'x',
      recent: [{ id: 1 }],
      ratio: Number.NaN,
    });

    expect(stats.map((stat) => [stat.label, stat.value])).toEqual([
      ['عدد الأطفال', 3],
      ['pendingReviews', 2],
    ]);
  });

  it('returns nothing for non-object responses (never invents numbers)', () => {
    expect(toDashboardStats([1, 2])).toEqual([]);
    expect(toDashboardStats('ok')).toEqual([]);
    expect(toDashboardStats(null)).toEqual([]);
  });
});
