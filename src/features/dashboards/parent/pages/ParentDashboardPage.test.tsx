import { screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { apiUrl } from '@/mocks/http';
import { server } from '@/mocks/server';
import { renderInRouter } from '@/test/renderWithRouter';
import { signInAs } from '@/test/session';

import { ParentDashboardPage } from './ParentDashboardPage';

beforeEach(() => {
  signInAs('Parent');
});

function renderDashboard() {
  return renderInRouter(<ParentDashboardPage parentName="محمد أحمد" />);
}

describe('ParentDashboardPage', () => {
  it('renders the welcome banner as the page heading', () => {
    renderDashboard();

    expect(screen.getByRole('heading', { level: 1, name: /محمد أحمد/ })).toBeInTheDocument();
  });

  it('shows counts from the API (children, plan activities, reports)', async () => {
    renderDashboard();
    const summary = await screen.findByRole('region', { name: 'ملخص' });

    const value = (label: string) => within(summary).getByText(label).nextElementSibling;
    expect(value('عدد الأطفال')).toHaveTextContent('3');
    await waitFor(() => {
      expect(value('أطفال لديهم تقرير')).toHaveTextContent('2');
    });
    await waitFor(() => {
      expect(value('أنشطة الخطط التدريبية')).toHaveTextContent('2');
    });
    expect(within(summary).queryByText('التقييمات المكتملة')).not.toBeInTheDocument();
  });

  it('renders each child card as the profile link with real info, no button or progress', async () => {
    renderDashboard();
    const section = await screen.findByRole('region', { name: 'أطفالي' });

    for (const name of ['يوسف', 'نور', 'ريم']) {
      expect(within(section).getByRole('heading', { name })).toBeInTheDocument();
    }
    const card = within(section).getByRole('link', { name: 'ملف يوسف' });
    expect(card).toHaveAttribute('href', '/parent/children/c0000000-0000-4000-8000-000000000001');
    // Real counts from GET Parent/{childId} (mock plan: 2 tests, 0 games; 1 report).
    expect(await within(card).findByText('الاختبارات: 2')).toBeInTheDocument();
    expect(within(card).getByText('الألعاب: 0')).toBeInTheDocument();
    expect(within(card).getByText('التقارير: 1')).toBeInTheDocument();
    // Client revision 2026-10: no "عرض الملف" button and no progress on the card.
    expect(within(section).queryByText('عرض الملف')).not.toBeInTheDocument();
    expect(within(section).queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /عرض الكل/ })).toHaveAttribute(
      'href',
      '/parent/children',
    );
  });

  it('does not show an invented activity feed', async () => {
    renderDashboard();
    await screen.findByRole('region', { name: 'أطفالي' });

    expect(screen.queryByRole('region', { name: 'آخر النشاطات' })).not.toBeInTheDocument();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it('shows an add-child empty state when the parent has no children', async () => {
    server.use(http.get(apiUrl('Parent/GetMyChildren'), () => HttpResponse.json([])));
    renderDashboard();

    expect(await screen.findByText('لم تُضف أي طفل بعد')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'إضافة طفل' })).toHaveAttribute(
      'href',
      '/parent/children',
    );
  });

  it('shows an error state when the children request fails', async () => {
    server.use(
      http.get(apiUrl('Parent/GetMyChildren'), () => new HttpResponse(null, { status: 500 })),
    );
    renderDashboard();

    expect(await screen.findByText('تعذّر تحميل قائمة الأطفال')).toBeInTheDocument();
  });
});
