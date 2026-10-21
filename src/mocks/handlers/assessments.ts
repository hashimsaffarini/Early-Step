import { http, HttpResponse, type HttpHandler } from 'msw';

import { mockId, registerMockTable } from '../db';
import {
  isMockAnswerCorrect,
  MOCK_ACTIVITY_QUESTIONS,
  MOCK_ASSESSMENT_QUESTIONS,
  mockAssessmentSessions,
  type MockAssessmentSession,
  type MockQuestion,
} from '../fixtures/assessmentQuestions';
import { findMockChild } from '../fixtures/children';
import { mockCategories } from '../fixtures/content';
import { mockPlanActivities } from '../fixtures/planActivities';
import {
  apiUrl,
  badRequest,
  currentUser,
  forbidden,
  notFound,
  requireRole,
  unauthorized,
} from '../http';

/*
 * Initial assessment, live shapes (verified 2026-10-14). Apidog documents some failures as HTTP 200
 * with `{ message }`; those are kept for start/answer/complete.
 */
const NOT_AVAILABLE = 'الطفل غير موجود أو لا يوجد تقييم أولي متاح.';
const CANNOT_ANSWER = 'لا يمكن إرسال الإجابة.';
const CANNOT_COMPLETE = 'لا يمكن إنهاء التقييم. تأكد من الإجابة على جميع الأسئلة.';

interface MockAnswerBody {
  questionId?: string;
  selectedOptionId?: string | null;
  selectedOptionIds?: string[] | null;
  orderedOptionIds?: string[] | null;
}

/** The option ids of an answer, in the child's order (one field per question type). */
function chosenIds(answer: MockAnswerBody): string[] {
  return (
    answer.orderedOptionIds ??
    answer.selectedOptionIds ??
    (answer.selectedOptionId ? [answer.selectedOptionId] : [])
  );
}

function hideAnswers(question: MockQuestion) {
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
    // The categories in the assessment (admin membership), with their questions.
    const sections = mockCategories
      .filter((category) => category.isInInitialAssessment && !category.isDeleted)
      .map((category) => ({
        id: category.id,
        name: category.name,
        questions: MOCK_ASSESSMENT_QUESTIONS[category.id] ?? [],
      }));
    mockAssessmentSessions.set(assessmentId, {
      id: assessmentId,
      childId: child.id,
      sections,
      questions: sections.flatMap((section) => section.questions),
      answers: new Map(),
      completed: false,
    });
    // Live shape (verified 2026-10-14): `categories: [{ id, name, order, questions }]`.
    return HttpResponse.json({
      assessmentId,
      categories: sections.map((section, index) => ({
        id: section.id,
        name: section.name,
        order: index + 1,
        questions: section.questions.map(hideAnswers),
      })),
    });
  }),

  http.post(apiUrl('initial-assessment/:assessmentId/answer'), async ({ request, params }) => {
    const user = requireRole(request, ['Parent']);
    if (user instanceof Response) return user;
    const session = mockAssessmentSessions.get(String(params.assessmentId));
    const body = (await request.json()) as MockAnswerBody;
    const question = session?.questions.find((item) => item.id === body.questionId);
    const ids = chosenIds(body);
    const optionsExist =
      ids.length > 0 && ids.every((id) => question?.options.some((option) => option.id === id));
    if (!session || session.completed || !question || !optionsExist) {
      return HttpResponse.json({ message: CANNOT_ANSWER });
    }
    if (session.answers.has(question.id)) {
      return badRequest('This question has already been answered.');
    }
    const isCorrect = isMockAnswerCorrect(question, ids);
    session.answers.set(question.id, { optionIds: ids, isCorrect });
    // Live shape (verified 2026-10-14).
    return HttpResponse.json({ questionId: question.id, isCorrect });
  }),

  http.post(apiUrl('initial-assessment/:assessmentId/complete'), ({ request, params }) => {
    const user = requireRole(request, ['Parent']);
    if (user instanceof Response) return user;
    const session = mockAssessmentSessions.get(String(params.assessmentId));
    if (!session || session.answers.size < session.questions.length) {
      return HttpResponse.json({ message: CANNOT_COMPLETE });
    }
    session.completed = true;
    // Live (2026-10-14): complete returns the result without counts or question details.
    return HttpResponse.json(mockResult(session, false));
  }),

  // Live (2026-10-14): staff only — Specialist and Admin (the parent does not reopen the result,
  // product decision); counts and per-question details filled; 404 plain text until completed.
  http.get(apiUrl('initial-assessment/:childId/result'), ({ request, params }) => {
    const user = requireRole(request, ['Specialist', 'Admin']);
    if (user instanceof Response) return user;
    const session = [...mockAssessmentSessions.values()].find(
      (item) => item.childId === params.childId && item.completed,
    );
    if (!session) {
      return new HttpResponse('No completed assessment found for this child.', { status: 404 });
    }
    return HttpResponse.json(mockResult(session, true));
  }),
];

