import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { Link } from 'react-router';

import { apiUrl } from '@/mocks/http';
import { server } from '@/mocks/server';
import { renderWithRouter } from '@/test/renderWithRouter';
import { signInAs } from '@/test/session';

import { PlanActivityPlayerPage } from './PlanActivityPlayerPage';

const CHILD_ID = 'c0000000-0000-4000-8000-000000000002';
const LONG_FLOW = 15_000;

function renderPlayer(activityId = 'g-1') {
  signInAs('Parent');
  return renderWithRouter(
    [
      {
        path: '/parent/children/:childId/activities/:activityId/play',
        element: (
          <>
            <Link to="/parent/children">خارج اللعبة</Link>
            <PlanActivityPlayerPage />
          </>
        ),
      },
      { path: '/parent/children', element: <h1>أطفالي</h1> },
      { path: '/parent/children/:childId', element: <h1>ملف الطفل</h1> },
    ],
    `/parent/children/${CHILD_ID}/activities/${activityId}/play`,
  );
}

const option = (id: string, optionText: string, optionImageUrl: string | null = null) => ({
  id,
  optionText,
  optionImageUrl,
  order: 1,
  correctOrder: null,
});

interface GameOverrides {
  slug?: string | null;
  type?: string;
  isCompleted?: boolean;
  questions?: unknown[];
}

/** Live child-facing shape + the requested `slug` field. Real backend-shaped content only. */
function gameActivity({
  slug = 'letter-hunt',
  type = 'ألعاب',
  isCompleted = false,
  questions,
}: GameOverrides = {}) {
  return {
    planActivityId: 'pa-game',
    activityId: 'g-1',
    title: 'لعبة الحروف',
    type,
    isCompleted,
    ...(slug === null ? {} : { slug }),
    questions: questions ?? [
      {
        planQuestionId: 'pq-1',
        questionId: 'q-letter',
        questionText: 'ما الحرف الأول في كلمة «أسد»؟',
        type: 'SingleChoice',
        options: [option('o-a', 'أ'), option('o-b', 'ب')],
      },
      {
        planQuestionId: 'pq-2',
        questionId: 'q-order',
        questionText: 'رتّب حروف كلمة «قلم»',
        type: 'Sequence',
        options: [option('o-l', 'ل'), option('o-m', 'م'), option('o-q', 'ق')],
      },
      {
        planQuestionId: 'pq-3',
        questionId: 'q-fruit',
        questionText: 'اختر كل الفواكه',
        type: 'MultiSelect',
        options: [option('o-apple', 'تفاحة'), option('o-chair', 'كرسي'), option('o-banana', 'موز')],
      },
    ],
  };
}

function serveGame(overrides: GameOverrides = {}) {
  server.use(
    http.get(apiUrl('TrainingPlan/children/:childId/activities/:activityId'), () =>
      HttpResponse.json(gameActivity(overrides)),
    ),
  );
}

const tap = (name: string) => userEvent.click(screen.getByRole('button', { name }));
const next = () => userEvent.click(screen.getByRole('button', { name: 'التالي' }));
const finish = () =>
  userEvent.click(screen.getByRole('button', { name: 'إنهاء اللعبة وحفظ النتيجة' }));

