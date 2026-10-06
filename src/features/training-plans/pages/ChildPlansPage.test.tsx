import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { routes } from '@/app/router/routes';
import { getAreaPaths, type AreaRole } from '@/constants/routes';
import { renderWithRouter } from '@/test/renderWithRouter';
import { signInForPath } from '@/test/session';

async function renderPlans(role: AreaRole, childId: string) {
  signInForPath(getAreaPaths(role).root);
  const result = renderWithRouter(routes, getAreaPaths(role).childPlans(childId));
  await screen.findAllByRole('link', { name: /العودة إلى/ });
  return result;
}

describe('ChildPlansPage', () => {
  it('shows the child plan with goals, strategies and progress', async () => {
    await renderPlans('Parent', 'mock-child-1');

    expect(screen.getByRole('heading', { level: 1, name: 'الخطط التعليمية' })).toBeInTheDocument();
    expect(screen.getByText('للطفل: يوسف')).toBeInTheDocument();
    const plan = screen.getByRole('article', { name: 'خطة المهارات الأساسية' });
    expect(within(plan).getByText('نشط')).toBeInTheDocument();
    expect(within(plan).getByRole('region', { name: 'الأهداف' })).toBeInTheDocument();
    expect(within(plan).getByRole('region', { name: 'الاستراتيجيات' })).toBeInTheDocument();
    expect(within(plan).getByRole('progressbar')).toHaveAttribute('aria-valuetext', '3 من 8 أنشطة');
    expect(screen.getByRole('link', { name: 'العودة إلى ملف يوسف' })).toHaveAttribute(
      'href',
      '/parent/children/mock-child-1',
    );
  });

  it('is view-only for the parent', async () => {
    await renderPlans('Parent', 'mock-child-1');
    expect(screen.queryByRole('button', { name: /خطة جديدة/ })).not.toBeInTheDocument();
  });

  it('shows an empty state for a child without plans', async () => {
    await renderPlans('Teacher', 'mock-child-2');

    expect(screen.getByText('لا توجد خطط تعليمية بعد')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /خطة جديدة/ })).not.toBeInTheDocument();
  });

  it('shows not-found for a child outside the role roster', async () => {
    await renderPlans('Teacher', 'mock-child-7');

    expect(screen.getByText('لم يتم العثور على الطفل')).toBeInTheDocument();
  });

  it('lets a specialist validate and add a plan locally', async () => {
    await renderPlans('Specialist', 'mock-child-2');

    const [createButton] = screen.getAllByRole('button', { name: /خطة جديدة/ });
    if (!createButton) throw new Error('create button not found');
    await userEvent.click(createButton);
    const dialog = screen.getByRole('dialog', { name: 'خطة تعليمية جديدة' });

    await userEvent.click(within(dialog).getByRole('button', { name: 'حفظ الخطة' }));
    expect(within(dialog).getByText('عنوان الخطة مطلوب')).toBeInTheDocument();
    expect(within(dialog).getByText('أضف هدفاً واحداً على الأقل')).toBeInTheDocument();
    expect(within(dialog).getByText('أضف استراتيجية واحدة على الأقل')).toBeInTheDocument();

    await userEvent.type(within(dialog).getByLabelText(/عنوان الخطة/), 'خطة الاستماع');
    await userEvent.type(
      within(dialog).getByLabelText(/الأهداف/),
      'تمييز الأصوات{enter}اتباع تعليمات قصيرة',
    );
    await userEvent.type(within(dialog).getByLabelText(/الاستراتيجيات/), 'ألعاب الاستماع');
    await userEvent.click(within(dialog).getByRole('button', { name: 'حفظ الخطة' }));

    await waitFor(() => {
      expect(dialog).not.toHaveAttribute('open');
    });
    const plan = screen.getByRole('article', { name: 'خطة الاستماع' });
    expect(within(plan).getByText('تمييز الأصوات')).toBeInTheDocument();
    expect(within(plan).getByText('اتباع تعليمات قصيرة')).toBeInTheDocument();
    expect(screen.getByText(/تمت إضافة الخطة «خطة الاستماع»/)).toBeInTheDocument();
  });

  it('shows completed plans with a text status', async () => {
    await renderPlans('Admin', 'mock-child-7');

    const completed = screen.getByRole('article', { name: 'خطة التهيئة' });
    expect(within(completed).getByText('مكتمل')).toBeInTheDocument();
  });
});
