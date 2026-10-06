import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { routes } from '@/app/router/routes';
import { getAreaPaths, type AreaRole } from '@/constants/routes';
import { findMockChild } from '@/mocks/fixtures/children';
import { apiUrl } from '@/mocks/http';
import { server } from '@/mocks/server';
import { registerHttpAuthHooks } from '@/services/http/interceptors';
import { getAccessToken } from '@/services/session';
import { renderWithRouter } from '@/test/renderWithRouter';
import { signInAs } from '@/test/session';

const YOUSEF = 'c0000000-0000-4000-8000-000000000001';
const REEM = 'c0000000-0000-4000-8000-000000000003';
const SALMA = 'c0000000-0000-4000-8000-000000000005'; // another parent's child

beforeEach(() => {
  registerHttpAuthHooks({ getAccessToken, onUnauthorized: () => undefined });
});

function renderProfile(role: AreaRole, childId: string) {
  signInAs(role);
  return renderWithRouter(routes, getAreaPaths(role).childProfile(childId));
}

const heading = (name: string) => screen.findByRole('heading', { level: 1, name });
const tab = (name: RegExp) => screen.getByRole('tab', { name });

describe('ChildProfilePage — resolving the child', () => {
  it('loads the parent child from GET Parent/{id} with API fields only', async () => {
    renderProfile('Parent', YOUSEF);

    expect(await heading('يوسف')).toBeInTheDocument();
    const details = screen.getByRole('list', { name: 'بيانات الطفل' });
    expect(within(details).getByText(/العمر: 7 سنوات/)).toBeInTheDocument();
    expect(within(details).getByText('ولد')).toBeInTheDocument();
    expect(screen.queryByText(/تاريخ الميلاد/)).not.toBeInTheDocument();
  });

  it.each([
    ['an unknown id (404)', 'c0000000-0000-4000-8000-000000000999'],
    ["another parent's child (403)", SALMA],
  ])('shows not-found for %s', async (_label, childId) => {
    renderProfile('Parent', childId);

    expect(await screen.findByText('لم يتم العثور على الطفل')).toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
  });

  it('shows an error state (not "not found") when the server fails', async () => {
    server.use(http.get(apiUrl('Parent/:childId'), () => new HttpResponse(null, { status: 500 })));
    renderProfile('Parent', YOUSEF);

    expect(await screen.findByText('تعذّر تحميل ملف الطفل')).toBeInTheDocument();
  });

  it('finds a teacher child in the teacher list, and not-found outside it', async () => {
    const { unmount } = renderProfile('Teacher', YOUSEF);
    expect(await heading('يوسف')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ملاحظات المعلم/ })).toHaveAttribute(
      'href',
      getAreaPaths('Teacher').childNotes(YOUSEF),
    );
    unmount();

    renderProfile('Teacher', REEM);
    expect(await screen.findByText('لم يتم العثور على الطفل')).toBeInTheDocument();
  });

  it('explains that the admin has no child-profile endpoint', async () => {
    renderProfile('Admin', YOUSEF);

    expect(await screen.findByText('ملف الطفل غير متاح للمدير من الخادم')).toBeInTheDocument();
  });
});

