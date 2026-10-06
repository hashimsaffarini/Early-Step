import { http, HttpResponse, type HttpHandler } from 'msw';

import { findMockChild } from '../fixtures/children';
import { mockPlanActivities } from '../fixtures/planActivities';
import { apiUrl, currentUser, forbidden, notFound, unauthorized } from '../http';

function rowsFor(childId: string, type: string | null) {
  return mockPlanActivities
    .filter((row) => row.childId === childId)
    .filter((row) => !type || (type === 'test') === (row.type === 'اختبارات'));
}

/** Training plans. Shapes from Apidog examples; NOT LIVE-VERIFIED. */
export const trainingPlansHandlers: HttpHandler[] = [
  http.get(apiUrl('TrainingPlan/children/:childId/activities/summary'), ({ request, params }) => {
    const user = currentUser(request);
    if (!user) return unauthorized();
    const child = findMockChild(String(params.childId));
    if (!child) return notFound('الطفل غير موجود.');
    if (user.role === 'Parent' && child.parentId !== user.id) return forbidden();
    const rows = rowsFor(child.id, null);
    const testsCount = rows.filter((row) => row.type === 'اختبارات').length;
    return HttpResponse.json({
      gamesCount: rows.length - testsCount,
      testsCount,
      totalCount: rows.length,
    });
  }),
  http.get(apiUrl('TrainingPlan/children/:childId/activities'), ({ request, params }) => {
    const user = currentUser(request);
    if (!user) return unauthorized();
    const child = findMockChild(String(params.childId));
    if (!child) return notFound('الطفل غير موجود.');
    if (user.role === 'Parent' && child.parentId !== user.id) return forbidden();
    return HttpResponse.json(rowsFor(child.id, new URL(request.url).searchParams.get('type')));
  }),
];