const percent = (part: number, total: number) => (total === 0 ? 0 : (part * 100) / total);

function option(item: MockQuestion['options'][number]) {
  return { optionId: item.id, optionText: item.optionText, optionImageUrl: item.optionImageUrl };
}

function correctOptions(question: MockQuestion) {
  if (question.type === 'Sequence') {
    return [...question.options]
      .sort((a, b) => (a.correctOrder ?? 0) - (b.correctOrder ?? 0))
      .map(option);
  }
  return question.options.filter((item) => item.isCorrect).map(option);
}

function mockResult(session: MockAssessmentSession, withDetails: boolean) {
  const verdict = (id: string) => session.answers.get(id)?.isCorrect ?? false;
  const all = session.questions;
  return {
    childId: session.childId,
    childName: findMockChild(session.childId)?.fullName ?? 'طفل تجريبي',
    parentId: 'u-parent',
    parentName: 'محمد أحمد',
    overallScore: percent(all.filter((question) => verdict(question.id)).length, all.length),
    categories: session.sections.map((category) => {
      const correct = category.questions.filter((question) => verdict(question.id)).length;
      return {
        categoryId: category.id,
        categoryName: category.name,
        percentage: Math.round(percent(correct, category.questions.length)),
        totalQuestions: withDetails ? category.questions.length : 0,
        correctAnswers: withDetails ? correct : 0,
        questions: withDetails
          ? category.questions.map((question) => ({
              questionId: question.id,
              questionText: question.questionText,
              questionType: question.type,
              isCorrect: verdict(question.id),
              childAnswers: (session.answers.get(question.id)?.optionIds ?? []).map((id) => {
                const chosen = question.options.find((item) => item.id === id);
                return chosen
                  ? option(chosen)
                  : { optionId: id, optionText: '', optionImageUrl: null };
              }),
              correctAnswers: correctOptions(question),
            }))
          : [],
      };
    }),
    assessmentId: session.id,
  };
}

/**
 * `GET TrainingPlan/children/{childId}/activities/{activityId}` — registered here (owned by the
 * assessments/activities integration) because `trainingPlans.ts` does not cover it. Addressed by
 * the catalogue `activityId`; live shape (verified) with answers hidden.
 */
const notInPlan = () =>
  HttpResponse.json({ message: 'النشاط غير موجود في الخطة التدريبية.' }, { status: 404 });

export const planActivityDetailHandler = http.get(
  apiUrl('TrainingPlan/children/:childId/activities/:activityId'),
  ({ request, params }) => {
    const user = currentUser(request);
    if (!user) return unauthorized();
    const child = findMockChild(String(params.childId));
    if (!child) return notInPlan();
    if (user.role === 'Parent' && child.parentId !== user.id) return forbidden();
    const id = String(params.activityId);
    // Live: addressed by the catalogue `activityId`; shape verified 2026-10-06; missing → 404 (10-15).
    const row = mockPlanActivities.find(
      (item) => item.childId === child.id && item.activityId === id,
    );
    if (!row) return notInPlan();
    return HttpResponse.json({
      planActivityId: row.id,
      activityId: row.activityId,
      title: row.title,
      description: row.description,
      iconUrl: row.iconUrl,
      type: row.type,
      isCompleted: row.isCompleted,
      // Requested backend field (not returned live yet): the game template slug.
      ...(row.slug ? { slug: row.slug } : {}),
      questions: (MOCK_ACTIVITY_QUESTIONS[row.activityId] ?? []).map(toChildQuestion),
    });
  },
);