describe('ChildProfilePage — tabs from the API', () => {
  it('shows plan summary counts and plan progress on the overview', async () => {
    renderProfile('Parent', YOUSEF);
    await heading('يوسف');

    const summary = await screen.findByRole('region', { name: 'ملخص الأنشطة' });
    expect(await within(summary).findByText('أنشطة الخطة')).toBeInTheDocument();
    const plan = screen.getByRole('region', { name: 'الخطة التدريبية' });
    expect(await within(plan).findByRole('progressbar')).toHaveAttribute(
      'aria-valuetext',
      '1 من 2 أنشطة',
    );
  });

  it('lists plan activities with play links for the parent', async () => {
    renderProfile('Parent', YOUSEF);
    await heading('يوسف');

    await userEvent.click(tab(/الأنشطة/));

    const link = await screen.findByRole('link', { name: 'ابدأ: اختبار الأعداد' });
    expect(link).toHaveAttribute(
      'href',
      getAreaPaths('Parent').planActivityPlay(YOUSEF, 'a0000000-0000-4000-8000-000000000002'),
    );
    expect(screen.getByText('إجابات صحيحة: 3 · غير صحيحة: 1')).toBeInTheDocument();
  });

  it('gives the specialist a plan-management link instead of play links', async () => {
    renderProfile('Specialist', YOUSEF);
    await heading('يوسف');

    await userEvent.click(tab(/الأنشطة/));

    const manage = await screen.findAllByRole('link', { name: 'إدارة الخطة التدريبية' });
    for (const link of manage) {
      expect(link).toHaveAttribute('href', getAreaPaths('Specialist').childPlans(YOUSEF));
    }
    expect(screen.queryByRole('link', { name: /^ابدأ:/ })).not.toBeInTheDocument();
  });

  it('lists the child reports with links to the report detail', async () => {
    renderProfile('Parent', YOUSEF);
    await heading('يوسف');

    await userEvent.click(tab(/التقارير/));

    expect(await screen.findByRole('link', { name: 'عرض التقرير: تقرير متابعة' })).toHaveAttribute(
      'href',
      getAreaPaths('Parent').reportDetail('r0000000-0000-4000-8000-000000000001'),
    );
  });

  it('shows empty plan and report states for a child without data', async () => {
    renderProfile('Parent', REEM);
    await heading('ريم');

    await userEvent.click(tab(/الأنشطة/));
    expect(await screen.findByText('لا توجد أنشطة في الخطة التدريبية بعد')).toBeInTheDocument();
    await userEvent.click(tab(/التقارير/));
    expect(await screen.findByText('لا توجد تقارير بعد')).toBeInTheDocument();
  });

  it('is honest that assessment results are not available, with a start link for the parent', async () => {
    renderProfile('Parent', YOUSEF);
    await heading('يوسف');

    await userEvent.click(tab(/التقييمات/));

    expect(screen.getByText('سجل التقييمات غير متاح بعد')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'بدء التقييم المبدئي لـ يوسف' })[0]).toHaveAttribute(
      'href',
      getAreaPaths('Parent').assessment(YOUSEF),
    );
  });

  it('does not offer to start an assessment to staff', async () => {
    renderProfile('Teacher', YOUSEF);
    await heading('يوسف');

    await userEvent.click(tab(/التقييمات/));

    expect(screen.queryByRole('link', { name: /بدء التقييم/ })).not.toBeInTheDocument();
  });
});

describe('ChildProfilePage — parent edit and delete', () => {
  it('edits the child through PATCH and shows the new data', async () => {
    let received: FormData | undefined;
    server.use(
      http.patch(apiUrl('Parent/:childId'), async ({ request }) => {
        received = await request.clone().formData();
        return undefined;
      }),
    );
    renderProfile('Parent', YOUSEF);
    await heading('يوسف');

    await userEvent.click(screen.getByRole('button', { name: 'تعديل البيانات' }));
    const dialog = screen.getByRole('dialog', { name: 'تعديل بيانات الطفل' });
    const age = within(dialog).getByLabelText(/العمر/);
    expect(age).toHaveValue(7);
    await userEvent.clear(age);
    await userEvent.type(age, '8');
    await userEvent.click(within(dialog).getByRole('button', { name: 'حفظ' }));

    expect(await screen.findByText('تم حفظ بيانات الطفل.')).toBeInTheDocument();
    expect(received?.get('Age')).toBe('8');
    expect(received?.get('Gender')).toBe('ولد');
    await waitFor(() => {
      expect(screen.getByText(/العمر: 8 سنوات/)).toBeInTheDocument();
    });
  });

  it('keeps the child when deletion is cancelled', async () => {
    renderProfile('Parent', YOUSEF);
    await heading('يوسف');

    await userEvent.click(screen.getByRole('button', { name: 'حذف الملف' }));
    const confirm = screen.getByRole('dialog', { name: 'حذف ملف الطفل' });
    await userEvent.click(within(confirm).getByRole('button', { name: 'إلغاء' }));

    expect(findMockChild(YOUSEF)).toBeDefined();
    expect(screen.getByRole('heading', { level: 1, name: 'يوسف' })).toBeInTheDocument();
  });

  it('deletes the child after confirmation and returns to the list without it', async () => {
    const { router } = renderProfile('Parent', YOUSEF);
    await heading('يوسف');

    await userEvent.click(screen.getByRole('button', { name: 'حذف الملف' }));
    const confirm = screen.getByRole('dialog', { name: 'حذف ملف الطفل' });
    await userEvent.click(within(confirm).getByRole('button', { name: 'حذف' }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(getAreaPaths('Parent').children);
    });
    expect(findMockChild(YOUSEF)).toBeUndefined();
    expect(await screen.findByRole('heading', { name: 'نور' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'يوسف' })).not.toBeInTheDocument();
  });

  it('gives staff no edit or delete actions', async () => {
    renderProfile('Specialist', YOUSEF);
    await heading('يوسف');

    expect(screen.queryByRole('button', { name: 'تعديل البيانات' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'حذف الملف' })).not.toBeInTheDocument();
  });
});
