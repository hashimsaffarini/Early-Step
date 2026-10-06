import { http, HttpResponse, type HttpHandler } from 'msw';

import { mockId, type MockUser } from '../db';
import { findMockChild, type MockChildRow } from '../fixtures/children';
import {
  MOCK_CATALOG_ACTIVITIES,
  mockPlanActivities,
  type MockPlanActivityRow,
} from '../fixtures/planActivities';
import {
  apiUrl,
  badRequest,
  currentUser,
  forbidden,
  notFound,
  requireRole,
  unauthorized,
} from '../http';

const TEST_TYPE = 'اختبارات';

function rowsFor(childId: string, type: string | null) {
  return mockPlanActivities
    .filter((row) => row.childId === childId)
    .filter((row) => !type || (type === 'test') === (row.type === TEST_TYPE))
    .sort((a, b) => a.order - b.order);
}

/** Reads of `TrainingPlan/children/*`: parents only their own children, teachers/specialists theirs. */
function canRead(user: MockUser, child: MockChildRow): boolean {
  if (user.role === 'Parent') return child.parentId === user.id;
  if (user.role === 'Teacher') return child.teacherId === user.id;
  if (user.role === 'Specialist') return child.specialistId === user.id;
  return true;
}

/** Specialist endpoints: the child must be assigned to this specialist. */
function specialistChild(request: Request, childId: unknown): MockChildRow | Response {
  const user = requireRole(request, ['Specialist']);
  if (user instanceof Response) return user;
  const child = findMockChild(String(childId));
  if (!child) return notFound('الطفل غير موجود.');
  if (child.specialistId !== user.id) return forbidden();
  return child;
}

/** Training plans. Shapes from Apidog examples; NOT LIVE-VERIFIED. */
export const trainingPlansHandlers: HttpHandler[] = [
  http.get(apiUrl('TrainingPlan/children/:childId/activities/summary'), ({ request, params }) => {
    const user = currentUser(request);
    if (!user) return unauthorized();
    const child = findMockChild(String(params.childId));
    if (!child) return notFound('الطفل غير موجود.');
    if (!canRead(user, child)) return forbidden();
    const rows = rowsFor(child.id, null);
    const testsCount = rows.filter((row) => row.type === TEST_TYPE).length;
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
    if (!canRead(user, child)) return forbidden();
    return HttpResponse.json(rowsFor(child.id, new URL(request.url).searchParams.get('type')));
  }),

  http.get(
    apiUrl('TrainingPlan/specialist/children/:childId/available-activities'),
    ({ request, params }) => {
      const child = specialistChild(request, params.childId);
      if (child instanceof Response) return child;
      const type = new URL(request.url).searchParams.get('type');
      const assigned = new Set(rowsFor(child.id, null).map((row) => row.activityId));
      return HttpResponse.json(
        MOCK_CATALOG_ACTIVITIES.filter(
          (item) => !type || (type === 'test') === (item.type === TEST_TYPE),
        ).map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          iconUrl: null,
          type: item.type,
          categoryId: item.categoryId,
          categoryName: item.categoryName,
          isAssigned: assigned.has(item.id),
          questionCount: item.questionCount,
        })),
      );
    },
  ),

  http.get(apiUrl('TrainingPlan/specialist/children/:childId'), ({ request, params }) => {
    const child = specialistChild(request, params.childId);
    if (child instanceof Response) return child;
    const rows = rowsFor(child.id, null);
    // Live backend (Apidog example) answers with a message when the child has no plan.
    if (rows.length === 0) return HttpResponse.json({ message: 'لا توجد خطة تدريبية لهذا الطفل.' });
    return HttpResponse.json({ childId: child.id, activities: rows });
  }),

  http.post(
    apiUrl('TrainingPlan/specialist/children/:childId/activities'),
    async ({ request, params }) => {
      const child = specialistChild(request, params.childId);
      if (child instanceof Response) return child;
      const body = (await request.json()) as { activityId?: string };
      const activity = MOCK_CATALOG_ACTIVITIES.find((item) => item.id === body.activityId);
      if (!activity) return notFound('النشاط غير موجود.');
      if (rowsFor(child.id, null).some((row) => row.activityId === activity.id)) {
        return badRequest('النشاط موجود بالفعل في الخطة التدريبية.');
      }
      const row: MockPlanActivityRow = {
        id: mockId(),
        childId: child.id,
        activityId: activity.id,
        title: activity.title,
        description: activity.description,
        iconUrl: null,
        type: activity.type,
        order: rowsFor(child.id, null).length + 1,
        assignedAt: new Date().toISOString(),
        score: null,
        correctAnswers: null,
        wrongAnswers: null,
        isCompleted: false,
        completedAt: null,
      };
      mockPlanActivities.push(row);
      const { childId: _childId, ...activityDto } = row;
      return HttpResponse.json({
        message: 'تمت إضافة النشاط إلى الخطة التدريبية بنجاح.',
        activity: activityDto,
      });
    },
  ),

  http.delete(
    apiUrl('TrainingPlan/specialist/children/:childId/activities/:activityId'),
    ({ request, params }) => {
      const child = specialistChild(request, params.childId);
      if (child instanceof Response) return child;
      const index = mockPlanActivities.findIndex(
        (row) => row.childId === child.id && row.activityId === params.activityId,
      );
      if (index === -1) return notFound('النشاط غير موجود في الخطة التدريبية.');
      mockPlanActivities.splice(index, 1);
      return HttpResponse.json({ message: 'تمت إزالة النشاط من الخطة التدريبية.' });
    },
  ),
];
