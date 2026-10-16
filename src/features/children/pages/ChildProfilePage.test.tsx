import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { routes } from '@/app/router/routes';
import { getAreaPaths, type AreaRole } from '@/constants/routes';
import { findMockChild } from '@/mocks/fixtures/children';
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
const tab = (name: RegExp) => screen.getByRole('tab', { name });

/** The options listed after a result label ("إجابة الطفل:"), in order. */
function optionsAfter(container: HTMLElement, label: string): string[] {
  const line = within(container).getByText(`${label}:`).parentElement;
  if (!line) throw new Error(`no line for ${label}`);
  return within(line)
    .getAllByRole('listitem')
    .map((item) => item.textContent);
}

/** The value shown for a summary figure (`<dt>` label → `<dd>` value). */
function figure(container: HTMLElement, label: string): string | null {
  return within(container).getByText(label).nextElementSibling?.textContent ?? null;
}

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

describe('ChildProfilePage — tabs from the API', () => {
  it('shows the real activity summary and completion % in the plan section', async () => {
    renderProfile('Parent', YOUSEF);
    await heading('يوسف');

    const plan = screen.getByRole('region', { name: 'الخطة التدريبية' });
    const summary = await within(plan).findByRole('region', { name: 'ملخص الأنشطة' });
    expect(figure(summary, 'إجمالي الأنشطة')).toBe('2');
    expect(figure(summary, 'المنجزة')).toBe('1');
    expect(figure(summary, 'المتبقية')).toBe('1');
    // The parent's plan rows carry no answer counts or scores, so none are invented.
    expect(within(summary).queryByText('الإجابات الصحيحة')).not.toBeInTheDocument();
    expect(within(summary).queryByText('متوسط النتيجة')).not.toBeInTheDocument();
    expect(within(plan).getByRole('progressbar')).toHaveAttribute(
      'aria-valuetext',
      '1 من 2 أنشطة منجزة',
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
    // The live child-facing list has no answer counts (verified) — none are shown.
    expect(screen.queryByText(/إجابات صحيحة/)).not.toBeInTheDocument();
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

    await userEvent.click(tab(/الأنشطة/));

    const games = await screen.findByRole('region', { name: 'الألعاب المُعيَّنة' });
    expect(within(games).getByText('لعبة الذاكرة')).toBeInTheDocument();
    expect(within(games).getByRole('link', { name: 'ابدأ: لعبة الذاكرة' })).toHaveAttribute(
      'href',
      getAreaPaths('Parent').planActivityPlay(YOUSEF, 'g-real'),
    );
  });

  it('shows an honest empty games state when the plan has no game (no demo games)', async () => {
    renderProfile('Parent', YOUSEF);
    await heading('يوسف');

    await userEvent.click(tab(/الأنشطة/));

    const games = await screen.findByRole('region', { name: 'الألعاب المُعيَّنة' });
    expect(within(games).getByText('لا توجد ألعاب مُعيَّنة بعد')).toBeInTheDocument();
    expect(
      within(games).getByText('تظهر الألعاب هنا عندما يضيف الأخصائي لعبة إلى الخطة التدريبية.'),
    ).toBeInTheDocument();
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

  it('shows the child report (one per child) with a link to the report detail', async () => {
    renderProfile('Parent', YOUSEF);
    await heading('يوسف');

    await userEvent.click(tab(/^التقرير/));

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
    await userEvent.click(tab(/^التقرير/));
    expect(await screen.findByText('لا يوجد تقرير بعد')).toBeInTheDocument();
  });

  it('offers the parent to start the assessment and never reads the saved result', async () => {
    let resultCalls = 0;
    server.events.on('request:start', ({ request }) => {
      if (request.url.includes('/result')) resultCalls += 1;
    });
    renderProfile('Parent', YOUSEF);
    await heading('يوسف');

    await userEvent.click(tab(/التقييمات/));

    expect(await screen.findByText(/ويراجع الأخصائي النتيجة/)).toBeInTheDocument();
    expect(resultCalls).toBe(0);
    server.events.removeAllListeners();
    expect(screen.getAllByRole('link', { name: 'بدء التقييم المبدئي لـ يوسف' })[0]).toHaveAttribute(
      'href',
      getAreaPaths('Parent').assessment(YOUSEF),
    );
  });

  it('shows the saved assessment result from GET initial-assessment/{childId}/result', async () => {
    server.use(
      http.get(apiUrl('initial-assessment/:childId/result'), () =>
        HttpResponse.json({
          childId: YOUSEF,
          overallScore: 80,
          categories: [{ categoryName: 'القراءة', percentage: 60 }],
        }),
      ),
    );
    renderProfile('Specialist', YOUSEF);
    await heading('يوسف');

    await userEvent.click(tab(/التقييمات/));

    const region = await screen.findByRole('region', { name: 'نتيجة التقييم المبدئي' });
    expect(
      within(region).getByRole('progressbar', { name: 'النتيجة العامة للتقييم المبدئي' }),
    ).toHaveAttribute('aria-valuenow', '80');
    expect(within(region).getByRole('progressbar', { name: 'القراءة' })).toHaveAttribute(
      'aria-valuenow',
      '60',
    );
    expect(within(region).getByText(/وليست تشخيصاً/)).toBeInTheDocument();
  });

  it('shows the per-question details the server sends to staff (live shape 2026-10-14)', async () => {
    const option = (optionId: string, optionText: string) => ({
      optionId,
      optionText,
      optionImageUrl: null,
    });
    server.use(
      http.get(apiUrl('initial-assessment/:childId/result'), () =>
        HttpResponse.json({
          childId: YOUSEF,
          childName: 'يوسف',
          parentId: 'u-parent',
          parentName: 'محمد أحمد',
          overallScore: 66.67,
          assessmentId: 'as-1',
          categories: [
            {
              categoryId: 'cat-1',
              categoryName: 'الرياضيات',
              percentage: 67,
              totalQuestions: 3,
              correctAnswers: 2,
              questions: [
                {
                  questionId: 'q1',
                  questionText: 'اختر الأعداد الزوجية',
                  questionType: 'MultiSelect',
                  isCorrect: true,
                  childAnswers: [option('o2', '4'), option('o1', '2')],
                  correctAnswers: [option('o1', '2'), option('o2', '4')],
                },
                {
                  questionId: 'q2',
                  questionText: 'رتّب الأعداد',
                  questionType: 'Sequence',
                  isCorrect: false,
                  childAnswers: [option('o4', '3'), option('o3', '1')],
                  correctAnswers: [option('o3', '1'), option('o4', '3')],
                },
              ],
            },
          ],
        }),
      ),
    );
    renderProfile('Specialist', YOUSEF);
    await heading('يوسف');

    await userEvent.click(tab(/التقييمات/));

    const region = await screen.findByRole('region', { name: 'نتيجة التقييم المبدئي' });
    expect(within(region).getByText('2 من 3 إجابات صحيحة')).toBeInTheDocument();
    await userEvent.click(within(region).getByText('تفاصيل الأسئلة (2)'));
    const questions = within(region).getByRole('list', { name: 'أسئلة الرياضيات' });
    expect(within(questions).getByText('إجابة صحيحة')).toBeInTheDocument();
    expect(within(questions).getByText('إجابة غير صحيحة')).toBeInTheDocument();
    const sequence = within(questions).getByText('رتّب الأعداد').closest('li');
    if (!sequence) throw new Error('sequence question not found');
    expect(optionsAfter(sequence, 'إجابة الطفل')).toEqual(['3', '1']);
    expect(optionsAfter(sequence, 'الإجابة الصحيحة')).toEqual(['1', '3']);
  });

  it("gives the specialist a read-only tab with the teacher's notes", async () => {
    server.use(
      http.get(apiUrl('Teacher/children/:childId/feedbacks'), () =>
        HttpResponse.json([{ id: 'n-1', content: 'يتحسّن في الحروف', createdAt: '2026-10-02' }]),
      ),
    );
    renderProfile('Specialist', YOUSEF);
    await heading('يوسف');

    await userEvent.click(tab(/ملاحظات المعلم/));

    const list = await screen.findByRole('list', { name: 'ملاحظات المعلم' });
    expect(within(list).getByText('يتحسّن في الحروف')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'تعديل الملاحظة' })).not.toBeInTheDocument();
  });

  it('shows the teacher-notes tab to the specialist only', async () => {
    renderProfile('Parent', YOUSEF);
    await heading('يوسف');

    expect(screen.queryByRole('tab', { name: /ملاحظات المعلم/ })).not.toBeInTheDocument();
  });

  it('does not offer to start an assessment to staff', async () => {
    renderProfile('Specialist', YOUSEF);
    await heading('يوسف');

    await userEvent.click(tab(/التقييمات/));

    expect(screen.queryByRole('link', { name: /بدء التقييم/ })).not.toBeInTheDocument();
  });

  it('never calls the staff-only result endpoint as Teacher', async () => {
    let resultCalls = 0;
    server.events.on('request:start', ({ request }) => {
      if (request.url.includes('initial-assessment')) resultCalls += 1;
    });
    renderProfile('Teacher', YOUSEF);
    await heading('يوسف');

    // The teacher page has no assessment section at all.
    expect(await screen.findByRole('region', { name: 'ملاحظات المعلم' })).toBeInTheDocument();
    expect(screen.queryByText('التقييم المبدئي')).not.toBeInTheDocument();
    expect(resultCalls).toBe(0);
    server.events.removeAllListeners();
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

  it('does not offer to delete a child with saved activity results (product rule)', async () => {
    renderProfile('Parent', YOUSEF);
    await heading('يوسف');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'حذف الملف' })).toBeDisabled();
    });
    expect(screen.getByText(/لا يمكن حذف ملف طفل لديه نتائج أنشطة محفوظة/)).toBeInTheDocument();
  });

  it('keeps the child when deletion is cancelled', async () => {
    renderProfile('Parent', REEM);
    await heading('ريم');

    await userEvent.click(screen.getByRole('button', { name: 'حذف الملف' }));
    const confirm = screen.getByRole('dialog', { name: 'حذف ملف الطفل' });
    await userEvent.click(within(confirm).getByRole('button', { name: 'إلغاء' }));

    expect(findMockChild(REEM)).toBeDefined();
    expect(screen.getByRole('heading', { level: 1, name: 'ريم' })).toBeInTheDocument();
  });

  it('deletes a child without results after confirmation and returns to the list', async () => {
    const { router } = renderProfile('Parent', REEM);
    await heading('ريم');

    await userEvent.click(screen.getByRole('button', { name: 'حذف الملف' }));
    const confirm = screen.getByRole('dialog', { name: 'حذف ملف الطفل' });
    await userEvent.click(within(confirm).getByRole('button', { name: 'حذف' }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(getAreaPaths('Parent').children);
    });
    expect(findMockChild(REEM)).toBeUndefined();
    expect(await screen.findByRole('heading', { name: 'يوسف' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'ريم' })).not.toBeInTheDocument();
  });

  it('gives staff no edit or delete actions', async () => {
    renderProfile('Specialist', YOUSEF);
    await heading('يوسف');

    expect(screen.queryByRole('button', { name: 'تعديل البيانات' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'حذف الملف' })).not.toBeInTheDocument();
  });
});
