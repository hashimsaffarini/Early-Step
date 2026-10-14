import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { RoleAreaContext } from '@/hooks/useRoleArea';
import { apiUrl } from '@/mocks/http';
import { server } from '@/mocks/server';
import { renderWithRouter } from '@/test/renderWithRouter';
import { signInAs } from '@/test/session';

import { AssessmentPage } from './AssessmentPage';

const CHILD_ID = 'c0000000-0000-4000-8000-000000000001';
const LONG_FLOW = 15_000;

function renderAssessment(role: 'Parent' | 'Teacher' = 'Parent', childId = CHILD_ID) {
  return renderWithRouter(
    [
      {
        path: '/:area/assessment/:childId',
        element: (
          <RoleAreaContext value={role}>
            <AssessmentPage />
          </RoleAreaContext>
        ),
      },
      { path: '/:area/children/:childId', element: <h1>ملف الطفل</h1> },
    ],
    `/${role.toLowerCase()}/assessment/${childId}`,
  );
}

const start = async () => {
  await userEvent.click(await screen.findByRole('button', { name: 'ابدأ التقييم' }));
};

const tap = async (label: string) => {
  await userEvent.click(await screen.findByRole('button', { name: new RegExp(`^${label}`) }));
};
const next = () => userEvent.click(screen.getByRole('button', { name: /التالي|إنهاء التقييم/ }));

/** Answers the mock assessment: 3 single choices, a multi-select (4 then 2) and a sequence 1-3-5. */
async function answerAll() {
  for (const label of ['بطة', 'ق', '3']) {
    await tap(label);
    await next();
  }
  expect(
    await screen.findByText('اختر كل الإجابات الصحيحة، ثم اضغط «التالي».'),
  ).toBeInTheDocument();
  await tap('4');
  await tap('2');
  await next();
  expect(await screen.findByText('اضغط على الخيارات بالترتيب الصحيح.')).toBeInTheDocument();
  await tap('1');
  await tap('3');
  expect(screen.getByRole('button', { name: 'إنهاء التقييم' })).toBeDisabled();
  await tap('5');
  await next();
}

