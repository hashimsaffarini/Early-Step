import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { getAreaPaths } from '@/constants/routes';

import { CreateReportPage } from './CreateReportPage';
import { renderReportsPage } from './reportsTestUtils';

function renderCreate() {
  const path = getAreaPaths('Specialist').reportCreate;
  return renderReportsPage('Specialist', <CreateReportPage />, { routePath: path, path });
}

describe('CreateReportPage', () => {
  it('shows the author and manual form only (no AI mode, no probability)', () => {
    renderCreate();

    expect(screen.getByText('بقلم: أ. ليلى حسن')).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(6);
    expect(screen.queryByText(/ذكاء|AI|احتمالية/)).not.toBeInTheDocument();
    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
  });

  it('shows Arabic validation errors when submitted empty', async () => {
    renderCreate();

    await userEvent.click(screen.getByRole('button', { name: 'حفظ التقرير' }));

    expect(await screen.findByText('الرجاء اختيار الطفل')).toBeInTheDocument();
    expect(screen.getByText('الرجاء اختيار نوع التقرير')).toBeInTheDocument();
    expect(screen.getByText('الرجاء كتابة نقاط القوة')).toBeInTheDocument();
    expect(screen.getByText('الرجاء كتابة التوصيات')).toBeInTheDocument();
  });

  it('saves locally and shows an honest success state', async () => {
    renderCreate();

    await userEvent.click(screen.getByRole('radio', { name: 'نور' }));
    await userEvent.selectOptions(screen.getByLabelText(/نوع التقرير/), 'follow-up');
    await userEvent.type(screen.getByLabelText(/نقاط القوة/), 'تتعاون');
    await userEvent.type(screen.getByLabelText(/جوانب تحتاج إلى دعم/), 'التركيز');
    await userEvent.type(screen.getByLabelText(/التوصيات/), 'أنشطة قصيرة');
    await userEvent.click(screen.getByRole('button', { name: 'حفظ التقرير' }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'تم حفظ التقرير!' })).toBeInTheDocument();
    });
    expect(screen.getByText(/محلياً للعرض فقط/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'عرض جميع التقارير' })).toHaveAttribute(
      'href',
      getAreaPaths('Specialist').reports,
    );

    await userEvent.click(screen.getByRole('button', { name: 'كتابة تقرير آخر' }));
    expect(screen.getByRole('button', { name: 'حفظ التقرير' })).toBeInTheDocument();
  });
});
