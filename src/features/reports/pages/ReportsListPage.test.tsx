import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { apiUrl } from '@/mocks/http';
import { server } from '@/mocks/server';

import { ReportsListPage } from './ReportsListPage';
import { renderReportsPage, REPORT_YOUSEF, installTestAuthHeader } from './reportsTestUtils';

installTestAuthHeader();

const list = () => screen.findByRole('list', { name: 'قائمة التقارير' });

describe('ReportsListPage', () => {
  it('lists the specialist reports (GET specialist/Reports) with a create link', async () => {
    renderReportsPage('Specialist', <ReportsListPage />);

    const cards = within(await list()).getAllByRole('article');
    expect(cards).toHaveLength(2);
    expect(screen.getByRole('link', { name: /تقرير جديد/ })).toHaveAttribute(
      'href',
      '/specialist/reports/new',
    );
    expect(
      screen.getByRole('link', { name: 'عرض التقرير الكامل: تقرير متابعة — يوسف' }),
    ).toHaveAttribute('href', `/specialist/reports/${REPORT_YOUSEF}`);
  });

  it("merges the parent's children reports (GET Reports/child/{id} per child)", async () => {
    const requested: string[] = [];
    server.events.on('request:start', ({ request }) => {
      requested.push(new URL(request.url).pathname);
    });
    renderReportsPage('Parent', <ReportsListPage />);

    const cards = within(await list()).getAllByRole('article');
    expect(cards).toHaveLength(2);
    expect(screen.getByRole('heading', { name: 'تقرير متابعة' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'تقرير التقييم المبدئي' })).toBeInTheDocument();
    expect(requested.filter((path) => path.startsWith('/api/Reports/child/'))).toHaveLength(3);
    expect(screen.queryByRole('link', { name: /تقرير جديد/ })).not.toBeInTheDocument();
    server.events.removeAllListeners();
  });

  it('shows only real fields — no strengths section and no report types', async () => {
    renderReportsPage('Parent', <ReportsListPage />);

    await list();
    expect(screen.getAllByText('جوانب تحتاج إلى دعم').length).toBeGreaterThan(0);
    expect(screen.queryByText('نقاط القوة')).not.toBeInTheDocument();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it('filters by search text and by child', async () => {
    renderReportsPage('Parent', <ReportsListPage />);
    await list();

    await userEvent.selectOptions(screen.getByLabelText('الطفل'), 'نور');
    expect(within(await list()).getAllByRole('article')).toHaveLength(1);

    await userEvent.selectOptions(screen.getByLabelText('الطفل'), 'كل الأطفال');
    await userEvent.type(screen.getByRole('searchbox', { name: 'البحث في التقارير' }), 'غير موجود');
    expect(screen.getByText('لا توجد نتائج')).toBeInTheDocument();
  });

  it('shows the empty state when there are no reports', async () => {
    server.use(http.get(apiUrl('specialist/Reports'), () => HttpResponse.json([])));
    renderReportsPage('Specialist', <ReportsListPage />);

    expect(await screen.findByText('لا توجد تقارير بعد')).toBeInTheDocument();
  });

  it('shows an error with retry when loading fails', async () => {
    server.use(
      http.get(apiUrl('specialist/Reports'), () => new HttpResponse(null, { status: 500 })),
    );
    renderReportsPage('Specialist', <ReportsListPage />);

    expect(await screen.findByText('تعذّر تحميل التقارير')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'إعادة المحاولة' })).toBeInTheDocument();
  });

  it('tells the admin that reports are not available (no endpoint)', () => {
    renderReportsPage('Admin', <ReportsListPage />);

    expect(screen.getByText('التقارير غير متاحة لهذا الدور بعد')).toBeInTheDocument();
  });
});
