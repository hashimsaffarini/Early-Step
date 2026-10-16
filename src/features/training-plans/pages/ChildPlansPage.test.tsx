import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { getAreaPaths, ROLE_NAMESPACES, type AreaRole } from '@/constants/routes';
import { RoleAreaContext } from '@/hooks/useRoleArea';
import { apiUrl } from '@/mocks/http';
import { server } from '@/mocks/server';
import { renderWithRouter } from '@/test/renderWithRouter';
import { signInAs } from '@/test/session';

import { ChildPlansPage } from './ChildPlansPage';

const YOUSEF = 'c0000000-0000-4000-8000-000000000001';
const NOUR = 'c0000000-0000-4000-8000-000000000002';
const SALMA = 'c0000000-0000-4000-8000-000000000005';

function renderPlans(role: AreaRole, childId: string) {
  signInAs(role);
  return renderWithRouter(
    [
      {
        path: `${ROLE_NAMESPACES[role]}/children/:childId/plans`,
        element: (
          <RoleAreaContext value={role}>
            <ChildPlansPage />
          </RoleAreaContext>
        ),
      },
      { path: '*', element: <p>صفحة أخرى</p> },
    ],
    getAreaPaths(role).childPlans(childId),
  );
}

/** The options listed after a result label ("إجابة الطفل:"), in order. */
function optionsAfter(container: HTMLElement, label: string): string[] {
  const line = within(container).getByText(`${label}:`).parentElement;
  if (!line) throw new Error(`no line for ${label}`);
  return within(line)
    .getAllByRole('listitem')
    .map((item) => item.textContent);
}

describe('ChildPlansPage — read-only roles', () => {
  it('shows the parent the plan activities, their status and real progress', async () => {
    renderPlans('Parent', YOUSEF);

    const list = await screen.findByRole('list', { name: 'أنشطة الخطة التدريبية' });
    expect(screen.getByRole('heading', { level: 1, name: 'الخطة التدريبية' })).toBeInTheDocument();
    expect(screen.getByText('للطفل: يوسف')).toBeInTheDocument();
    expect(list.querySelectorAll(':scope > li')).toHaveLength(2);
    expect(within(list).getByText('مكتمل')).toBeInTheDocument();
    expect(within(list).getByText('لم يكتمل بعد')).toBeInTheDocument();
    // The live child-facing list has no answer counts (verified) — none are shown.
    expect(within(list).queryByText(/إجابات صحيحة/)).not.toBeInTheDocument();
    // Activity summary + completion %, derived from the real plan rows (1 of 2 → 50 %).
    const summary = screen.getByRole('region', { name: 'ملخص الأنشطة' });
    expect(within(summary).getByText('إجمالي الأنشطة').nextElementSibling).toHaveTextContent('2');
    expect(within(summary).getByText('المنجزة').nextElementSibling).toHaveTextContent('1');
    expect(within(summary).getByText('المتبقية').nextElementSibling).toHaveTextContent('1');
    expect(within(summary).queryByText('متوسط النتيجة')).not.toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '1 من 2 أنشطة منجزة');
    expect(screen.queryByRole('button', { name: 'إضافة نشاط' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /إزالة/ })).not.toBeInTheDocument();
  });

  it('shows an empty state when the plan has no activities', async () => {
    renderPlans('Teacher', NOUR);

    expect(await screen.findByText('لا توجد أنشطة في الخطة بعد')).toBeInTheDocument();
  });

  it('shows not-found for a child the role cannot see', async () => {
    renderPlans('Parent', SALMA);

    expect(await screen.findByText('لم يتم العثور على الطفل')).toBeInTheDocument();
  });

  it('shows an error with retry when the plan cannot be loaded', async () => {
    server.use(
      http.get(apiUrl('TrainingPlan/children/:childId/activities'), () =>
        HttpResponse.json({ message: 'خطأ' }, { status: 500 }),
      ),
    );
    renderPlans('Parent', YOUSEF);

    expect(await screen.findByText('تعذّر تحميل الخطة التدريبية')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'إعادة المحاولة' })).toBeInTheDocument();
  });

  it('tells the admin that plans are not available for this role (backend gap)', () => {
    renderPlans('Admin', YOUSEF);

    expect(screen.getByText('الخطط التدريبية غير متاحة لحساب المدير بعد')).toBeInTheDocument();
  });
});