assessmentsHandlers.push(planActivityDetailHandler);

/** Saved plan answers (for the result endpoint), keyed by plan activity id. */
const planAnswers = new Map<string, Map<string, { optionIds: string[]; isCorrect: boolean }>>();
registerMockTable(() => {
  planAnswers.clear();
});

/**
 * `POST TrainingPlan/children/{childId}/activities/{planActivityId}/submit` — live (2026-10-14):
 * 200 `{ message }`; score/counts saved on the plan row; every question must be answered (400),
 * empty answers → 400, a second submit → 409.
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
      const body = (await request.json()) as { answers?: MockAnswerBody[] };
      const answers = body.answers ?? [];
      if (row.isCompleted) {
        return HttpResponse.json({ message: 'تم إرسال نتيجة هذا النشاط مسبقًا.' }, { status: 409 });
      }
      if (answers.length === 0) return badRequest('يجب إرسال إجابة واحدة على الأقل.');
      const questions = MOCK_ACTIVITY_QUESTIONS[row.activityId] ?? [];
      if (questions.some((question) => !answers.some((a) => a.questionId === question.id))) {
        return badRequest('All activity questions must be answered.');
      }
      const saved = new Map<string, { optionIds: string[]; isCorrect: boolean }>();
      for (const question of questions) {
        const answer = answers.find((item) => item.questionId === question.id) ?? {};
        const optionIds = chosenIds(answer);
        saved.set(question.id, { optionIds, isCorrect: isMockAnswerCorrect(question, optionIds) });
      }
      planAnswers.set(row.id, saved);
      const correct = [...saved.values()].filter((item) => item.isCorrect).length;
      row.correctAnswers = correct;
      row.wrongAnswers = questions.length - correct;
      row.score = Math.round(percent(correct, questions.length));
      row.isCompleted = true;
      row.completedAt = new Date().toISOString();
      return HttpResponse.json({ message: 'تم إرسال إجابات النشاط بنجاح.' });
    },
  ),
);

/**
 * `GET TrainingPlan/children/{childId}/activities/{planActivityId}/result` — live (2026-10-14):
 * Specialist only (Parent, Admin, Super Admin 403); 404 `{ message }` before the submission.
 */
assessmentsHandlers.push(
  http.get(
    apiUrl('TrainingPlan/children/:childId/activities/:planActivityId/result'),
    ({ request, params }) => {
      const user = requireRole(request, ['Specialist']);
      if (user instanceof Response) return user;
      const row = mockPlanActivities.find(
        (item) => item.childId === params.childId && item.id === params.planActivityId,
      );
      if (!row) return notFound('النشاط غير موجود في الخطة التدريبية.');
      if (!row.isCompleted) return notFound('لم يتم إرسال نتيجة هذا النشاط بعد.');
      const saved = planAnswers.get(row.id);
      const { id, childId: _childId, ...rest } = row;
      return HttpResponse.json({
        trainingPlanActivityId: id,
        ...rest,
        // Seeded completed rows have no saved answers: counts only.
        questions: (saved ? (MOCK_ACTIVITY_QUESTIONS[row.activityId] ?? []) : []).map(
          (question) => {
            const answer = saved?.get(question.id);
            return {
              questionId: question.id,
              questionText: question.questionText,
              questionImageUrl: question.questionImageUrl,
              type: question.type,
              selectedOptions: (answer?.optionIds ?? []).map((optionId) => {
                const chosen = question.options.find((item) => item.id === optionId);
                return {
                  id: optionId,
                  optionText: chosen?.optionText ?? '',
                  optionImageUrl: chosen?.optionImageUrl ?? null,
                };
              }),
              isCorrect: answer?.isCorrect ?? false,
            };
          },
        ),
      });
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
