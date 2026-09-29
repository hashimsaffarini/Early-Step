import { screen, within } from '@testing-library/react';

import { renderInRouter } from '@/test/renderWithRouter';

import { MOCK_PARENT_ACTIVITY, MOCK_PARENT_CHILDREN } from '../mock/parentDashboard.mock';

import { ParentDashboardPage } from './ParentDashboardPage';

function renderDashboard() {
  return renderInRouter(<ParentDashboardPage parentName="محمد أحمد" />);
}

describe('ParentDashboardPage', () => {
  it('renders the welcome banner as the page heading', () => {
    renderDashboard();

    expect(screen.getByRole('heading', { level: 1, name: /محمد أحمد/ })).toBeInTheDocument();
    expect(screen.getByText('إليك نظرة عامة على آخر التطورات والأنشطة.')).toBeInTheDocument();
  });

  it('renders the four summary cards', () => {
    renderDashboard();
    const summary = screen.getByRole('region', { name: 'ملخص' });

    for (const label of ['عدد الأطفال', 'التقييمات المكتملة', 'الخطط التدريبية', 'التقارير']) {
      expect(within(summary).getByText(label)).toBeInTheDocument();
    }
  });

  it('renders the children preview with a card per mock child', () => {
    renderDashboard();
    const section = screen.getByRole('region', { name: 'أطفالي' });

    for (const child of MOCK_PARENT_CHILDREN) {
      expect(within(section).getByRole('heading', { name: child.name })).toBeInTheDocument();
    }
    expect(within(section).getByText('بانتظار بدء التقييم')).toBeInTheDocument();
  });

  it('renders recent activity items with dates', () => {
    renderDashboard();
    const section = screen.getByRole('region', { name: 'آخر النشاطات' });
    const items = within(section).getAllByRole('listitem');

    expect(items).toHaveLength(MOCK_PARENT_ACTIVITY.length);
    expect(within(section).getAllByText(/2026/)).toHaveLength(MOCK_PARENT_ACTIVITY.length);
  });

  it('gives every primary section a meaningful heading', () => {
    renderDashboard();

    for (const name of ['أطفالي', 'آخر النشاطات', 'نصائح لك']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });

  it('links "عرض الكل" to the children list and each card to its profile', () => {
    renderDashboard();

    expect(screen.getByRole('link', { name: /عرض الكل/ })).toHaveAttribute(
      'href',
      '/parent/children',
    );
    for (const child of MOCK_PARENT_CHILDREN) {
      expect(screen.getByRole('link', { name: `عرض ملف ${child.name}` })).toHaveAttribute(
        'href',
        `/parent/children/${child.id}`,
      );
    }
  });

  it('shows no percentages or risk scores', () => {
    renderDashboard();

    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });
});
