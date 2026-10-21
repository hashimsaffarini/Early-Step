import { http, HttpResponse, type HttpHandler } from 'msw';

import { MOCK_USERS, mockId, type MockUser } from '../db';
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

/** Child-facing list item (VERIFIED LIVE shape). */
function childListItem(row: MockPlanActivityRow) {
  return {
    planActivityId: row.id,
    activityId: row.activityId,
    title: row.title,
    iconUrl: row.iconUrl,
    type: row.type,
    isCompleted: row.isCompleted,
  };
}

/** Specialist plan activity (VERIFIED LIVE shape). */
function specialistItem(row: MockPlanActivityRow) {
  const { id, childId: _childId, slug: _slug, ...rest } = row;
  return { trainingPlanActivityId: id, ...rest };
}

/** Training plans — response shapes mirror the live backend (verified 2026-10-06). */
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
    const type = new URL(request.url).searchParams.get('type');
    // Live: `type` is required.
    if (!type) {
      return HttpResponse.json(
        {
          title: 'One or more validation errors occurred.',
          status: 400,
          errors: { type: ['The type field is required.'] },
        },
        { status: 400 },
      );
    }
    return HttpResponse.json(rowsFor(child.id, type.toLowerCase()).map(childListItem));
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
    // Live: a child without a plan answers 404 with this message.
    if (rows.length === 0) return notFound('لا توجد خطة تدريبية لهذا الطفل.');
    // Live (2026-10-14): `progress` = % of completed activities; status `Completed` at 100.
    const progress = Math.round((rows.filter((row) => row.isCompleted).length * 100) / rows.length);
    return HttpResponse.json({
      id: `plan-${child.id}`,
      childId: child.id,
      childName: child.fullName,
      specialistId: child.specialistId,
      specialistName: child.specialistName,
      teacherId: child.teacherId,
      teacherName: child.teacherName,
      status: progress === 100 ? 'Completed' : 'Active',
      progress,
      activities: rows.map(specialistItem),
    });
  }),

  http.post(
    apiUrl('TrainingPlan/specialist/children/:childId/activities'),
    async ({ request, params }) => {
      const child = specialistChild(request, params.childId);
      if (child instanceof Response) return child;
      const body = (await request.json()) as { activityId?: string };
      const activity = MOCK_CATALOG_ACTIVITIES.find((item) => item.id === body.activityId);
      if (!activity) return notFound('النشاط غير موجود.');
      // Live (2026-10-14): the first activity creates the plan, but only once a teacher is
      // assigned; a duplicate is a 400 with a generic message.
      if (rowsFor(child.id, null).length === 0 && !child.teacherId) {
        return badRequest('يجب تعيين معلم للطفل قبل إنشاء الخطة التدريبية.');
      }
      if (rowsFor(child.id, null).some((row) => row.activityId === activity.id)) {
        return badRequest(
          'تعذر إضافة النشاط. تأكد أن الطفل تابع لك، وأن النشاط موجود وغير محذوف، وأنه غير مضاف مسبقًا.',
        );
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
      return HttpResponse.json({
        message: 'تمت إضافة النشاط إلى الخطة التدريبية بنجاح.',
        activity: specialistItem(row),
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
      // Live (2026-10-14): an activity with a submitted result is kept (product rule); the server
      // answers an empty 500 instead of a descriptive 400/409.
      if (mockPlanActivities[index]?.isCompleted) return new HttpResponse(null, { status: 500 });
      mockPlanActivities.splice(index, 1);
      return HttpResponse.json({ message: 'تمت إزالة النشاط من الخطة التدريبية.' });
    },
  ),
];

/** Teachers a specialist can assign (VERIFIED LIVE shape: `[{ id, fullName }]`). */
trainingPlansHandlers.push(
  http.get(apiUrl('specialist/teachers'), ({ request }) => {
    const user = requireRole(request, ['Specialist']);
    if (user instanceof Response) return user;
    return HttpResponse.json(
      MOCK_USERS.filter((candidate) => candidate.role === 'Teacher').map((teacher) => ({
        id: teacher.id,
        fullName: teacher.fullName,
      })),
    );
  }),
  http.post(apiUrl('specialist/assign-teacher'), async ({ request }) => {
    const user = requireRole(request, ['Specialist']);
    if (user instanceof Response) return user;
    const body = (await request.json()) as { teacherId?: string; childIds?: string[] };
    const teacher = MOCK_USERS.find((c) => c.id === body.teacherId && c.role === 'Teacher');
    if (!teacher) return notFound('المعلم غير موجود.');
    for (const childId of body.childIds ?? []) {
      const child = findMockChild(childId);
      if (child?.specialistId !== user.id) return forbidden();
      child.teacherId = teacher.id;
      child.teacherName = teacher.fullName;
    }
    return HttpResponse.json({ message: 'تم تعيين المعلم بنجاح.' });
  }),
);
