import { http, HttpResponse, type HttpHandler } from 'msw';

import { mockId } from '../db';
import {
  MOCK_ACTIVITY_QUESTIONS,
  MOCK_ASSESSMENT_CATEGORIES,
  mockAssessmentSessions,
} from '../fixtures/assessmentQuestions';
import { findMockChild } from '../fixtures/children';
import { mockPlanActivities } from '../fixtures/planActivities';
import { apiUrl, currentUser, forbidden, requireRole, unauthorized } from '../http';

/*
 * Initial assessment. Mirrors Apidog: failures come back as HTTP 200 with `{ message }`.
 * Start response shape is an assumption (NOT LIVE-VERIFIED): `{ assessmentId, categories }`.
 */
const NOT_AVAILABLE = 'الطفل غير موجود أو لا يوجد تقييم أولي متاح.';
const CANNOT_ANSWER = 'لا يمكن إرسال الإجابة.';
const CANNOT_COMPLETE = 'لا يمكن إنهاء التقييم. تأكد من الإجابة على جميع الأسئلة.';

function hideAnswers(question: (typeof MOCK_ASSESSMENT_CATEGORIES)[number]['questions'][number]) {
  return {
    ...question,
    options: question.options.map(({ id, optionText, optionImageUrl }) => ({
      id,
      optionText,
      optionImageUrl,
    })),
  };
}

export const assessmentsHandlers: HttpHandler[] = [
  http.post(apiUrl('initial-assessment/:childId/start'), ({ request, params }) => {
    const user = requireRole(request, ['Parent']);
    if (user instanceof Response) return user;
    const child = findMockChild(String(params.childId));
    if (child?.parentId !== user.id) return HttpResponse.json({ message: NOT_AVAILABLE });
    const assessmentId = mockId();
    mockAssessmentSessions.set(assessmentId, {
      id: assessmentId,
      childId: child.id,
      questions: MOCK_ASSESSMENT_CATEGORIES.flatMap((category) => category.questions),
      answered: new Set(),
      completed: false,
    });
    return HttpResponse.json({
      assessmentId,
      categories: MOCK_ASSESSMENT_CATEGORIES.map((category) => ({
        name: category.name,
        questions: category.questions.map(hideAnswers),
      })),
    });
  }),

  http.post(apiUrl('initial-assessment/:assessmentId/answer'), async ({ request, params }) => {
    const user = requireRole(request, ['Parent']);
    if (user instanceof Response) return user;
    const session = mockAssessmentSessions.get(String(params.assessmentId));
    const body = (await request.json()) as { questionId?: string; selectedOptionId?: string };
    const question = session?.questions.find((item) => item.id === body.questionId);
    const optionExists = question?.options.some((option) => option.id === body.selectedOptionId);
    if (!session || session.completed || !question || !optionExists) {
      return HttpResponse.json({ message: CANNOT_ANSWER });
    }
    session.answered.add(question.id);
    // Live shape (verified 2026-10-07).
    return HttpResponse.json({ questionId: question.id, isCorrect: true });
  }),

  http.post(apiUrl('initial-assessment/:assessmentId/complete'), ({ request, params }) => {
    const user = requireRole(request, ['Parent']);
    if (user instanceof Response) return user;
    const session = mockAssessmentSessions.get(String(params.assessmentId));
    if (!session || session.answered.size < session.questions.length) {
      return HttpResponse.json({ message: CANNOT_COMPLETE });
    }
    session.completed = true;
    // Live (verified 2026-10-07): complete returns the result (and returns it again if repeated).
    return HttpResponse.json({
      childId: session.childId,
      childName: 'طفل تجريبي',
      parentId: user.id,
      parentName: user.fullName,
      overallScore: 75,
      categories: MOCK_ASSESSMENT_CATEGORIES.map((category, index) => ({
        categoryName: category.name,
        percentage: index % 2 === 0 ? 100 : 50,
      })),
    });
  }),
];

/**
 * `GET TrainingPlan/children/{childId}/activities/{activityId}` — registered here (owned by the
 * assessments/activities integration) because `trainingPlans.ts` does not cover it. Accepts
 * either the plan-row id or the activity id. Shape NOT LIVE-VERIFIED (Apidog shows only the
 * 200 `{ message }` "not in plan" case).
 */
export const planActivityDetailHandler = http.get(
  apiUrl('TrainingPlan/children/:childId/activities/:activityId'),
  ({ request, params }) => {
    const user = currentUser(request);
    if (!user) return unauthorized();
    const child = findMockChild(String(params.childId));
    if (!child) return HttpResponse.json({ message: 'النشاط غير موجود في الخطة التدريبية.' });
    if (user.role === 'Parent' && child.parentId !== user.id) return forbidden();
    const id = String(params.activityId);
    // Live: addressed by the catalogue `activityId`; response shape verified 2026-10-06.
    const row = mockPlanActivities.find(
      (item) => item.childId === child.id && item.activityId === id,
    );
    if (!row) return HttpResponse.json({ message: 'النشاط غير موجود في الخطة التدريبية.' });
    return HttpResponse.json({
      planActivityId: row.id,
      activityId: row.activityId,
      title: row.title,
      description: row.description,
      iconUrl: row.iconUrl,
      type: row.type,
      isCompleted: row.isCompleted,
      questions: MOCK_ACTIVITY_QUESTIONS[row.activityId] ?? [],
    });
  },
);

assessmentsHandlers.push(planActivityDetailHandler);
