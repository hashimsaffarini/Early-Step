import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { routes } from '@/app/router/routes';
import { PLAN_AFTER_ASSESSMENT } from '@/components/shared/ChildDashboard';
import { getAreaPaths } from '@/constants/routes';
import { apiUrl } from '@/mocks/http';
import { server } from '@/mocks/server';
import { renderWithRouter } from '@/test/renderWithRouter';
import { signInAs } from '@/test/session';

const YOUSEF = 'c0000000-0000-4000-8000-000000000001'; // assessment completed (mock), plan
const NOUR = 'c0000000-0000-4000-8000-000000000002'; // plan, assessment NOT completed
const SALMA = 'c0000000-0000-4000-8000-000000000005'; // no report
const paths = getAreaPaths('Specialist');

function renderPage(childId = YOUSEF) {
  signInAs('Specialist');
  return renderWithRouter(routes, paths.childProfile(childId));
}

const heading = (name: string) => screen.findByRole('heading', { level: 1, name });

function statValue(container: HTMLElement, label: string): string | null {
  return within(container).getByText(label).nextElementSibling?.textContent ?? null;
}

/** The options listed after a result label ("إجابة الطفل:"), in order. */
function optionsAfter(container: HTMLElement, label: string): string[] {
  const line = within(container).getByText(`${label}:`).parentElement;
  if (!line) throw new Error(`no line for ${label}`);
  return within(line)
    .getAllByRole('listitem')
    .map((item) => item.textContent);
}

describe('Specialist child file — part 4', () => {
  const openPlan = async () =>
    userEvent.click(await screen.findByRole('tab', { name: 'الخطة التدريبية' }));

  it('opens the initial assessment tab with real category scores and editable report', async () => {
    renderPage();
    await heading('يوسف');
    expect(screen.getByRole('tab', { name: 'التقييم المبدئي' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    const table = await screen.findByRole('table', { name: 'النتيجة العامة: 50%' });
    expect(within(table).getByText('الحروف والقراءة')).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'ملخص الخطة التدريبية' })).not.toBeInTheDocument();
    expect(await screen.findByLabelText(/عنوان التقرير/)).toHaveValue('تقرير متابعة');
    expect(screen.getByRole('button', { name: 'حفظ التقرير' })).toBeDisabled();
  });

  it('keeps teacher assignment, results and plan actions in the training-plan tab', async () => {
    renderPage();
    await heading('يوسف');
    await openPlan();
    const table = await screen.findByRole('table', { name: 'أنشطة الخطة التدريبية' });
    expect(within(table).getByText('عرض إجابات الطفل')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'إضافة نشاط' })).toBeInTheDocument();
    expect(screen.getByText('المعلم المسؤول: أ. سارة خالد')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^ابدأ:/ })).not.toBeInTheDocument();
    const stats = screen.getByRole('list', { name: 'ملخص الخطة التدريبية' });
    expect(statValue(stats, 'إجمالي الأنشطة')).toBe('2');
    expect(statValue(stats, 'متوسط النتيجة')).toBe('75%');
  });

  it('gates the training plan until assessment completion', async () => {
    renderPage(NOUR);
    await heading('نور');
    await openPlan();
    expect(await screen.findByText(PLAN_AFTER_ASSESSMENT)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'إضافة نشاط' })).not.toBeInTheDocument();
  });

  it('opens the full assessment details from the initial tab', async () => {
    const { router } = renderPage();
    await heading('يوسف');
    await userEvent.click(await screen.findByRole('link', { name: 'عرض التقييم كاملاً' }));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'التقييم الأولي' }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(paths.childAssessment(YOUSEF));
  });

  it('shows the teacher feedback read-only inside the plan tab', async () => {
    server.use(
      http.get(apiUrl('Teacher/children/:childId/feedbacks'), () =>
        HttpResponse.json([{ id: 'n-1', content: 'يتحسّن في الحروف', createdAt: '2026-10-02' }]),
      ),
    );
    renderPage();
    await heading('يوسف');
    await openPlan();
    const notes = screen.getByRole('region', { name: 'ملاحظات المعلم' });
    expect(await within(notes).findByText('يتحسّن في الحروف')).toBeInTheDocument();
    expect(within(notes).queryByRole('button')).not.toBeInTheDocument();
  });

  it('saves edits to the existing report with the real report fields', async () => {
    let saved: FormData | null = null;
    server.use(
      http.put(apiUrl('specialist/:reportId'), async ({ request }) => {
        saved = await request.formData();
        return HttpResponse.json({ message: 'تم الحفظ' });
      }),
    );
    renderPage();
    await heading('يوسف');
    const title = await screen.findByLabelText(/عنوان التقرير/);
    await userEvent.clear(title);
    await userEvent.type(title, 'تقرير محدث');
    await userEvent.click(screen.getByRole('button', { name: 'حفظ التقرير' }));
    expect(await screen.findByText('تم حفظ التقرير بنجاح')).toBeInTheDocument();
    expect(saved).not.toBeNull();
    expect((saved as FormData | null)?.get('Title')).toBe('تقرير محدث');
  });

  it('creates a report for the selected child without leaving its file', async () => {
    let saved: unknown;
    server.use(
      http.post(apiUrl('specialist/CreateReport'), async ({ request }) => {
        saved = await request.json();
        return HttpResponse.json({});
      }),
    );
    renderPage(SALMA);
    await heading('سلمى');
    await userEvent.type(await screen.findByLabelText(/عنوان التقرير/), 'تقرير جديد');
    await userEvent.type(screen.getByLabelText(/جوانب تحتاج إلى دعم/), 'تمييز الحروف');
    await userEvent.type(screen.getByLabelText(/التوصيات/), 'قراءة قصة يومياً');
    await userEvent.click(screen.getByRole('button', { name: 'حفظ التقرير' }));
    expect(await screen.findByText('تم حفظ التقرير بنجاح')).toBeInTheDocument();
    expect(saved).toEqual({
      childId: SALMA,
      title: 'تقرير جديد',
      weaknesses: 'تمييز الحروف',
      recommendations: 'قراءة قصة يومياً',
    });
  });

  it('preserves the report draft when saving fails', async () => {
    server.use(
      http.put(apiUrl('specialist/:reportId'), () =>
        HttpResponse.json({ message: 'تعذّر الحفظ' }, { status: 400 }),
      ),
    );
    renderPage();
    await heading('يوسف');
    const title = await screen.findByLabelText(/عنوان التقرير/);
    await userEvent.clear(title);
    await userEvent.type(title, 'مسودة التقرير');
    await userEvent.click(screen.getByRole('button', { name: 'حفظ التقرير' }));
    expect(await screen.findByText('تعذّر الحفظ')).toBeInTheDocument();
    expect(title).toHaveValue('مسودة التقرير');
  });

  it('preserves an unsaved report when moving between the two tabs', async () => {
    renderPage();
    await heading('يوسف');
    const title = await screen.findByLabelText(/عنوان التقرير/);
    await userEvent.clear(title);
    await userEvent.type(title, 'مسودة لم تحفظ');
    await openPlan();
    await userEvent.click(screen.getByRole('tab', { name: 'التقييم المبدئي' }));
    expect(screen.getByLabelText(/عنوان التقرير/)).toHaveValue('مسودة لم تحفظ');
  });

  it('opens legacy plan links on the child file', async () => {
    signInAs('Specialist');
    const { router } = renderWithRouter(routes, paths.childPlans(YOUSEF));
    await heading('يوسف');
    expect(router.state.location.pathname).toBe(paths.childProfile(YOUSEF));
  });
});

