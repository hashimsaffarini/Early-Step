import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { getAreaPaths, type AreaRole } from '@/constants/routes';
import { apiUrl } from '@/mocks/http';
import { server } from '@/mocks/server';

import { ReportDetailPage } from './ReportDetailPage';
import { renderReportsPage, REPORT_YOUSEF } from './reportsTestUtils';

function renderDetail(role: AreaRole, reportId: string) {
  const paths = getAreaPaths(role);
  return renderReportsPage(role, <ReportDetailPage />, {
    routePath: `${paths.root}/reports/:reportId/view`,
    path: `${paths.reportDetail(reportId)}/view`,
  });
}

describe('ReportDetailPage', () => {
  it('shows the real report fields with numbered recommendations (read-only for parents)', async () => {
    renderDetail('Parent', REPORT_YOUSEF);

    expect(
      await screen.findByRole('heading', { level: 1, name: 'تقرير متابعة' }),
    ).toBeInTheDocument();
    const areas = screen.getByRole('region', { name: 'جوانب تحتاج إلى دعم' });
    expect(within(areas).getAllByRole('listitem')).toHaveLength(2);
    const recommendations = screen.getByRole('region', { name: 'التوصيات' });
    expect(within(recommendations).getByRole('list').tagName).toBe('OL');
    expect(within(recommendations).getAllByRole('listitem')).toHaveLength(2);
    expect(screen.queryByText('نقاط القوة')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'تعديل' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'حذف' })).not.toBeInTheDocument();
  });

  it('downloads the server PDF as a file', async () => {
    const createObjectURL = vi.fn(() => 'blob:report');
    const revokeObjectURL = vi.fn();
    Object.assign(URL, { createObjectURL, revokeObjectURL });
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);
    let accept: string | null = null;
    server.events.on('request:start', ({ request }) => {
      if (request.url.endsWith('/download')) accept = request.headers.get('Accept');
    });
    renderDetail('Parent', REPORT_YOUSEF);

    await userEvent.click(await screen.findByRole('button', { name: 'تحميل PDF' }));

    await waitFor(() => {
      expect(click).toHaveBeenCalledOnce();
    });
    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:report');
    expect(accept).toBe('application/pdf');
    click.mockRestore();
    server.events.removeAllListeners();
  });

  it('shows an error when the PDF cannot be downloaded', async () => {
    server.use(
      http.get(apiUrl('Reports/:reportId/download'), () => new HttpResponse(null, { status: 500 })),
    );
    renderDetail('Parent', REPORT_YOUSEF);

    await userEvent.click(await screen.findByRole('button', { name: 'تحميل PDF' }));

    expect(await screen.findByText('تعذّر تحميل ملف التقرير. حاول مرة أخرى.')).toBeInTheDocument();
  });

  it('shows not-found for an unknown or hidden report', async () => {
    renderDetail('Parent', 'missing-report');

    expect(await screen.findByText('لم يتم العثور على التقرير')).toBeInTheDocument();
  });

  it('lets the specialist edit and delete (after confirmation)', async () => {
    const deleted: string[] = [];
    server.events.on('request:start', ({ request }) => {
      if (request.method === 'DELETE') deleted.push(new URL(request.url).pathname);
    });
    renderDetail('Specialist', REPORT_YOUSEF);

    expect(await screen.findByRole('link', { name: 'تعديل' })).toHaveAttribute(
      'href',
      `/specialist/reports/${REPORT_YOUSEF}/edit`,
    );
    await userEvent.click(screen.getByRole('button', { name: 'حذف' }));
    let dialog = screen.getByRole('dialog', { name: 'حذف التقرير' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'إلغاء' }));
    expect(deleted).toHaveLength(0);

    await userEvent.click(screen.getByRole('button', { name: 'حذف' }));
    dialog = screen.getByRole('dialog', { name: 'حذف التقرير' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'حذف' }));

    expect(await screen.findByRole('heading', { name: 'قائمة التقارير' })).toBeInTheDocument();
    expect(deleted).toEqual([`/api/specialist/${REPORT_YOUSEF}`]);
    server.events.removeAllListeners();
  });
});
