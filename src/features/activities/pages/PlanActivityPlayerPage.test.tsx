import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { apiUrl } from '@/mocks/http';
import { server } from '@/mocks/server';
import { renderWithRouter } from '@/test/renderWithRouter';
import { signInAs } from '@/test/session';

import { PlanActivityPlayerPage } from './PlanActivityPlayerPage';

const CHILD_ID = 'c0000000-0000-4000-8000-000000000001';
const COMPLETED_WITH_QUESTIONS = 'a0000000-0000-4000-8000-000000000001';
const WITHOUT_QUESTIONS = 'a0000000-0000-4000-8000-000000000002';
const LONG_FLOW = 15_000;

function renderPlayer(activityId: string) {
  return renderWithRouter(
    [
      {
        path: '/parent/children/:childId/activities/:activityId/play',
        element: <PlanActivityPlayerPage />,
      },
    ],
    `/parent/children/${CHILD_ID}/activities/${activityId}/play`,
  );
}

const option = (id: string, optionText: string, order: number) => ({
  id,
  optionText,
  optionImageUrl: null,
  order,
  correctOrder: null,
});

/** Live child-facing shape (verified 2026-10-10): `questionId`, no `id`, answers hidden. */
function liveActivity(isCompleted = false) {
  return {
    planActivityId: 'pa-1',
    activityId: 'a-1',
    title: 'نشاط الخطة',
    isCompleted,
    questions: [
      {
        planQuestionId: 'pq-1',
        questionId: 'q-single',
        questionText: 'أي كلمة تبدأ بالباء؟',
        type: 'SingleChoice',
        order: 1,
        options: [option('s1', 'بطة', 1), option('s2', 'تفاحة', 2)],
      },
      {
        planQuestionId: 'pq-2',
        questionId: 'q-multi',
        questionText: 'اختر الحيوانات',
        type: 'MultiSelect',
        order: 2,
        options: [option('m1', 'قطة', 1), option('m2', 'كرسي', 2), option('m3', 'أرنب', 3)],
      },
      {
        planQuestionId: 'pq-3',
        questionId: 'q-seq',
        questionText: 'رتّب مراحل نمو النبتة',
        type: 'Sequence',
        order: 3,
        options: [option('o1', 'زهرة', 1), option('o2', 'بذرة', 2), option('o3', 'نبتة', 3)],
      },
    ],
  };
}

