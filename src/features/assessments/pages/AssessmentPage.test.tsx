import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { RoleAreaContext } from '@/hooks/useRoleArea';
import { MOCK_CATEGORY_IDS, mockCategories } from '@/mocks/fixtures/content';
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

const PLAY_ALL = 'العب الكل دفعة واحدة';

/** "العب الكل دفعة واحدة" — starts the server assessment with every category. */
const start = async () => {
  await userEvent.click(await screen.findByRole('button', { name: PLAY_ALL }));
};

/** The admin adds «الأرقام والحساب» to the assessment (mock table), next to «الحروف والقراءة». */
function includeMathCategory() {
  const math = mockCategories.find((category) => category.id === MOCK_CATEGORY_IDS.math);
  if (!math) throw new Error('mock category missing');
  math.isInInitialAssessment = true;
}

const tap = async (label: string) => {
  await userEvent.click(await screen.findByRole('button', { name: new RegExp(`^${label}`) }));
};
const next = () =>
  userEvent.click(screen.getByRole('button', { name: /^(التالي|إنهاء التقييم|إنهاء التصنيف)$/ }));

async function answerMath() {
  await tap('3');
  await next();
  await tap('4');
  await tap('2');
  await next();
  await tap('1');
  await tap('3');
  await tap('5');
}

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
    includeMathCategory();
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

      expect(await screen.findByRole('heading', { name: 'الحروف والقراءة' })).toBeInTheDocument();
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
    'ends with a confirmation, not a score: the specialist reviews the result',
    async () => {
      renderAssessment();
      expect(await screen.findByRole('heading', { name: 'مرحباً يا يوسف!' })).toBeInTheDocument();
      await start();
      await answerAll();

      expect(await screen.findByRole('heading', { name: 'تم إرسال التقييم' })).toBeInTheDocument();
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.getByText(/يراجع الأخصائي نتيجة التقييم/)).toBeInTheDocument();
    },
    LONG_FLOW,
  );

  it('shows the backend message when no assessment is available', async () => {
    server.use(
      http.post(apiUrl('initial-assessment/:childId/start'), () =>
        HttpResponse.json(
          { message: 'الطفل غير موجود أو لا يوجد تقييم أولي متاح.' },
          { status: 404 },
        ),
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
        HttpResponse.json({
          assessmentId: 'as-1',
          categories: [{ name: 'القراءة', questions: [] }],
        }),
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
            categories: [
              {
                name: 'القراءة',
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

  it('blocks an incomplete assessment before sending any answers or attempting completion', async () => {
    let writes = 0;
    server.use(
      http.post(apiUrl('initial-assessment/:childId/start'), () =>
        HttpResponse.json({
          assessmentId: 'as-1',
          categories: [
            {
              name: 'القراءة',
              questions: [
                { id: 'q1', questionText: 'سؤال بلا خيارات', type: 'SingleChoice', options: [] },
              ],
            },
          ],
        }),
      ),
      http.post(apiUrl('initial-assessment/:id/answer'), () => {
        writes += 1;
        return HttpResponse.json({});
      }),
      http.post(apiUrl('initial-assessment/:id/complete'), () => {
        writes += 1;
        return HttpResponse.json({});
      }),
    );
    renderAssessment();
    await start();
    expect(await screen.findByText('التقييم يحتاج إلى استكمال محتواه')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'تخطّي السؤال' })).not.toBeInTheDocument();
    expect(writes).toBe(0);
  });

  it('never reads the saved result as the parent (staff-only, product decision)', async () => {
    let resultCalls = 0;
    server.events.on('request:start', ({ request }) => {
      if (request.url.includes('/result')) resultCalls += 1;
    });
    renderAssessment();

    expect(await screen.findByRole('button', { name: PLAY_ALL })).toBeInTheDocument();
    expect(resultCalls).toBe(0);
    server.events.removeAllListeners();
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
  describe('category picker (client revision 2026-10)', () => {
    const cardList = () => screen.findByRole('list', { name: 'تصنيفات التقييم المبدئي' });

    it('renders one large card per category the API returns — nothing hardcoded', async () => {
      let startCalls = 0;
      server.use(
        http.get(apiUrl('initial-assessment/categories'), () =>
          HttpResponse.json({
            categories: [
              { id: 'k2', name: 'تصنيف ثانٍ من الخادم', order: 2 },
              { id: 'k1', name: 'تصنيف أول من الخادم', order: 1, description: 'وصف من الخادم' },
              { id: 'k3', name: 'تصنيف ثالث', order: 3 },
            ],
          }),
        ),
        http.post(apiUrl('initial-assessment/:childId/start'), () => {
          startCalls += 1;
          return HttpResponse.json({ assessmentId: 'as-1', categories: [] });
        }),
      );
      renderAssessment();

      expect(await screen.findByRole('heading', { name: 'مرحباً يا يوسف!' })).toBeInTheDocument();
      const list = await cardList();
      expect(within(list).queryByRole('button')).not.toBeInTheDocument();
      expect(
        within(list)
          .getAllByRole('listitem')
          .map((item) => item.textContent),
      ).toEqual(['تصنيف أول من الخادموصف من الخادم', 'تصنيف ثانٍ من الخادم', 'تصنيف ثالث']);
      // No mock or Replit category names leak in, and nothing is started before a tap.
      expect(screen.queryByText(/الحروف والقراءة|الأرقام والحساب|الذاكرة/)).not.toBeInTheDocument();
      expect(startCalls).toBe(0);
    });

    it(
      'starts every category through the single orange button and resumes only unanswered questions',
      async () => {
        const answered: string[] = [];
        server.use(
          http.post(apiUrl('initial-assessment/:id/answer'), async ({ request }) => {
            const body = (await request.json()) as { questionId: string };
            answered.push(body.questionId);
            return HttpResponse.json({ message: 'تم الحفظ' });
          }),
        );
        renderAssessment();
        expect(within(await cardList()).queryByRole('button')).not.toBeInTheDocument();
        await start();
        await tap('بطة');
        await next();
        await userEvent.click(
          await screen.findByRole('button', { name: 'العودة إلى مقدمة التقييم' }),
        );
        expect(await cardList()).toBeInTheDocument();
        await start();
        expect(await screen.findByText('السؤال 1 من 4')).toBeInTheDocument();
        await tap('ق');
        await next();
        await answerMath();
        await next();
        expect(
          await screen.findByRole('heading', { name: 'تم إرسال التقييم' }),
        ).toBeInTheDocument();
        expect(answered).toEqual(['q-read-1', 'q-read-2', 'q-math-1', 'q-math-2', 'q-math-3']);
      },
      LONG_FLOW,
    );

    it('shows a polished empty state when the assessment has no categories', async () => {
      server.use(
        http.get(apiUrl('initial-assessment/categories'), () =>
          HttpResponse.json({ categories: [] }),
        ),
      );
      renderAssessment();

      expect(
        await screen.findByText('لا توجد تصنيفات في التقييم الأولي حالياً'),
      ).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: PLAY_ALL })).not.toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'العودة إلى ملف الطفل' })).toHaveAttribute(
        'href',
        `/parent/children/${CHILD_ID}`,
      );
    });

    it('shows an error with retry when the categories cannot be loaded', async () => {
      let calls = 0;
      server.use(
        http.get(apiUrl('initial-assessment/categories'), () => {
          calls += 1;
          return calls === 1
            ? new HttpResponse(null, { status: 500 })
            : HttpResponse.json({ categories: [{ id: 'k1', name: 'تصنيف من الخادم', order: 1 }] });
        }),
      );
      renderAssessment();

      expect(await screen.findByText('تعذّر تحميل تصنيفات التقييم')).toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: 'إعادة المحاولة' }));

      await waitFor(() => {
        expect(screen.getByText('تصنيف من الخادم')).toBeInTheDocument();
      });
    });

    it('includes questions from every category even when another category is empty', async () => {
      server.use(
        http.post(apiUrl('initial-assessment/:childId/start'), () =>
          HttpResponse.json({
            assessmentId: 'as-1',
            categories: [
              { id: 'empty', name: 'تصنيف فارغ', questions: [] },
              {
                id: 'actual',
                name: 'تصنيف بأسئلة',
                questions: [
                  {
                    id: 'q1',
                    questionText: 'سؤال فعلي',
                    type: 'SingleChoice',
                    options: [{ id: 'o1', optionText: 'أ' }],
                  },
                ],
              },
            ],
          }),
        ),
      );
      renderAssessment();
      await start();
      expect(await screen.findByText('سؤال فعلي')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^أ$/ })).toBeEnabled();
    });
  });
});
