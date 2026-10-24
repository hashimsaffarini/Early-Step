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

describe('SpecialistChildPage — dashboard (client revisions 2026-10)', () => {
  it('shows the child, the plan server progress and every real figure as stat cards', async () => {
    renderPage();
    await heading('يوسف');

    const facts = screen.getByRole('list', { name: 'بيانات الطفل' });
    expect(within(facts).getByText(/^ولي الأمر:/)).toBeInTheDocument();
    expect(await within(facts).findByText('المعلم: أ. سارة خالد')).toBeInTheDocument();
    expect(
      await screen.findByRole('progressbar', { name: 'نسبة إنجاز الخطة التدريبية' }),
    ).toHaveAttribute('aria-valuenow', '50');
    const stats = screen.getByRole('list', { name: 'ملخص الخطة التدريبية' });
    expect(statValue(stats, 'إجمالي الأنشطة')).toBe('2');
    expect(statValue(stats, 'متوسط النتيجة')).toBe('75%');
    expect(statValue(stats, 'الإجابات الصحيحة')).toBe('3');
    expect(statValue(stats, 'الإجابات الخاطئة')).toBe('1');
  });

  it('keeps the plan workflow: compact teacher line, results, add activity, no play links', async () => {
    renderPage();
    await heading('يوسف');

    const activities = await screen.findByRole('list', { name: 'أنشطة الخطة التدريبية' });
    expect(within(activities).getByText('عرض إجابات الطفل')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'إضافة نشاط' })).toBeInTheDocument();
    expect(screen.getByText('المعلم المسؤول: أ. سارة خالد')).toBeInTheDocument();
    expect(screen.queryByLabelText('اختر المعلم')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^ابدأ:/ })).not.toBeInTheDocument();
  });

  it('hides the plan until the initial assessment is completed (real result endpoint)', async () => {
    renderPage(NOUR);
    await heading('نور');

    expect(await screen.findByText(PLAN_AFTER_ASSESSMENT)).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'أنشطة الخطة التدريبية' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'إضافة نشاط' })).not.toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'ملخص الخطة التدريبية' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /التقييم الأولي: لم يكتمل/ })).toBeInTheDocument();
  });

  it('shows the initial assessment as a compact card that opens its own page', async () => {
    const { router } = renderPage();
    await heading('يوسف');

    const card = await screen.findByRole('link', { name: /التقييم الأولي: مكتمل/ });
    expect(card).toHaveAttribute('href', paths.childAssessment(YOUSEF));
    expect(card).toHaveTextContent('النتيجة العامة: 50%');
    // The details are not embedded in the dashboard.
    expect(screen.queryByRole('list', { name: 'النتيجة حسب التصنيف' })).not.toBeInTheDocument();

    await userEvent.click(card);
    expect(
      await screen.findByRole('heading', { level: 1, name: 'التقييم الأولي' }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(paths.childAssessment(YOUSEF));
  });

  it('lists the teacher notes read-only and the child report with view / edit links', async () => {
    server.use(
      http.get(apiUrl('Teacher/children/:childId/feedbacks'), () =>
        HttpResponse.json([{ id: 'n-1', content: 'يتحسّن في الحروف', createdAt: '2026-10-02' }]),
      ),
    );
    renderPage();
    await heading('يوسف');

    const notes = screen.getByRole('region', { name: 'ملاحظات المعلم' });
    expect(await within(notes).findByText('يتحسّن في الحروف')).toBeInTheDocument();
    expect(within(notes).queryByRole('button')).not.toBeInTheDocument();
    const report = screen.getByRole('region', { name: 'التقرير' });
    expect(await within(report).findByRole('link', { name: 'عرض التقرير' })).toHaveAttribute(
      'href',
      paths.reportDetail('r0000000-0000-4000-8000-000000000001'),
    );
    expect(within(report).getByRole('link', { name: 'تعديل التقرير' })).toBeInTheDocument();
  });

  it('offers «إضافة تقرير» for a child without a report (the specialist writes it)', async () => {
    renderPage(SALMA);
    await heading('سلمى');

    const report = screen.getByRole('region', { name: 'التقرير' });
    expect(await within(report).findByText('لا يوجد تقرير لهذا الطفل بعد.')).toBeInTheDocument();
    expect(within(report).getByRole('link', { name: 'إضافة تقرير' })).toHaveAttribute(
      'href',
      `${paths.reportCreate}?childId=${SALMA}`,
    );
  });

  it('opens the old plan link on the child page', async () => {
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