describe('PlanActivityPlayerPage', () => {
  beforeEach(() => {
    signInAs('Parent');
  });

  it(
    'plays every question type and submits one answer per question to /submit',
    async () => {
      let body: unknown;
      let submitUrl = '';
      server.use(
        http.get(apiUrl('TrainingPlan/children/:childId/activities/:activityId'), () =>
          HttpResponse.json(liveActivity()),
        ),
        http.post(
          apiUrl('TrainingPlan/children/:childId/activities/:planActivityId/submit'),
          async ({ request }) => {
            submitUrl = request.url;
            body = await request.json();
            return HttpResponse.json({ message: 'Activity submitted successfully.' });
          },
        ),
      );
      renderPlayer('a-1');

      expect(await screen.findByText('اختر إجابة واحدة.')).toBeInTheDocument();
      expect(screen.queryByText(/لن تُحفظ النتيجة/)).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'التالي' })).toBeDisabled();
      await userEvent.click(screen.getByRole('button', { name: /^بطة/ }));
      await userEvent.click(screen.getByRole('button', { name: 'التالي' }));

      await userEvent.click(await screen.findByRole('button', { name: /^قطة/ }));
      await userEvent.click(screen.getByRole('button', { name: /^أرنب/ }));
      await userEvent.click(screen.getByRole('button', { name: 'التالي' }));

      // Sequence: tap in order; the next button waits for every option.
      await userEvent.click(await screen.findByRole('button', { name: /^بذرة/ }));
      await userEvent.click(screen.getByRole('button', { name: /^نبتة/ }));
      expect(screen.getByRole('button', { name: 'إنهاء النشاط وحفظ النتيجة' })).toBeDisabled();
      await userEvent.click(screen.getByRole('button', { name: /^زهرة/ }));
      await userEvent.click(screen.getByRole('button', { name: 'إنهاء النشاط وحفظ النتيجة' }));

      expect(await screen.findByText('تم حفظ إجاباتك (3 من 3 أسئلة).')).toBeInTheDocument();
      expect(submitUrl).toContain(`/TrainingPlan/children/${CHILD_ID}/activities/pa-1/submit`);
      expect(body).toEqual({
        answers: [
          { questionId: 'q-single', selectedOptionId: 's1' },
          { questionId: 'q-multi', selectedOptionIds: ['m1', 'm3'] },
          { questionId: 'q-seq', orderedOptionIds: ['o2', 'o3', 'o1'] },
        ],
      });
    },
    LONG_FLOW,
  );

  it(
    'resets a sequence and offers to retry when saving fails',
    async () => {
      server.use(
        http.get(apiUrl('TrainingPlan/children/:childId/activities/:activityId'), () =>
          HttpResponse.json({ ...liveActivity(), questions: [liveActivity().questions[2]] }),
        ),
        http.post(
          apiUrl('TrainingPlan/children/:childId/activities/:planActivityId/submit'),
          () => new HttpResponse(null, { status: 500 }),
        ),
      );
      renderPlayer('a-1');

      await userEvent.click(await screen.findByRole('button', { name: /^زهرة/ }));
      await userEvent.click(screen.getByRole('button', { name: 'إعادة الترتيب' }));
      expect(screen.getByRole('button', { name: /^زهرة/ })).not.toHaveAttribute('aria-pressed');
      for (const name of [/^بذرة/, /^نبتة/, /^زهرة/]) {
        await userEvent.click(screen.getByRole('button', { name }));
      }
      await userEvent.click(screen.getByRole('button', { name: 'إنهاء النشاط وحفظ النتيجة' }));

      expect(await screen.findByRole('button', { name: 'إعادة محاولة الحفظ' })).toBeInTheDocument();
    },
    LONG_FLOW,
  );

  it("shows the server's message when the activity was already submitted (live 409)", async () => {
    server.use(
      http.get(apiUrl('TrainingPlan/children/:childId/activities/:activityId'), () =>
        HttpResponse.json({ ...liveActivity(), questions: [liveActivity().questions[0]] }),
      ),
      http.post(apiUrl('TrainingPlan/children/:childId/activities/:planActivityId/submit'), () =>
        HttpResponse.json({ message: 'تم إرسال نتيجة هذا النشاط مسبقًا.' }, { status: 409 }),
      ),
    );
    renderPlayer('a-1');

    await userEvent.click(await screen.findByRole('button', { name: /^بطة/ }));
    await userEvent.click(screen.getByRole('button', { name: 'إنهاء النشاط وحفظ النتيجة' }));

    expect(await screen.findByText('تم إرسال نتيجة هذا النشاط مسبقًا.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'إعادة محاولة الحفظ' })).not.toBeInTheDocument();
  });

  it('does not start an activity the server could never save (a question without options)', async () => {
    server.use(
      http.get(apiUrl('TrainingPlan/children/:childId/activities/:activityId'), () =>
        HttpResponse.json({
          ...liveActivity(),
          questions: [liveActivity().questions[0], { ...liveActivity().questions[1], options: [] }],
        }),
      ),
    );
    renderPlayer('a-1');

    expect(await screen.findByText('لا يمكن تشغيل هذا النشاط حالياً')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'التالي' })).not.toBeInTheDocument();
  });

  it('shows a completed activity instead of a second attempt (the server allows one)', async () => {
    renderPlayer(COMPLETED_WITH_QUESTIONS);

    expect(await screen.findByText('أُنجز هذا النشاط')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'التالي' })).not.toBeInTheDocument();
  });

  it('shows an honest empty state when the activity has no questions', async () => {
    renderPlayer(WITHOUT_QUESTIONS);

    expect(await screen.findByText('لا تتوفر أسئلة لهذا النشاط')).toBeInTheDocument();
  });

  it('shows the server message when the activity is not in the plan', async () => {
    renderPlayer('not-in-plan');

    expect(await screen.findByText('النشاط غير موجود في الخطة التدريبية.')).toBeInTheDocument();
  });

  it('submits once and confirms the saved answers', async () => {
    let calls = 0;
    server.use(
      http.get(apiUrl('TrainingPlan/children/:childId/activities/:activityId'), () =>
        HttpResponse.json({ ...liveActivity(), questions: [liveActivity().questions[0]] }),
      ),
      http.post(apiUrl('TrainingPlan/children/:childId/activities/:planActivityId/submit'), () => {
        calls += 1;
        return HttpResponse.json({ message: 'Activity submitted successfully.' });
      }),
    );
    renderPlayer('a-1');

    await userEvent.click(await screen.findByRole('button', { name: /^بطة/ }));
    await userEvent.click(screen.getByRole('button', { name: 'إنهاء النشاط وحفظ النتيجة' }));

    expect(await screen.findByText('تم حفظ إجاباتك (1 من 1 أسئلة).')).toBeInTheDocument();
    expect(calls).toBe(1);
  });
});
