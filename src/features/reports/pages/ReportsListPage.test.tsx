import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { getAreaPaths } from '@/constants/routes';

import { ReportsListPage } from './ReportsListPage';
import { renderReportsPage } from './reportsTestUtils';

const getCards = () =>
  within(screen.getByRole('list', { name: 'قائمة التقارير' })).getAllByRole('article');

describe('ReportsListPage', () => {
  it.each([
    ['Parent', 3],
    ['Teacher', 5],
    ['Specialist', 6],
    ['Admin', 6],
  ] as const)('shows only the reports visible to the %s', (role, count) => {
    renderReportsPage(role, <ReportsListPage />);

    expect(getCards()).toHaveLength(count);
  });

  it('shows the child name on every card and no percentages', () => {
    renderReportsPage('Parent', <ReportsListPage />);

    expect(screen.getAllByText('يوسف')).toHaveLength(2);
    expect(screen.getByText('نور')).toBeInTheDocument();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it('links each card to its detail page', () => {
    renderReportsPage('Teacher', <ReportsListPage />);

    expect(
      screen.getByRole('link', { name: 'عرض التقرير الكامل: تقرير متابعة — سلمى' }),
    ).toHaveAttribute('href', getAreaPaths('Teacher').reportDetail('report-4'));
  });

  it('offers "تقرير جديد" only to report authors', () => {
    const { unmount } = renderReportsPage('Parent', <ReportsListPage />);
    expect(screen.queryByRole('link', { name: /تقرير جديد/ })).not.toBeInTheDocument();
    unmount();

    renderReportsPage('Specialist', <ReportsListPage />);
    expect(screen.getByRole('link', { name: /تقرير جديد/ })).toHaveAttribute(
      'href',
      getAreaPaths('Specialist').reportCreate,
    );
  });

  it('searches by child name and filters by report type', async () => {
    renderReportsPage('Specialist', <ReportsListPage />);

    await userEvent.type(screen.getByRole('searchbox', { name: 'البحث في التقارير' }), 'يوسف');
    expect(getCards()).toHaveLength(2);

    await userEvent.click(screen.getByRole('button', { name: /^متابعة/ }));
    expect(screen.getByRole('button', { name: /^متابعة/ })).toHaveAttribute('aria-pressed', 'true');
    expect(getCards()).toHaveLength(1);
  });

  it('shows a no-results state when nothing matches', async () => {
    renderReportsPage('Parent', <ReportsListPage />);

    await userEvent.type(screen.getByRole('searchbox', { name: 'البحث في التقارير' }), 'غير موجود');

    expect(screen.getByText('لا توجد نتائج')).toBeInTheDocument();
  });
});
