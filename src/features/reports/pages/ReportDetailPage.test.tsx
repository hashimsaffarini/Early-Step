import { screen, within } from '@testing-library/react';

import { AREA_SEGMENTS, getAreaPaths, ROLE_NAMESPACES } from '@/constants/routes';
import type { AreaRole } from '@/constants/routes';

import { ReportDetailPage } from './ReportDetailPage';
import { renderReportsPage } from './reportsTestUtils';

function renderDetail(role: AreaRole, reportId: string) {
  return renderReportsPage(role, <ReportDetailPage />, {
    routePath: `${ROLE_NAMESPACES[role]}/${AREA_SEGMENTS.reportDetail}`,
    path: getAreaPaths(role).reportDetail(reportId),
  });
}

describe('ReportDetailPage', () => {
  it('renders the report with its sections and numbered recommendations', () => {
    renderDetail('Parent', 'report-1');

    expect(screen.getByRole('heading', { level: 1, name: 'تقرير متابعة' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'نقاط القوة' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'جوانب تحتاج إلى دعم' })).toBeInTheDocument();
    const recommendations = screen.getByRole('region', { name: 'التوصيات' });
    expect(within(recommendations).getAllByRole('listitem')).toHaveLength(3);
    expect(within(recommendations).getByRole('list').tagName).toBe('OL');
  });

  it('shows the child and author, keeps PDF download disabled and has no risk figures', () => {
    renderDetail('Parent', 'report-1');

    const summary = screen.getByRole('region', { name: 'ملخص التقرير' });
    expect(within(summary).getByText('يوسف')).toBeInTheDocument();
    expect(within(summary).getByText('أ. ليلى حسن')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /تحميل PDF/ })).toBeDisabled();
    expect(screen.queryByText(/%|خطورة|احتمالية/)).not.toBeInTheDocument();
  });

  it('shows not-found for an unknown id', () => {
    renderDetail('Admin', 'report-99');

    expect(screen.getByText('لم يتم العثور على التقرير')).toBeInTheDocument();
  });

  it('shows not-found for a report outside the role’s children', () => {
    renderDetail('Parent', 'report-4');

    expect(screen.getByText('لم يتم العثور على التقرير')).toBeInTheDocument();
  });
});
