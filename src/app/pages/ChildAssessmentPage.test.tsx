import { screen, within } from '@testing-library/react';

import { routes } from '@/app/router/routes';
import { getAreaPaths } from '@/constants/routes';
import { renderWithRouter } from '@/test/renderWithRouter';
import { signInAs } from '@/test/session';

const YOUSEF = 'c0000000-0000-4000-8000-000000000001';
const REEM = 'c0000000-0000-4000-8000-000000000003';

describe('ChildAssessmentPage — Admin (client revision 2026-11)', () => {
  it('shows the full initial-assessment result to the Admin, named from the result', async () => {
    signInAs('Admin');
    renderWithRouter(routes, getAreaPaths('Admin').childAssessment(YOUSEF));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'التقييم الأولي' }),
    ).toBeInTheDocument();
    expect(await screen.findByText('يوسف · ولي الأمر: محمد أحمد')).toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', { name: 'النتيجة العامة للتقييم المبدئي' }),
    ).toHaveAttribute('aria-valuenow', '50');
    const categories = screen.getByRole('list', { name: 'النتيجة حسب التصنيف' });
    expect(within(categories).getAllByRole('progressbar').length).toBeGreaterThan(0);
    // Every question with the child's answer and the verdict.
    expect(screen.getAllByText(/إجابة صحيحة|إجابة غير صحيحة/).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'رجوع' })).toHaveAttribute('href', '/admin/users');
  });

  it('says when the child has not completed the assessment yet', async () => {
    signInAs('Admin');
    renderWithRouter(routes, getAreaPaths('Admin').childAssessment(REEM));

    expect(await screen.findByText('لم يكتمل التقييم الأولي بعد.')).toBeInTheDocument();
  });
});
