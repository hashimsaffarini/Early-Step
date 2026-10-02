import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderInRouter } from '@/test/renderWithRouter';

import { SpecialistDashboardPage } from './SpecialistDashboardPage';

describe('SpecialistDashboardPage', () => {
  it('greets the specialist with links to children and reports', () => {
    renderInRouter(<SpecialistDashboardPage userName="أ. ليلى حسن" />);

    expect(screen.getByRole('heading', { level: 1, name: /أ. ليلى حسن/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'كل الأطفال' })).toHaveAttribute(
      'href',
      '/specialist/children',
    );
    expect(screen.getByRole('link', { name: 'تقاريري' })).toHaveAttribute(
      'href',
      '/specialist/reports',
    );
  });

  it('shows neutral stats without risk counts', () => {
    renderInRouter(<SpecialistDashboardPage userName="أ. ليلى حسن" />);
    const summary = screen.getByRole('region', { name: 'ملخص' });

    for (const label of [
      'الأطفال المتابَعون',
      'خطط تدريبية نشطة',
      'تقاريري',
      'بانتظار خطة تدريبية',
    ]) {
      expect(within(summary).getByText(label)).toBeInTheDocument();
    }
    expect(screen.queryByText(/%|خطر/)).not.toBeInTheDocument();
  });

  it('gives every child a profile link and a "تقرير جديد" link', () => {
    renderInRouter(<SpecialistDashboardPage userName="أ. ليلى حسن" />);
    const list = screen.getByRole('list', { name: 'أطفالي' });

    expect(within(list).getAllByRole('article')).toHaveLength(6);
    expect(within(list).getByRole('link', { name: 'عرض ملف ليان' })).toHaveAttribute(
      'href',
      '/specialist/children/mock-child-7',
    );
    expect(within(list).getByRole('link', { name: 'تقرير جديد عن ليان' })).toHaveAttribute(
      'href',
      '/specialist/reports/new',
    );
  });

  it('filters children by name', async () => {
    renderInRouter(<SpecialistDashboardPage userName="أ. ليلى حسن" />);

    await userEvent.type(screen.getByRole('searchbox', { name: 'ابحث باسم الطفل...' }), 'ريم');

    expect(screen.getAllByRole('article')).toHaveLength(1);
  });
});
