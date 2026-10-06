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

  it('plays the server questions locally and says results are not saved', async () => {
    renderPlayer(WITH_QUESTIONS);

    expect(
      await screen.findByRole('heading', { level: 1, name: /اختبار الحروف/ }),
    ).toBeInTheDocument();
    expect(screen.getByText(/لن تُحفظ النتيجة/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /^بطة/ }));
    expect(screen.getByText('أحسنت! إجابة صحيحة')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'التالي' }));
    await userEvent.click(await screen.findByRole('button', { name: /^2/ }));
    expect(screen.getByRole('button', { name: /^3.*إجابة صحيحة/ })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'إنهاء النشاط' }));

    expect(await screen.findByText('1 من 2 إجابات صحيحة')).toBeInTheDocument();
    expect(screen.getByText(/لن تُحفظ النتيجة/)).toBeInTheDocument();
  });

  it('shows an honest empty state when the activity has no questions', async () => {
    renderPlayer(WITHOUT_QUESTIONS);

    expect(await screen.findByText('لا تتوفر أسئلة لهذا النشاط')).toBeInTheDocument();
  });

  it('shows the server message when the activity is not in the plan', async () => {
    renderPlayer('not-in-plan');

    expect(await screen.findByText('النشاط غير موجود في الخطة التدريبية.')).toBeInTheDocument();
  });

  it('does not show correctness the server does not provide', async () => {
    server.use(
      http.get(apiUrl('TrainingPlan/children/:childId/activities/:activityId'), () =>
        HttpResponse.json({
          id: 'p1',
          activityId: 'a1',
          title: 'نشاط',
          questions: [
            {
              id: 'q1',
              questionText: 'اختر',
              type: 'SingleChoice',
              options: [
                { id: 'o1', optionText: 'أ' },
                { id: 'o2', optionText: 'ب' },
              ],
            },
          ],
        }),
      ),
    );
    renderPlayer('a1');

    await userEvent.click(await screen.findByRole('button', { name: /^أ/ }));
    expect(screen.getByText('تم اختيار إجابتك')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'إنهاء النشاط' }));

    expect(await screen.findByText('أنهيت أسئلة النشاط')).toBeInTheDocument();
  });
});