describe('ChildPlansPage — specialist', () => {
  it('explains when the child has no plan yet', async () => {
    renderPlans('Specialist', NOUR);

    expect(await screen.findByText(/لا توجد خطة تدريبية لهذا الطفل بعد/)).toBeInTheDocument();
  });

  it('adds an available activity with POST { activityId } and refreshes the plan', async () => {
    let body: unknown;
    server.events.on('request:start', ({ request }) => {
      if (request.method === 'POST' && request.url.endsWith(`/children/${YOUSEF}/activities`)) {
        void request
          .clone()
          .json()
          .then((json: unknown) => {
            body = json;
          });
      }
    });
    renderPlans('Specialist', YOUSEF);
    await screen.findByRole('list', { name: 'أنشطة الخطة التدريبية' });

    await userEvent.click(screen.getByRole('button', { name: 'إضافة نشاط' }));
    const dialog = await screen.findByRole('dialog', { name: 'إضافة نشاط إلى الخطة' });
    expect(await within(dialog).findAllByText('مُضاف إلى الخطة')).toHaveLength(2);
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'إضافة «اختبار الذاكرة القصيرة» إلى الخطة' }),
    );

    expect(
      await within(dialog).findByText('تمت إضافة «اختبار الذاكرة القصيرة» إلى الخطة.'),
    ).toBeInTheDocument();
    expect(body).toEqual({ activityId: 'a0000000-0000-4000-8000-000000000003' });
    const list = screen.getByRole('list', { name: 'أنشطة الخطة التدريبية' });
    await waitFor(() => {
      // Direct items only (each completed activity also lists its result figures).
      expect(list.querySelectorAll(':scope > li')).toHaveLength(3);
    });
    server.events.removeAllListeners();
  });

  it('lists games in the second tab', async () => {
    renderPlans('Specialist', YOUSEF);
    await screen.findByRole('list', { name: 'أنشطة الخطة التدريبية' });

    await userEvent.click(screen.getByRole('button', { name: 'إضافة نشاط' }));
    const dialog = await screen.findByRole('dialog', { name: 'إضافة نشاط إلى الخطة' });
    await userEvent.click(within(dialog).getByRole('tab', { name: /ألعاب/ }));

    expect(await within(dialog).findByText('مطابقة البطاقات')).toBeInTheDocument();
    expect(within(dialog).queryByText('اختبار الحروف')).not.toBeInTheDocument();
  });

  it('removes an activity only after confirmation (DELETE by catalogue activity id)', async () => {
    const deleted: string[] = [];
    server.events.on('request:start', ({ request }) => {
      if (request.method === 'DELETE') deleted.push(new URL(request.url).pathname);
    });
    renderPlans('Specialist', YOUSEF);
    await screen.findByRole('list', { name: 'أنشطة الخطة التدريبية' });

    await userEvent.click(screen.getByRole('button', { name: 'إزالة «اختبار الأعداد» من الخطة' }));
    let dialog = screen.getByRole('dialog', { name: 'إزالة النشاط من الخطة' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'إلغاء' }));
    expect(deleted).toHaveLength(0);

    await userEvent.click(screen.getByRole('button', { name: 'إزالة «اختبار الأعداد» من الخطة' }));
    dialog = screen.getByRole('dialog', { name: 'إزالة النشاط من الخطة' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'إزالة' }));

    await waitFor(() => {
      expect(screen.queryByText('اختبار الأعداد')).not.toBeInTheDocument();
    });
    expect(deleted).toEqual([
      `/api/TrainingPlan/specialist/children/${YOUSEF}/activities/a0000000-0000-4000-8000-000000000002`,
    ]);
    server.events.removeAllListeners();
  });
});