describe('ChildAssessmentPage — the dedicated assessment page', () => {
  function renderDetails(childId = YOUSEF) {
    signInAs('Specialist');
    return renderWithRouter(routes, paths.childAssessment(childId));
  }

  it('shows the overall result, categories and every question with answers and verdicts', async () => {
    const option = (optionId: string, optionText: string) => ({
      optionId,
      optionText,
      optionImageUrl: null,
    });
    server.use(
      http.get(apiUrl('initial-assessment/:childId/result'), () =>
        HttpResponse.json({
          childId: YOUSEF,
          overallScore: 66.67,
          categories: [
            {
              categoryId: 'cat-1',
              categoryName: 'الرياضيات',
              percentage: 67,
              totalQuestions: 3,
              correctAnswers: 2,
              questions: [
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
    renderDetails();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'التقييم الأولي' }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('progressbar', { name: 'النتيجة العامة للتقييم المبدئي' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'الرياضيات' })).toHaveAttribute(
      'aria-valuenow',
      '67',
    );
    expect(screen.getByText('2 من 3 إجابات صحيحة')).toBeInTheDocument();
    // Questions are shown directly on this page (not hidden behind «تفاصيل الأسئلة»).
    const questions = screen.getByRole('list', { name: 'أسئلة الرياضيات' });
    const sequence = within(questions).getByText('رتّب الأعداد').closest('li');
    if (!sequence) throw new Error('question not found');
    expect(within(sequence).getByText('ترتيب')).toBeInTheDocument();
    expect(within(sequence).getByText('إجابة غير صحيحة')).toBeInTheDocument();
    expect(optionsAfter(sequence, 'إجابة الطفل')).toEqual(['3', '1']);
    expect(optionsAfter(sequence, 'الإجابة الصحيحة')).toEqual(['1', '3']);
    expect(screen.getByRole('link', { name: 'العودة إلى ملف الطفل' })).toHaveAttribute(
      'href',
      paths.childProfile(YOUSEF),
    );
  });

  it('explains when the assessment is not completed yet', async () => {
    renderDetails(NOUR);

    expect(await screen.findByText('لم يكتمل التقييم الأولي بعد.')).toBeInTheDocument();
  });

  it('shows an error with retry', async () => {
    let calls = 0;
    server.use(
      http.get(apiUrl('initial-assessment/:childId/result'), () => {
        calls += 1;
        return calls === 1
          ? HttpResponse.json({ message: 'خطأ' }, { status: 500 })
          : HttpResponse.json({ childId: YOUSEF, overallScore: 40, categories: [] });
      }),
    );
    renderDetails();

    expect(await screen.findByText('تعذّر تحميل نتيجة التقييم')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'إعادة المحاولة' }));
    expect(
      await screen.findByRole('progressbar', { name: 'النتيجة العامة للتقييم المبدئي' }),
    ).toHaveAttribute('aria-valuenow', '40');
  });
});
