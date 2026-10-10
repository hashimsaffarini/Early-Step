import { http, HttpResponse, type HttpHandler } from 'msw';

import { mockId } from '../db';
import {
  MOCK_ACTIVITY_QUESTIONS,
  MOCK_ASSESSMENT_CATEGORIES,
  mockAssessmentSessions,
  type MockQuestion,
} from '../fixtures/assessmentQuestions';
import { findMockChild } from '../fixtures/children';
import { mockPlanActivities } from '../fixtures/planActivities';
import { apiUrl, currentUser, forbidden, notFound, requireRole, unauthorized } from '../http';

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
    return HttpResponse.json(mockResult(session.childId));
  }),

  // Live (verified 2026-10-10): same object as `complete`; 404 plain text until completed.
  http.get(apiUrl('initial-assessment/:childId/result'), ({ request, params }) => {
    const user = currentUser(request);
    if (!user) return unauthorized();
    const child = findMockChild(String(params.childId));
    if (user.role === 'Parent' && child?.parentId !== user.id) return forbidden();
    const completed = [...mockAssessmentSessions.values()].some(
      (session) => session.childId === params.childId && session.completed,
    );
    if (!completed) {
      return new HttpResponse('No completed assessment found for this child.', { status: 404 });
    }
    return HttpResponse.json(mockResult(String(params.childId)));
  }),
];

function mockResult(childId: string) {
  return {
    childId,
    childName: findMockChild(childId)?.fullName ?? 'طفل تجريبي',
    parentId: 'u-parent',
    parentName: 'محمد أحمد',
    overallScore: 75,
    categories: MOCK_ASSESSMENT_CATEGORIES.map((category, index) => ({
      categoryName: category.name,
      percentage: index % 2 === 0 ? 100 : 50,
    })),
  };
}

/**
 * `GET TrainingPlan/children/{childId}/activities/{activityId}` — registered here (owned by the
 * assessments/activities integration) because `trainingPlans.ts` does not cover it. Addressed by
 * the catalogue `activityId`; live shape (verified) with answers hidden.
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
      questions: (MOCK_ACTIVITY_QUESTIONS[row.activityId] ?? []).map(toChildQuestion),
    });
  },
);

assessmentsHandlers.push(planActivityDetailHandler);

interface MockActivityAnswer {
  questionId?: string;
  selectedOptionId?: string | null;
  selectedOptionIds?: string[] | null;
  orderedOptionIds?: string[] | null;
}

/** Correct when the chosen option(s) are exactly the correct ones (verified live 2026-10-10). */
function isMockAnswerCorrect(question: MockQuestion, answer: MockActivityAnswer): boolean {
  const chosen =
    answer.selectedOptionIds ?? (answer.selectedOptionId ? [answer.selectedOptionId] : []);
  const correct = question.options.filter((option) => option.isCorrect).map((option) => option.id);
  return chosen.length === correct.length && chosen.every((id) => correct.includes(id));
}

/**
 * `POST TrainingPlan/children/{childId}/activities/{planActivityId}/submit` — live (2026-10-10):
 * 200 `{ message }`; counts saved on the plan row; unanswered questions are not counted; a second
 * submit (or an empty list) is an empty 500.
 */
assessmentsHandlers.push(
  http.post(
    apiUrl('TrainingPlan/children/:childId/activities/:planActivityId/submit'),
    async ({ request, params }) => {
      const user = currentUser(request);
      if (!user) return unauthorized();
      if (user.role !== 'Parent') return forbidden();
      const child = findMockChild(String(params.childId));
      if (child?.parentId !== user.id) return forbidden();
      const row = mockPlanActivities.find(
        (item) => item.childId === params.childId && item.id === params.planActivityId,
      );
      if (!row) return notFound('النشاط غير موجود في الخطة التدريبية.');
      const body = (await request.json()) as { answers?: MockActivityAnswer[] };
      const answers = body.answers ?? [];
      if (row.isCompleted || answers.length === 0) return new HttpResponse(null, { status: 500 });
      const questions = MOCK_ACTIVITY_QUESTIONS[row.activityId] ?? [];
      const correct = answers.filter((answer) => {
        const question = questions.find((item) => item.id === answer.questionId);
        return question ? isMockAnswerCorrect(question, answer) : false;
      }).length;
      row.correctAnswers = correct;
      row.wrongAnswers = answers.length - correct;
      row.isCompleted = true;
      row.completedAt = new Date().toISOString();
      return HttpResponse.json({ message: 'Activity submitted successfully.' });
    },
  ),
);

/** Live child-facing question shape (verified 2026-10-07): no `id`, answers hidden. */
function toChildQuestion(question: MockQuestion, index: number) {
  return {
    planQuestionId: `plan-${question.id}`,
    questionId: question.id,
    questionText: question.questionText,
    questionImageUrl: question.questionImageUrl,
    type: question.type,
    order: index + 1,
    options: question.options.map((option, optionIndex) => ({
      id: option.id,
      optionText: option.optionText,
      optionImageUrl: option.optionImageUrl,
      order: optionIndex + 1,
      correctOrder: null,
      pairKey: null,
    })),
  };
}
