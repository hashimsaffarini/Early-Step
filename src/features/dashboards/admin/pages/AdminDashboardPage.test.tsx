import { screen, within } from '@testing-library/react';

import { renderInRouter } from '@/test/renderWithRouter';

import { AdminDashboardPage } from './AdminDashboardPage';

describe('AdminDashboardPage', () => {
  it('shows the admin overview with counts from the roster', () => {
    renderInRouter(<AdminDashboardPage userName="خالد سعيد" />);

    expect(screen.getByRole('heading', { level: 1, name: /خالد سعيد/ })).toBeInTheDocument();
    const summary = screen.getByRole('region', { name: 'ملخص' });
    expect(within(summary).getByText('الأطفال المسجّلون')).toBeInTheDocument();
    expect(within(summary).getByText('7')).toBeInTheDocument();
    expect(within(summary).getByText('6')).toBeInTheDocument();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it('lists all children with admin-scoped profile links and the parent name', () => {
    renderInRouter(<AdminDashboardPage userName="خالد سعيد" />);
    const list = screen.getByRole('list', { name: 'الأطفال' });

    expect(within(list).getAllByRole('article')).toHaveLength(7);
    expect(within(list).getByRole('link', { name: 'عرض ملف عمر' })).toHaveAttribute(
      'href',
      '/admin/children/mock-child-4',
    );
    expect(within(list).getByText('ولي الأمر: سامي محمود')).toBeInTheDocument();
  });

  it('shows recent activity', () => {
    renderInRouter(<AdminDashboardPage userName="خالد سعيد" />);

    expect(screen.getByRole('region', { name: 'آخر النشاطات' })).toBeInTheDocument();
  });
});
