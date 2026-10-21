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

  it(
    'lets the child skip a question without options and shows the server refusal to complete',
    async () => {
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
    const cardList = () => screen.findByRole('list', { name: 'اختر لعبة أو تصنيفاً:' });

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
      const cards = within(await cardList()).getAllByRole('button');
      expect(cards.map((card) => card.getAttribute('aria-label'))).toEqual([
        'العب «تصنيف أول من الخادم»',
        'العب «تصنيف ثانٍ من الخادم»',
        'العب «تصنيف ثالث»',
      ]);
      expect(cards[0]).toHaveAccessibleDescription('وصف من الخادم');
      // No mock or Replit category names leak in, and nothing is started before a tap.
      expect(screen.queryByText(/الحروف والقراءة|الأرقام والحساب|الذاكرة/)).not.toBeInTheDocument();
      expect(startCalls).toBe(0);
    });

    it(
      'plays one category only, then the rest, and completes once every category is done',
      async () => {
        const answers: { questionId: string }[] = [];
        let completeCalls = 0;
        server.events.on('request:start', ({ request }) => {
          if (request.url.endsWith('/complete')) completeCalls += 1;
        });
        server.use(
          http.post(apiUrl('initial-assessment/:id/answer'), async ({ request }) => {
            const body = (await request.json()) as { questionId: string };
            answers.push(body);
            return HttpResponse.json({ questionId: body.questionId, isCorrect: true });
          }),
        );
        renderAssessment();

        await userEvent.click(
          within(await cardList()).getByRole('button', { name: 'العب «الأرقام والحساب»' }),
        );
        expect(await screen.findByRole('heading', { name: 'الأرقام والحساب' })).toBeInTheDocument();
        expect(screen.getByText('السؤال 1 من 3')).toBeInTheDocument();
        await answerMath();
        expect(screen.getByRole('button', { name: 'إنهاء التصنيف' })).toBeEnabled();
        await next();

        // Back on the picker: math is done, reading is still open, nothing completed yet.
        expect(await screen.findByText(/أحسنت! أنهيت «الأرقام والحساب»/)).toBeInTheDocument();
        const list = await cardList();
        expect(within(list).getByRole('button', { name: 'تم «الأرقام والحساب»' })).toBeDisabled();
        expect(within(list).getByText('مكتمل')).toBeInTheDocument();
        expect(answers.map((answer) => answer.questionId)).toEqual([
          'q-math-1',
          'q-math-2',
          'q-math-3',
        ]);
        expect(completeCalls).toBe(0);

        await userEvent.click(within(list).getByRole('button', { name: 'العب «الحروف والقراءة»' }));
        await tap('بطة');
        await next();
        await tap('ق');
        await userEvent.click(screen.getByRole('button', { name: 'إنهاء التقييم' }));

        expect(
          await screen.findByRole('heading', { name: 'تم إرسال التقييم' }),
        ).toBeInTheDocument();
        expect(screen.getByText(/تم إرسال 5 أسئلة/)).toBeInTheDocument();
        expect(completeCalls).toBe(1);
        server.events.removeAllListeners();
      },
      LONG_FLOW,
    );

    it(
      'keeps progress when the child goes back mid-category; play-all plays only what is left',
      async () => {
        const answered: string[] = [];
        server.use(
          http.post(apiUrl('initial-assessment/:id/answer'), async ({ request }) => {
            const body = (await request.json()) as { questionId: string };
            answered.push(body.questionId);
            return HttpResponse.json({ questionId: body.questionId, isCorrect: true });
          }),
        );
        renderAssessment();

        await userEvent.click(
          within(await cardList()).getByRole('button', { name: 'العب «الحروف والقراءة»' }),
        );
        await tap('بطة');
        await next();
        await userEvent.click(await screen.findByRole('button', { name: 'العودة إلى التصنيفات' }));

        const list = await cardList();
        expect(
          within(list).getByRole('button', { name: 'أكمل «الحروف والقراءة»' }),
        ).toHaveAccessibleDescription('أُنجز 1 من 2');
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
        expect(screen.getByRole('button', { name: 'العب «تصنيف من الخادم»' })).toBeInTheDocument();
      });
    });

    it('says so when a picked category has no questions in the started assessment', async () => {
      server.use(
        http.get(apiUrl('initial-assessment/categories'), () =>
          HttpResponse.json({
            categories: [
              { id: 'k1', name: 'تصنيف فارغ', order: 1 },
              { id: 'k2', name: 'تصنيف بأسئلة', order: 2 },
            ],
          }),
        ),
        http.post(apiUrl('initial-assessment/:childId/start'), () =>
          HttpResponse.json({
            assessmentId: 'as-1',
            categories: [
              { id: 'k1', name: 'تصنيف فارغ', questions: [] },
              {
                id: 'k2',
                name: 'تصنيف بأسئلة',
                questions: [
                  {
                    id: 'q1',
                    questionText: 'سؤال',
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

      await userEvent.click(await screen.findByRole('button', { name: 'العب «تصنيف فارغ»' }));

      expect(await screen.findByText('لا توجد أسئلة في هذا التصنيف حالياً')).toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: 'العودة إلى التصنيفات' }));
      expect(await screen.findByRole('button', { name: 'العب «تصنيف فارغ»' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'العب «تصنيف بأسئلة»' })).toBeEnabled();
    });
  });
});
