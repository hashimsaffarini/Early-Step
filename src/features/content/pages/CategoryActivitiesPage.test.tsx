import { screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { ADMIN_PATHS } from '@/constants/routes';
import { apiUrl } from '@/mocks/http';
import { server } from '@/mocks/server';
import { renderContent } from '@/test/contentTestUtils';

const MEMORY = 'cat00000-0000-4000-8000-000000000003';

describe('CategoryActivitiesPage (category card → its activities, client revision 2026-10)', () => {
  it('lists only the activities of the category, tests and games, each with its type', async () => {
    const requested: string[] = [];
    server.events.on('request:start', ({ request }) => {
      const url = new URL(request.url);
      if (url.pathname.includes('Admin/activities/')) {
        requested.push(
          `${url.pathname.split('/').pop() ?? ''}:${url.searchParams.get('categoryId') ?? ''}`,
        );
      }
    });
    server.use(
      http.get(apiUrl('Admin/activities/:type'), ({ params }) =>
        HttpResponse.json(
          params.type === 'game'
            ? [
                {
                  id: 'g1',
                  title: 'لعبة الذاكرة',
                  iconUrl: '/uploads/memory.png',
                  categoryId: MEMORY,
                  questionCount: 3,
                },
              ]
            : [{ id: 't1', title: 'اختبار التسلسل', categoryId: MEMORY, questionCount: 5 }],
        ),
      ),
    );
    renderContent(ADMIN_PATHS.categoryActivities(MEMORY));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'التصنيف: الذاكرة والتسلسل' }),
    ).toBeInTheDocument();
    const list = await screen.findByRole('list', { name: 'التصنيف: الذاكرة والتسلسل' });
    const game = within(list).getByRole('link', { name: /لعبة الذاكرة/ });
    expect(game).toHaveAttribute('href', ADMIN_PATHS.activityDetail('game', 'g1'));
    expect(within(game).getByText('لعبة')).toBeInTheDocument();
    expect(within(game).getByText('3 أسئلة')).toBeInTheDocument();
    const test = within(list).getByRole('link', { name: /اختبار التسلسل/ });
    expect(within(test).getByText('اختبار')).toBeInTheDocument();
    expect(requested).toEqual(expect.arrayContaining([`test:${MEMORY}`, `game:${MEMORY}`]));
    server.events.removeAllListeners();
  });

  it('shows a clear empty state for a category without activities', async () => {
    server.use(http.get(apiUrl('Admin/activities/:type'), () => HttpResponse.json([])));
    renderContent(ADMIN_PATHS.categoryActivities(MEMORY));

    expect(await screen.findByText('لا توجد أنشطة ضمن هذا التصنيف.')).toBeInTheDocument();
  });

  it('shows not-found for an unknown category', async () => {
    renderContent(ADMIN_PATHS.categoryActivities('missing'));

    expect(await screen.findByText('لم يتم العثور على التصنيف')).toBeInTheDocument();
  });
});
