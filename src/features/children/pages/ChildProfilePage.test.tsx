import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { routes } from '@/app/router/routes';
import { getAreaPaths, type AreaRole } from '@/constants/routes';
import { apiUrl } from '@/mocks/http';
import { server } from '@/mocks/server';
import { renderWithRouter } from '@/test/renderWithRouter';
import { signInAs } from '@/test/session';

const YOUSEF = 'c0000000-0000-4000-8000-000000000001';
const REEM = 'c0000000-0000-4000-8000-000000000003';
const SALMA = 'c0000000-0000-4000-8000-000000000005'; // another parent's child

function renderProfile(role: AreaRole, childId: string) {
  signInAs(role);
  return renderWithRouter(routes, getAreaPaths(role).childProfile(childId));
}

const heading = (name: string) => screen.findByRole('heading', { level: 1, name });

/** The value of a stat card (label paragraph → value paragraph). */
function statValue(container: HTMLElement, label: string): string | null {
  return within(container).getByText(label).nextElementSibling?.textContent ?? null;
}

describe('ChildProfilePage — resolving the child', () => {
  it('loads the parent child from GET Parent/{id} with API fields only', async () => {
    renderProfile('Parent', YOUSEF);

    expect(await heading('يوسف')).toBeInTheDocument();
    const details = screen.getByRole('list', { name: 'بيانات الطفل' });
    expect(within(details).getByText(/العمر: 7 سنوات/)).toBeInTheDocument();
    expect(within(details).getByText('الجنس: ولد')).toBeInTheDocument();
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

  it('opens the teacher plan-focused page for an assigned child, and not-found outside it', async () => {
    const { unmount } = renderProfile('Teacher', YOUSEF);
    expect(await heading('يوسف')).toBeInTheDocument();
    // Client revision 2026-10: the teacher's child page holds the plan and the notes, no tabs.
    expect(await screen.findByRole('region', { name: 'ملاحظات المعلم' })).toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    unmount();

    renderProfile('Teacher', REEM);
    expect(await screen.findByText('لم يتم العثور على الطفل')).toBeInTheDocument();
  });

  it('explains that the admin has no child-profile endpoint', async () => {
    renderProfile('Admin', YOUSEF);

    expect(await screen.findByText('ملف الطفل غير متاح للمدير من الخادم')).toBeInTheDocument();
  });
});

describe('ChildProfilePage — parent dashboard (client revision 2026-10)', () => {
  it('shows the real plan progress in the header and the plan figures as stat cards', async () => {
    renderProfile('Parent', YOUSEF);
    await heading('يوسف');

    const progress = await screen.findByRole('progressbar', { name: 'نسبة إنجاز الخطة التدريبية' });
    expect(progress).toHaveAttribute('aria-valuenow', '50');
    expect(progress).toHaveAttribute('aria-valuetext', '1 من 2 أنشطة منجزة');
    const stats = screen.getByRole('list', { name: 'ملخص الخطة التدريبية' });
    expect(statValue(stats, 'إجمالي الأنشطة')).toBe('2');
    expect(statValue(stats, 'المكتملة')).toBe('1');
    expect(statValue(stats, 'المتبقية')).toBe('1');
    // The parent's plan rows carry no answer counts or scores, so none are shown (never a 0).
    expect(within(stats).queryByText('الإجابات الصحيحة')).not.toBeInTheDocument();
    expect(within(stats).queryByText('متوسط النتيجة')).not.toBeInTheDocument();
  });

  it('hides progress and stats when the child has no plan activities (no fake 0 %)', async () => {
    renderProfile('Parent', REEM);
    await heading('ريم');

    expect(await screen.findByText(/لا توجد أنشطة في الخطة بعد/)).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'ملخص الخطة التدريبية' })).not.toBeInTheDocument();
  });

  it('lists the plan activities with play links, status in words', async () => {
    renderProfile('Parent', YOUSEF);
    await heading('يوسف');

    const plan = screen.getByRole('region', { name: 'الخطة التدريبية' });
    const link = await within(plan).findByRole('link', { name: 'ابدأ: اختبار الأعداد' });
    expect(link).toHaveAttribute(
      'href',
      getAreaPaths('Parent').planActivityPlay(YOUSEF, 'a0000000-0000-4000-8000-000000000002'),
    );
    expect(within(plan).getByText('مكتمل')).toBeInTheDocument();
    expect(within(plan).getByText('لم يكتمل بعد')).toBeInTheDocument();
  });

  it('shows a real game from the plan with its play link (games come from the backend only)', async () => {
    server.use(
      http.get(apiUrl('TrainingPlan/children/:childId/activities'), ({ request }) =>
        HttpResponse.json(
          new URL(request.url).searchParams.get('type') === 'game'
            ? [
                {
                  planActivityId: 'pa-game',
                  activityId: 'g-real',
                  title: 'لعبة الذاكرة',
                  iconUrl: null,
                  type: 'ألعاب',
                  isCompleted: false,
                },
              ]
            : [],
        ),
      ),
    );
    renderProfile('Parent', YOUSEF);
    await heading('يوسف');

    const plan = screen.getByRole('region', { name: 'الخطة التدريبية' });
    expect(await within(plan).findByText('لعبة الذاكرة')).toBeInTheDocument();
    expect(within(plan).getByText('لعبة')).toBeInTheDocument();
    expect(within(plan).getByRole('link', { name: 'ابدأ: لعبة الذاكرة' })).toHaveAttribute(
      'href',
      getAreaPaths('Parent').planActivityPlay(YOUSEF, 'g-real'),
    );
  });

  it('offers the parent to start the assessment and never reads the saved result', async () => {
    let resultCalls = 0;
    server.events.on('request:start', ({ request }) => {
      if (request.url.includes('/result')) resultCalls += 1;
    });
    renderProfile('Parent', YOUSEF);
    await heading('يوسف');

    const assessment = screen.getByRole('region', { name: 'التقييم المبدئي' });
    expect(
      within(assessment).getByRole('link', { name: 'بدء التقييم المبدئي لـ يوسف' }),
    ).toHaveAttribute('href', getAreaPaths('Parent').assessment(YOUSEF));
    expect(resultCalls).toBe(0);
    server.events.removeAllListeners();
  });

  it('has no reports, no delete action and no tabs for the parent', async () => {
    let reportCalls = 0;
    server.events.on('request:start', ({ request }) => {
      if (request.url.includes('Reports')) reportCalls += 1;
    });
    renderProfile('Parent', YOUSEF);
    await heading('يوسف');
    await screen.findByRole('list', { name: 'ملخص الخطة التدريبية' });

    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.queryByText(/التقرير|التقارير/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /حذف/ })).not.toBeInTheDocument();
    expect(reportCalls).toBe(0);
    server.events.removeAllListeners();
  });

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
});
