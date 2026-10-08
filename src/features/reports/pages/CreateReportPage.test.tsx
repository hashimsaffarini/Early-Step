import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { getAreaPaths } from '@/constants/routes';
import { apiUrl } from '@/mocks/http';
import { server } from '@/mocks/server';

import { CreateReportPage } from './CreateReportPage';
import { EditReportPage } from './EditReportPage';
import { renderReportsPage, REPORT_YOUSEF } from './reportsTestUtils';

const SALMA = 'c0000000-0000-4000-8000-000000000005';

const paths = getAreaPaths('Specialist');

function renderCreate() {
  return renderReportsPage('Specialist', <CreateReportPage />, {
    routePath: paths.reportCreate,
    path: paths.reportCreate,
  });
}

async function fillReport() {
  await userEvent.click(await screen.findByRole('radio', { name: /سلمى/ }));
  await userEvent.type(screen.getByLabelText(/عنوان التقرير/), 'تقرير شهري');
  await userEvent.type(screen.getByLabelText(/جوانب تحتاج إلى دعم/), 'العدّ بعد 10');
  await userEvent.type(screen.getByLabelText(/التوصيات/), 'ألعاب عدّ قصيرة');
}

describe('CreateReportPage', () => {
  it('offers only assigned children without a report and validates required fields', async () => {
    renderCreate();

    // One report per child: يوسف and نور already have one → edit links instead of radios.
    expect(await screen.findAllByRole('radio')).toHaveLength(1);
    expect(await screen.findByRole('link', { name: 'تعديل تقرير يوسف' })).toHaveAttribute(
      'href',
      paths.reportEdit(REPORT_YOUSEF),
    );
    expect(screen.getByRole('link', { name: 'تعديل تقرير نور' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'حفظ التقرير' }));

    expect(screen.getByText('الرجاء اختيار الطفل')).toBeInTheDocument();
    expect(screen.getByText('الرجاء كتابة عنوان التقرير')).toBeInTheDocument();
    expect(screen.getByText('الرجاء كتابة الجوانب التي تحتاج إلى دعم')).toBeInTheDocument();
    expect(screen.getByText('الرجاء كتابة التوصيات')).toBeInTheDocument();
    expect(screen.queryByLabelText(/نقاط القوة/)).not.toBeInTheDocument();
  });

  it('creates the report with the Swagger JSON body', async () => {
    let body: unknown;
    server.events.on('request:start', ({ request }) => {
      if (request.url.endsWith('/specialist/CreateReport')) {
        void request
          .clone()
          .json()
          .then((json: unknown) => {
            body = json;
          });
      }
    });
    renderCreate();

    await fillReport();
    await userEvent.click(screen.getByRole('button', { name: 'حفظ التقرير' }));

    expect(await screen.findByRole('heading', { name: 'تم حفظ التقرير' })).toBeInTheDocument();
    expect(body).toEqual({
      childId: SALMA,
      title: 'تقرير شهري',
      weaknesses: 'العدّ بعد 10',
      recommendations: 'ألعاب عدّ قصيرة',
    });
    server.events.removeAllListeners();
  });

  it('shows the server error and keeps the form', async () => {
    server.use(
      http.post(apiUrl('specialist/CreateReport'), () =>
        HttpResponse.json({ message: 'لا يمكن إنشاء التقرير الآن.' }, { status: 400 }),
      ),
    );
    renderCreate();

    await fillReport();
    await userEvent.click(screen.getByRole('button', { name: 'حفظ التقرير' }));

    expect(await screen.findByText('لا يمكن إنشاء التقرير الآن.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'حفظ التقرير' })).toBeInTheDocument();
  });
});

describe('EditReportPage', () => {
  it('prefills the report and saves multipart Title / Weaknesses / Recommendations', async () => {
    let form: FormData | undefined;
    server.events.on('request:start', ({ request }) => {
      if (request.method === 'PUT') {
        void request
          .clone()
          .formData()
          .then((data) => {
            form = data;
          });
      }
    });
    renderReportsPage('Specialist', <EditReportPage />, {
      routePath: `${paths.root}/reports/:reportId/edit`,
      path: paths.reportEdit(REPORT_YOUSEF),
    });

    const title = await screen.findByLabelText(/عنوان التقرير/);
    expect(title).toHaveValue('تقرير متابعة');
    await userEvent.clear(title);
    await userEvent.type(title, 'تقرير متابعة محدّث');
    await userEvent.click(screen.getByRole('button', { name: 'حفظ التعديلات' }));

    expect(await screen.findByRole('heading', { name: 'تفاصيل التقرير' })).toBeInTheDocument();
    await waitFor(() => {
      expect(form?.get('Title')).toBe('تقرير متابعة محدّث');
    });
    expect(form?.get('Weaknesses')).toContain('تمييز الحروف');
    expect(form?.get('Recommendations')).toContain('قراءة قصة');
    server.events.removeAllListeners();
  });

  it('shows not-found for an unknown report', async () => {
    renderReportsPage('Specialist', <EditReportPage />, {
      routePath: `${paths.root}/reports/:reportId/edit`,
      path: paths.reportEdit('missing'),
    });

    expect(await screen.findByText('لم يتم العثور على التقرير')).toBeInTheDocument();
  });
});