describe('Plan game player — dedicated engines (client revision 2026-10)', () => {
  it(
    'opens the template engine and submits every real answer once in the existing format',
    async () => {
      const bodies: unknown[] = [];
      serveGame();
      server.use(
        http.post(
          apiUrl('TrainingPlan/children/:childId/activities/:planActivityId/submit'),
          async ({ request, params }) => {
            expect(params.planActivityId).toBe('pa-game');
            bodies.push(await request.json());
            return HttpResponse.json({ message: 'تم حفظ النتيجة.' });
          },
        ),
      );
      renderPlayer();

      const stage = await screen.findByRole('region', { name: 'صيد الحروف' });
      expect(within(stage).getByText('الحروف والقراءة')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: 'ما الحرف الأول في كلمة «أسد»؟' }),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'التالي' })).toBeDisabled();
      await tap('أ');
      await next();

      // A Sequence question inside a letter-hunt game uses the memory engine (still answerable).
      await tap('ق');
      await tap('ل');
      await tap('م');
      await next();

      await tap('تفاحة');
      await tap('موز');
      await finish();

      expect(await screen.findByText(/أحسنت! أنهيت «صيد الحروف»/)).toBeInTheDocument();
      expect(screen.getByText('تم حفظ إجاباتك (3 من 3 أسئلة).')).toBeInTheDocument();
      expect(bodies).toEqual([
        {
          answers: [
            { questionId: 'q-letter', selectedOptionId: 'o-a' },
            { questionId: 'q-order', orderedOptionIds: ['o-q', 'o-l', 'o-m'] },
            { questionId: 'q-fruit', selectedOptionIds: ['o-apple', 'o-banana'] },
          ],
        },
      ]);
    },
    LONG_FLOW,
  );

  it.each([
    ['number-match', 'طابق الرقم'],
    ['memory-sequence-2', 'تحدي الذاكرة'],
    ['focus-challenge', 'تحدي التركيز'],
  ])('opens the %s engine', async (slug, name) => {
    serveGame({ slug });
    renderPlayer();

    expect(await screen.findByRole('region', { name })).toBeInTheDocument();
  });

  it('shows the real saved result when the server returns it after submitting', async () => {
    let submitted = false;
    server.use(
      http.get(apiUrl('TrainingPlan/children/:childId/activities/:activityId'), () =>
        HttpResponse.json({
          ...gameActivity({
            questions: [
              {
                planQuestionId: 'pq-1',
                questionId: 'q-letter',
                questionText: 'ما الحرف الأول في كلمة «أسد»؟',
                type: 'SingleChoice',
                options: [option('o-a', 'أ'), option('o-b', 'ب')],
              },
            ],
          }),
          isCompleted: submitted,
          ...(submitted ? { score: 100, correctAnswers: 1, wrongAnswers: 0 } : {}),
        }),
      ),
      http.post(apiUrl('TrainingPlan/children/:childId/activities/:planActivityId/submit'), () => {
        submitted = true;
        return HttpResponse.json({ message: 'ok' });
      }),
    );
    renderPlayer();
    await screen.findByRole('region', { name: 'صيد الحروف' });

    await tap('أ');
    await finish();

    expect(
      await screen.findByText('النتيجة: 100% · إجابات صحيحة: 1 · إجابات غير صحيحة: 0'),
    ).toBeInTheDocument();
  });

  it('submits once even when the finish button is pressed twice, and respects 409', async () => {
    let calls = 0;
    serveGame({
      questions: [
        {
          planQuestionId: 'pq-1',
          questionId: 'q-letter',
          questionText: 'سؤال',
          type: 'SingleChoice',
          options: [option('o-a', 'أ')],
        },
      ],
    });
    server.use(
      http.post(apiUrl('TrainingPlan/children/:childId/activities/:planActivityId/submit'), () => {
        calls += 1;
        return HttpResponse.json({ message: 'تم إرسال نتيجة هذا النشاط مسبقًا.' }, { status: 409 });
      }),
    );
    renderPlayer();
    await screen.findByRole('region', { name: 'صيد الحروف' });

    await tap('أ');
    const button = screen.getByRole('button', { name: 'إنهاء اللعبة وحفظ النتيجة' });
    await userEvent.dblClick(button);

    expect(await screen.findByText('تم إرسال نتيجة هذا النشاط مسبقًا.')).toBeInTheDocument();
    expect(calls).toBe(1);
    // 409 is final: no retry button, only the way back.
    expect(screen.queryByRole('button', { name: 'إعادة محاولة الحفظ' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'العودة إلى ملف الطفل' })).toBeInTheDocument();
  });

  it('offers a retry when saving fails for a server error', async () => {
    serveGame({
      questions: [
        {
          planQuestionId: 'pq-1',
          questionId: 'q-letter',
          questionText: 'سؤال',
          type: 'SingleChoice',
          options: [option('o-a', 'أ')],
        },
      ],
    });
    server.use(
      http.post(apiUrl('TrainingPlan/children/:childId/activities/:planActivityId/submit'), () =>
        HttpResponse.json({ message: 'خطأ في الخادم' }, { status: 500 }),
      ),
    );
    renderPlayer();
    await screen.findByRole('region', { name: 'صيد الحروف' });
    await tap('أ');
    await finish();

    expect(await screen.findByRole('button', { name: 'إعادة محاولة الحفظ' })).toBeInTheDocument();
  });

  it('shows the completed state for an already submitted game (no second attempt)', async () => {
    serveGame({ isCompleted: true });
    renderPlayer();

    expect(await screen.findByText('أُنجز هذا النشاط')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'صيد الحروف' })).not.toBeInTheDocument();
  });

  it('shows loading, then an error with retry', async () => {
    let calls = 0;
    server.use(
      http.get(apiUrl('TrainingPlan/children/:childId/activities/:activityId'), () => {
        calls += 1;
        return calls === 1
          ? HttpResponse.json({ message: 'خطأ' }, { status: 500 })
          : HttpResponse.json(gameActivity());
      }),
    );
    renderPlayer();

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(await screen.findByText('تعذّر تحميل النشاط')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'إعادة المحاولة' }));
    expect(await screen.findByRole('region', { name: 'صيد الحروف' })).toBeInTheDocument();
  });

  it('asks before leaving a game with unsaved answers', async () => {
    serveGame();
    renderPlayer();
    await screen.findByRole('region', { name: 'صيد الحروف' });
    await tap('أ');

    await userEvent.click(screen.getByRole('link', { name: 'خارج اللعبة' }));
    const dialog = await screen.findByRole('dialog', { name: 'مغادرة اللعبة؟' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'إلغاء' }));
    expect(screen.getByRole('region', { name: 'صيد الحروف' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('link', { name: 'خارج اللعبة' }));
    await userEvent.click(
      within(await screen.findByRole('dialog', { name: 'مغادرة اللعبة؟' })).getByRole('button', {
        name: 'مغادرة',
      }),
    );
    expect(await screen.findByRole('heading', { name: 'أطفالي' })).toBeInTheDocument();
  });

  it.each([
    ['an unknown slug', { slug: 'memory-game' }],
    ['no slug (live today)', { slug: null }],
    ['a test activity', { type: 'اختبارات' }],
  ])('falls back to the generic player for %s', async (_label, overrides) => {
    serveGame(overrides);
    renderPlayer();

    expect(
      await screen.findByRole('heading', { name: 'ما الحرف الأول في كلمة «أسد»؟' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'صيد الحروف' })).not.toBeInTheDocument();
    expect(screen.getByText('اختر إجابة واحدة.')).toBeInTheDocument();
  });

  it('plays the mock game rows end to end through the real submit flow', async () => {
    renderPlayer('g0000000-0000-4000-8000-000000000002');

    expect(await screen.findByRole('region', { name: 'طابق الرقم' })).toBeInTheDocument();
    await tap('5');
    await next();
    await tap('8');
    await finish();

    expect(await screen.findByText(/أحسنت! أنهيت «طابق الرقم»/)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText('جارٍ حفظ النتيجة…')).not.toBeInTheDocument();
    });
  });
});
