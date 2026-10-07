import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { apiUrl } from '@/mocks/http';
import { server } from '@/mocks/server';
import { renderWithRouter } from '@/test/renderWithRouter';
import { signInAs } from '@/test/session';

import { PlanActivityPlayerPage } from './PlanActivityPlayerPage';

const CHILD_ID = 'c0000000-0000-4000-8000-000000000001';
const WITH_QUESTIONS = 'a0000000-0000-4000-8000-000000000001';
const WITHOUT_QUESTIONS = 'a0000000-0000-4000-8000-000000000002';

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

describe('PlanActivityPlayerPage', () => {
  beforeEach(() => {
    signInAs('Parent');
  });

  it('plays the live-shaped questions without correctness and says results are not saved', async () => {
    renderPlayer(WITH_QUESTIONS);

    expect(
      await screen.findByRole('heading', { level: 1, name: /اختبار الحروف/ }),
    ).toBeInTheDocument();
    expect(screen.getByText(/لن تُحفظ النتيجة/)).toBeInTheDocument();

    // Live: questions carry `questionId` (no `id`) and no `isCorrect` — nothing is marked right/wrong.
    await userEvent.click(screen.getByRole('button', { name: /^بطة/ }));
    expect(screen.getByText('تم اختيار إجابتك')).toBeInTheDocument();
    expect(screen.queryByText('أحسنت! إجابة صحيحة')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'التالي' }));
    await userEvent.click(await screen.findByRole('button', { name: /^2/ }));
    await userEvent.click(screen.getByRole('button', { name: 'إنهاء النشاط' }));

    expect(await screen.findByText('أنهيت أسئلة النشاط')).toBeInTheDocument();
    expect(screen.getByText(/لن تُحفظ النتيجة/)).toBeInTheDocument();
  });

  it('offers to skip question types the player does not support', async () => {
    server.use(
      http.get(apiUrl('TrainingPlan/children/:childId/activities/:activityId'), () =>
        HttpResponse.json({
          planActivityId: 'p1',
          activityId: 'a1',
          title: 'نشاط',
          questions: [
            {
              planQuestionId: 'pq1',
              questionId: 'q1',
              questionText: 'رتّب',
              type: 'Sequence',
              order: 1,
              options: [
                { id: 'o1', optionText: 'أ', order: 1, correctOrder: null, pairKey: null },
                { id: 'o2', optionText: 'ب', order: 2, correctOrder: null, pairKey: null },
              ],
            },
          ],
        }),
      ),
    );
    renderPlayer('a1');

    expect(
      await screen.findByText('هذا النوع من الأسئلة غير مدعوم بعد في المشغّل. يمكنك تخطّيه.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'إنهاء النشاط' })).toBeInTheDocument();
  });

  it('shows an honest empty state when the activity has no questions', async () => {
    renderPlayer(WITHOUT_QUESTIONS);

    expect(await screen.findByText('لا تتوفر أسئلة لهذا النشاط')).toBeInTheDocument();
  });

  it('shows the server message when the activity is not in the plan', async () => {
    renderPlayer('not-in-plan');

    expect(await screen.findByText('النشاط غير موجود في الخطة التدريبية.')).toBeInTheDocument();
  });

  it('marks answers only if the server ever exposes correctness', async () => {
    server.use(
      http.get(apiUrl('TrainingPlan/children/:childId/activities/:activityId'), () =>
        HttpResponse.json({
          planActivityId: 'p1',
          activityId: 'a1',
          title: 'نشاط',
          questions: [
            {
              questionId: 'q1',
              questionText: 'اختر',
              type: 'SingleChoice',
              options: [
                { id: 'o1', optionText: 'أ', isCorrect: true },
                { id: 'o2', optionText: 'ب', isCorrect: false },
              ],
            },
          ],
        }),
      ),
    );
    renderPlayer('a1');

    await userEvent.click(await screen.findByRole('button', { name: /^أ/ }));
    expect(screen.getByText('أحسنت! إجابة صحيحة')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'إنهاء النشاط' }));

    expect(await screen.findByText('1 من 1 إجابات صحيحة')).toBeInTheDocument();
  });
});