describe('AssessmentPage (initial assessment)', () => {
  beforeEach(() => {
    // The app wires these in AuthHttpBridge; page-level renders register them directly.
    signInAs('Parent');
  });

  it(
    'starts, sends each answer and completes with a neutral confirmation',
    async () => {
      const answers: unknown[] = [];
      let completed = false;
      server.use(
        http.post(apiUrl('initial-assessment/:id/answer'), async ({ request }) => {
          answers.push(await request.json());
          return HttpResponse.json({ message: 'تم حفظ الإجابة.' });
        }),
        http.post(apiUrl('initial-assessment/:id/complete'), () => {
          completed = true;
          return HttpResponse.json({ message: 'تم إنهاء التقييم.' });
        }),
      );
      renderAssessment();

      expect(await screen.findByRole('heading', { name: 'مرحباً يا يوسف!' })).toBeInTheDocument();
      await start();

      expect(await screen.findByRole('heading', { name: 'القراءة' })).toBeInTheDocument();
      await answerAll();

      expect(await screen.findByRole('heading', { name: 'تم إرسال التقييم' })).toBeInTheDocument();
      expect(answers).toEqual([
        { questionId: 'q-read-1', selectedOptionId: 'q-read-1-o1' },
        { questionId: 'q-read-2', selectedOptionId: 'q-read-2-o1' },
        { questionId: 'q-math-1', selectedOptionId: 'q-math-1-o2' },
        { questionId: 'q-math-2', selectedOptionIds: ['q-math-2-o3', 'q-math-2-o1'] },
        { questionId: 'q-math-3', orderedOptionIds: ['q-math-3-o2', 'q-math-3-o3', 'q-math-3-o1'] },
      ]);
      expect(completed).toBe(true);
      expect(screen.getByText(/تم إرسال 5 أسئلة/)).toBeInTheDocument();
      expect(screen.queryByText(/%|درجة|نتيجتك/)).not.toBeInTheDocument();
    },
    LONG_FLOW,
  );

  it(
    'shows the result returned by complete (live contract) without a diagnosis',
    async () => {
      renderAssessment();
      expect(await screen.findByRole('heading', { name: 'مرحباً يا يوسف!' })).toBeInTheDocument();
      await start();
      await answerAll();

      expect(await screen.findByRole('heading', { name: 'تم إرسال التقييم' })).toBeInTheDocument();
      // All five answers are right in the mock (exact set, exact order) → 100.
      expect(
        screen.getByRole('progressbar', { name: 'النتيجة العامة للتقييم المبدئي' }),
      ).toHaveAttribute('aria-valuenow', '100');
      expect(screen.getByRole('list', { name: 'النتيجة حسب التصنيف' })).toBeInTheDocument();
      expect(
        screen.getByText('هذه نتيجة مبدئية يراجعها الأخصائي، وليست تشخيصاً.'),
      ).toBeInTheDocument();
    },
    LONG_FLOW,
  );

  it('shows the backend message when no assessment is available', async () => {
    server.use(
      http.post(apiUrl('initial-assessment/:childId/start'), () =>
        HttpResponse.json({ message: 'الطفل غير موجود أو لا يوجد تقييم أولي متاح.' }),
      ),
    );
    renderAssessment();

    await start();

    expect(
      await screen.findByText('الطفل غير موجود أو لا يوجد تقييم أولي متاح.'),
    ).toBeInTheDocument();
  });

  it('shows an honest empty state when the server sends no questions', async () => {
    server.use(
      http.post(apiUrl('initial-assessment/:childId/start'), () =>
        HttpResponse.json({ assessmentId: 'as-1', questions: [] }),
      ),
    );
    renderAssessment();

    await start();

    expect(await screen.findByText('لا تتوفر أسئلة التقييم من الخادم حالياً')).toBeInTheDocument();
  });

  it(
    'sends the exact set for MultiSelect and the tapped order for Sequence (reset re-orders)',
    async () => {
      const bodies: unknown[] = [];
      server.use(
        http.post(apiUrl('initial-assessment/:childId/start'), () =>
          HttpResponse.json({
            assessmentId: 'as-1',
            questions: [
              {
                id: 'q1',
                questionText: 'اختر الحيوانات',
                type: 'MultiSelect',
                options: [
                  { id: 'o1', optionText: 'قطة' },
                  { id: 'o2', optionText: 'كرسي' },
                  { id: 'o5', optionText: 'أرنب' },
                ],
              },
              {
                id: 'q2',
                questionText: 'رتّب الصور',
                type: 'Sequence',
                options: [
                  { id: 'o3', optionText: 'أولاً' },
                  { id: 'o4', optionText: 'ثانياً' },
                ],
              },
            ],
          }),
        ),
        http.post(apiUrl('initial-assessment/:id/answer'), async ({ request }) => {
          const body = (await request.json()) as { questionId: string };
          bodies.push(body);
          return HttpResponse.json({ questionId: body.questionId, isCorrect: true });
        }),
        http.post(apiUrl('initial-assessment/:id/complete'), () =>
          HttpResponse.json({ overallScore: 100, categories: [] }),
        ),
      );
      renderAssessment();

      await start();

      await tap('قطة');
      await tap('كرسي');
      await tap('كرسي');
      await tap('أرنب');
      await next();
      await tap('أولاً');
      await userEvent.click(screen.getByRole('button', { name: 'إعادة الترتيب' }));
      await tap('ثانياً');
      await tap('أولاً');
      await next();

      expect(await screen.findByRole('heading', { name: 'تم إرسال التقييم' })).toBeInTheDocument();
      expect(bodies).toEqual([
        { questionId: 'q1', selectedOptionIds: ['o1', 'o5'] },
        { questionId: 'q2', orderedOptionIds: ['o4', 'o3'] },
      ]);
    },
    LONG_FLOW,
  );

  it(
    'lets the child skip a question without options and shows the server refusal to complete',
    async () => {
      server.use(
        http.post(apiUrl('initial-assessment/:childId/start'), () =>
          HttpResponse.json({
            assessmentId: 'as-1',
            questions: [
              { id: 'q1', questionText: 'سؤال بلا خيارات', type: 'SingleChoice', options: [] },
            ],
          }),
        ),
        http.post(apiUrl('initial-assessment/:id/complete'), () =>
          HttpResponse.json(
            { message: 'لا يمكن إنهاء التقييم. تأكد من الإجابة على جميع الأسئلة.' },
            { status: 400 },
          ),
        ),
      );
      renderAssessment();

      await start();

      expect(await screen.findByText(/لم يُرسل الخادم خيارات له/)).toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: 'تخطّي السؤال' }));

      expect(
        await screen.findByText('لا يمكن إنهاء التقييم. تأكد من الإجابة على جميع الأسئلة.'),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'إعادة محاولة إنهاء التقييم' }),
      ).toBeInTheDocument();
    },
    LONG_FLOW,
  );

  it('shows the saved result instead of a new start when the child already completed it', async () => {
    server.use(
      http.get(apiUrl('initial-assessment/:childId/result'), () =>
        HttpResponse.json({
          overallScore: 90,
          categories: [{ categoryName: 'الرياضيات', percentage: 90 }],
        }),
      ),
    );
    renderAssessment();

    expect(await screen.findByRole('heading', { name: 'تم إرسال التقييم' })).toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', { name: 'النتيجة العامة للتقييم المبدئي' }),
    ).toHaveAttribute('aria-valuenow', '90');
    expect(screen.queryByRole('button', { name: /ابدأ/ })).not.toBeInTheDocument();
  });

  it('shows a network error on start', async () => {
    server.use(http.post(apiUrl('initial-assessment/:childId/start'), () => HttpResponse.error()));
    renderAssessment();

    await start();

    expect(await screen.findByText(/تعذّر الاتصال بالخادم/)).toBeInTheDocument();
  });

  it('shows not-found for a child that is not the parent’s', async () => {
    renderAssessment('Parent', 'c0000000-0000-4000-8000-000000000005');

    expect(await screen.findByText('لم يتم العثور على الطفل')).toBeInTheDocument();
  });

  it('is started by the parent only (no request for staff)', async () => {
    signInAs('Teacher');
    renderAssessment('Teacher');

    expect(await screen.findByText('يبدأ ولي الأمر التقييم الأولي')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'خروج' })).toHaveAttribute(
      'href',
      `/teacher/children/${CHILD_ID}`,
    );
  });
});
