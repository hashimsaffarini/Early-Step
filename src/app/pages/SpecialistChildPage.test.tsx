import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { routes } from '@/app/router/routes';
import { getAreaPaths } from '@/constants/routes';
import { apiUrl } from '@/mocks/http';
import { server } from '@/mocks/server';
import { renderWithRouter } from '@/test/renderWithRouter';
import { signInAs } from '@/test/session';

const YOUSEF = 'c0000000-0000-4000-8000-000000000001';
const NOUR = 'c0000000-0000-4000-8000-000000000002';

function renderPage(childId = YOUSEF) {
  signInAs('Specialist');
  return renderWithRouter(routes, getAreaPaths('Specialist').childProfile(childId));
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

describe('SpecialistChildPage — dashboard (client revision 2026-10)', () => {
  it('shows the child, the plan server progress and every real figure as stat cards', async () => {
    renderPage();
    await heading('يوسف');

    const facts = screen.getByRole('list', { name: 'بيانات الطفل' });
    expect(within(facts).getByText(/^ولي الأمر:/)).toBeInTheDocument();
    // The teacher comes from the specialist plan once it is loaded.
    expect(await within(facts).findByText('المعلم: أ. سارة خالد')).toBeInTheDocument();
    expect(
      await screen.findByRole('progressbar', { name: 'نسبة إنجاز الخطة التدريبية' }),
    ).toHaveAttribute('aria-valuenow', '50');
    const stats = screen.getByRole('list', { name: 'ملخص الخطة التدريبية' });
    expect(statValue(stats, 'إجمالي الأنشطة')).toBe('2');
    expect(statValue(stats, 'المكتملة')).toBe('1');
    expect(statValue(stats, 'المتبقية')).toBe('1');
    // The specialist rows carry the saved results (score 75, 3 correct, 1 wrong).
    expect(statValue(stats, 'متوسط النتيجة')).toBe('75%');
    expect(statValue(stats, 'الإجابات الصحيحة')).toBe('3');
    expect(statValue(stats, 'الإجابات الخاطئة')).toBe('1');
  });

  it('keeps the plan workflow on the page: results, add activity, no play links', async () => {
    renderPage();
    await heading('يوسف');

    const activities = await screen.findByRole('list', { name: 'أنشطة الخطة التدريبية' });
    expect(
      within(activities).getByRole('list', { name: 'نتيجة «اختبار الحروف»' }),
    ).toBeInTheDocument();
    expect(within(activities).getByText('عرض إجابات الطفل')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'إضافة نشاط' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^ابدأ:/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /بدء التقييم/ })).not.toBeInTheDocument();
  });

  it('hides progress and stats for a child without plan activities', async () => {
    renderPage(NOUR);
    await heading('نور');

    expect(
      await screen.findByText(/لا توجد خطة تدريبية لهذا الطفل بعد|أضف أنشطة مناسبة/),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('progressbar', { name: 'نسبة إنجاز الخطة التدريبية' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'ملخص الخطة التدريبية' })).not.toBeInTheDocument();
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
    renderPage();
    await heading('يوسف');

    const region = screen.getByRole('region', { name: 'التقييم المبدئي' });
    expect(
      await within(region).findByRole('progressbar', { name: 'النتيجة العامة للتقييم المبدئي' }),
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
    renderPage();
    await heading('يوسف');

    const region = screen.getByRole('region', { name: 'التقييم المبدئي' });
    expect(await within(region).findByText('2 من 3 إجابات صحيحة')).toBeInTheDocument();
    await userEvent.click(within(region).getByText('تفاصيل الأسئلة (2)'));
    const questions = within(region).getByRole('list', { name: 'أسئلة الرياضيات' });
    const sequence = within(questions).getByText('رتّب الأعداد').closest('li');
    if (!sequence) throw new Error('sequence question not found');
    expect(optionsAfter(sequence, 'إجابة الطفل')).toEqual(['3', '1']);
    expect(optionsAfter(sequence, 'الإجابة الصحيحة')).toEqual(['1', '3']);
  });

  it("shows the teacher's notes read-only", async () => {
    server.use(
      http.get(apiUrl('Teacher/children/:childId/feedbacks'), () =>
        HttpResponse.json([{ id: 'n-1', content: 'يتحسّن في الحروف', createdAt: '2026-10-02' }]),
      ),
    );
    renderPage();
    await heading('يوسف');

    const region = screen.getByRole('region', { name: 'ملاحظات المعلم' });
    expect(await within(region).findByText('يتحسّن في الحروف')).toBeInTheDocument();
    expect(within(region).queryByRole('button')).not.toBeInTheDocument();
  });

  it('has no reports on the page, in the dashboard links or in the sidebar', async () => {
    renderPage();
    await heading('يوسف');

    expect(screen.queryByText(/تقرير|التقارير/)).not.toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
  });

  it('opens the child page for the old plan link', async () => {
    signInAs('Specialist');
    const { router } = renderWithRouter(routes, getAreaPaths('Specialist').childPlans(YOUSEF));

    await heading('يوسف');
    expect(router.state.location.pathname).toBe(getAreaPaths('Specialist').childProfile(YOUSEF));
  });

  it('sends old report links back to the dashboard', async () => {
    signInAs('Specialist');
    const { router } = renderWithRouter(routes, getAreaPaths('Specialist').reports);

    await screen
      .findByRole('navigation', { name: 'القائمة الرئيسية' }, { timeout: 3000 })
      .catch(() => null);
    await vi.waitFor(() => {
      expect(router.state.location.pathname).toBe(getAreaPaths('Specialist').dashboard);
    });
  });
});