describe('ChildPlansPage — results (specialist)', () => {
  it("shows the score, the plan's progress and, on demand, the child's answers", async () => {
    let resultCalls = 0;
    server.use(
      http.get(
        apiUrl('TrainingPlan/children/:childId/activities/:planActivityId/result'),
        ({ params }) => {
          resultCalls += 1;
          return HttpResponse.json({
            trainingPlanActivityId: params.planActivityId,
            activityId: 'a0000000-0000-4000-8000-000000000001',
            title: 'اختبار الحروف',
            score: 67,
            correctAnswers: 2,
            wrongAnswers: 1,
            isCompleted: true,
            completedAt: '2026-10-14T09:00:00Z',
            questions: [
              {
                questionId: 'q1',
                questionText: 'رتّب الحروف',
                type: 'Sequence',
                selectedOptions: [
                  { id: 'o2', optionText: 'ب' },
                  { id: 'o1', optionText: 'أ' },
                ],
                isCorrect: false,
              },
            ],
          });
        },
      ),
    );
    renderPlans('Specialist', YOUSEF);

    const list = await screen.findByRole('list', { name: 'أنشطة الخطة التدريبية' });
    const result = within(list).getByRole('list', { name: 'نتيجة «اختبار الحروف»' });
    expect(
      within(result)
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual(['النتيجة75%', 'الصحيحة3', 'الخاطئة1']);
    expect(screen.getByRole('progressbar', { name: 'نسبة إنجاز الخطة' })).toHaveAttribute(
      'aria-valuenow',
      '50',
    );
    // The specialist's rows carry the results: totals and the mean score of completed activities.
    const summary = screen.getByRole('region', { name: 'ملخص الأنشطة' });
    expect(within(summary).getByText('الإجابات الصحيحة').nextElementSibling).toHaveTextContent('3');
    expect(within(summary).getByText('الإجابات الخاطئة').nextElementSibling).toHaveTextContent('1');
    expect(within(summary).getByText('متوسط النتيجة').nextElementSibling).toHaveTextContent('75%');
    // Loaded only when opened, and only for completed activities.
    expect(within(list).getAllByText('عرض إجابات الطفل')).toHaveLength(1);
    expect(resultCalls).toBe(0);
    await userEvent.click(within(list).getByText('عرض إجابات الطفل'));

    const answers = await screen.findByRole('list', { name: 'إجابات «اختبار الحروف»' });
    expect(within(answers).getByText('إجابة غير صحيحة')).toBeInTheDocument();
    expect(within(answers).getByText('ترتيب')).toBeInTheDocument();
    expect(optionsAfter(answers, 'إجابة الطفل')).toEqual(['ب', 'أ']);
  });
});

describe('ChildPlansPage — first activity (live behaviour)', () => {
  async function addFirstActivity() {
    await userEvent.click(await screen.findByRole('button', { name: 'إضافة نشاط' }));
    const dialog = await screen.findByRole('dialog');
    const [add] = await within(dialog).findAllByRole('button', { name: /إضافة/ });
    if (!add) throw new Error('no add button');
    await userEvent.click(add);
    return dialog;
  }

  it('creates the plan with the first activity when the child has a teacher', async () => {
    renderPlans('Specialist', NOUR);

    const dialog = await addFirstActivity();

    expect(await within(dialog).findByText(/إلى الخطة\.$/)).toBeInTheDocument();
  });

  it("shows the server's message when the child has no teacher yet (live 400)", async () => {
    server.use(
      http.post(apiUrl('TrainingPlan/specialist/children/:childId/activities'), () =>
        HttpResponse.json(
          { message: 'يجب تعيين معلم للطفل قبل إنشاء الخطة التدريبية.' },
          { status: 400 },
        ),
      ),
    );
    renderPlans('Specialist', NOUR);

    const dialog = await addFirstActivity();

    expect(
      await within(dialog).findByText('يجب تعيين معلم للطفل قبل إنشاء الخطة التدريبية.'),
    ).toBeInTheDocument();
  });
});

describe('ChildPlansPage — teacher assignment (specialist)', () => {
  it('shows the current teacher from the plan and lists teachers from specialist/teachers', async () => {
    renderPlans('Specialist', YOUSEF);

    expect(await screen.findByText('المعلم الحالي: أ. سارة خالد')).toBeInTheDocument();
    const select = await screen.findByLabelText('اختر المعلم');
    await waitFor(() => {
      expect(within(select).getByRole('option', { name: 'أ. سارة خالد' })).toBeInTheDocument();
    });
  });

  it('assigns the chosen teacher with POST { teacherId, childIds } after confirmation', async () => {
    let body: unknown;
    server.use(
      http.post(apiUrl('specialist/assign-teacher'), async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ message: 'ok' });
      }),
    );
    renderPlans('Specialist', YOUSEF);

    const select = await screen.findByLabelText('اختر المعلم');
    await waitFor(() => {
      expect(within(select).getByRole('option', { name: 'أ. سارة خالد' })).toBeInTheDocument();
    });
    await userEvent.selectOptions(select, 'u-teacher');
    await userEvent.click(screen.getByRole('button', { name: 'تعيين المعلم' }));
    const dialog = screen.getByRole('dialog', { name: 'تعيين المعلم' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'تعيين' }));

    expect(await screen.findByText('تم تعيين أ. سارة خالد معلماً لـ يوسف.')).toBeInTheDocument();
    expect(body).toEqual({ teacherId: 'u-teacher', childIds: [YOUSEF] });
  });

  it('is not offered to read-only roles', async () => {
    renderPlans('Parent', YOUSEF);

    await screen.findByRole('list', { name: 'أنشطة الخطة التدريبية' });
    expect(screen.queryByLabelText('اختر المعلم')).not.toBeInTheDocument();
  });
});
