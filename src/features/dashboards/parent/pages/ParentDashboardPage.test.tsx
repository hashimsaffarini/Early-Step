import { screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { apiUrl } from '@/mocks/http';
import { server } from '@/mocks/server';
import { registerHttpAuthHooks } from '@/services/http/interceptors';
import { getAccessToken } from '@/services/session';
import { renderInRouter } from '@/test/renderWithRouter';
import { signInAs } from '@/test/session';

import { ParentDashboardPage } from './ParentDashboardPage';

beforeEach(() => {
  registerHttpAuthHooks({ getAccessToken, onUnauthorized: () => undefined });
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
      expect(value('التقارير')).toHaveTextContent('2');
    });
    await waitFor(() => {
      expect(value('أنشطة الخطط التدريبية')).toHaveTextContent('2');
    });
    expect(within(summary).queryByText('التقييمات المكتملة')).not.toBeInTheDocument();
  });

  it('renders a card per child from the API with profile links and plan progress', async () => {
    renderDashboard();
    const section = await screen.findByRole('region', { name: 'أطفالي' });

    for (const name of ['يوسف', 'نور', 'ريم']) {
      expect(within(section).getByRole('heading', { name })).toBeInTheDocument();
    }
    expect(screen.getByRole('link', { name: 'عرض ملف يوسف' })).toHaveAttribute(
      'href',
      '/parent/children/c0000000-0000-4000-8000-000000000001',
    );
    expect(await within(section).findByRole('progressbar')).toHaveAttribute(
      'aria-valuetext',
      '1 من 2 أنشطة',
    );
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
