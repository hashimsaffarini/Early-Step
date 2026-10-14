import { z } from 'zod';

import { toChoiceQuestionType, type ChoiceAnswer } from '@/components/players';
import { AppError } from '@/services/http/apiError';
import { httpClient } from '@/services/http/httpClient';

import type { AssessmentQuestion, StartedAssessment } from '../types';

/**
 * Initial assessment endpoints (Swagger `/api/initial-assessment/*`).
 *
 * - start (verified live): `{ assessmentId, categories: [{ id, name, order, questions: [{ id,
 *   questionText, questionImageUrl, type, order, options: [{ id, optionText, optionImageUrl }] }] }] }`.
 *   The parser stays lenient (flat `questions[]`, `id`, a `data` wrapper).
 * - Apidog shows failures returned as **HTTP 200 with `{ message }`** (e.g. "الطفل غير موجود أو
 *   لا يوجد تقييم أولي متاح."). A body with only a message is therefore treated as a failure for
 *   start, and the documented failure messages are treated as failures for answer/complete.
 */
export const ASSESSMENT_PATHS = {
  start: (childId: string) => `initial-assessment/${encodeURIComponent(childId)}/start`,
  answer: (assessmentId: string) => `initial-assessment/${encodeURIComponent(assessmentId)}/answer`,
  complete: (assessmentId: string) =>
    `initial-assessment/${encodeURIComponent(assessmentId)}/complete`,
} as const;

/** Failure messages documented in Apidog as 200 responses. */
const KNOWN_FAILURE_MESSAGES = [
  'الطفل غير موجود أو لا يوجد تقييم أولي متاح.',
  'لا يمكن إرسال الإجابة.',
  'لا يمكن إنهاء التقييم. تأكد من الإجابة على جميع الأسئلة.',
] as const;

const optionSchema = z.looseObject({
  id: z.string(),
  optionText: z.string().nullish(),
  text: z.string().nullish(),
  optionImageUrl: z.string().nullish(),
});

const questionSchema = z.looseObject({
  id: z.string(),
  questionText: z.string().nullish(),
  text: z.string().nullish(),
  questionImageUrl: z.string().nullish(),
  type: z.string().nullish(),
  categoryName: z.string().nullish(),
  options: z.array(optionSchema).nullish(),
});

const categorySchema = z.looseObject({
  name: z.string().nullish(),
  categoryName: z.string().nullish(),
  questions: z.array(questionSchema).nullish(),
});

const startSchema = z.looseObject({
  assessmentId: z.string().nullish(),
  id: z.string().nullish(),
  message: z.string().nullish(),
  questions: z.array(questionSchema).nullish(),
  categories: z.array(categorySchema).nullish(),
});

function mapQuestion(
  dto: z.infer<typeof questionSchema>,
  sectionTitle: string | null,
): AssessmentQuestion {
  return {
    id: dto.id,
    text: dto.questionText ?? dto.text ?? '',
    imageUrl: dto.questionImageUrl ?? null,
    type: toChoiceQuestionType(dto.type),
    options: (dto.options ?? []).map((option) => ({
      id: option.id,
      text: option.optionText ?? option.text ?? '',
      imageUrl: option.optionImageUrl ?? null,
    })),
    sectionTitle: dto.categoryName ?? sectionTitle,
  };
}

function failure(message: string, code: string): AppError {
  return new AppError(message, { kind: 'http', code });
}

const UNEXPECTED_START = 'تعذّر بدء التقييم: استجابة غير متوقعة من الخادم.';

export function parseStartResponse(data: unknown): StartedAssessment {
  const root: unknown =
    typeof data === 'object' && data !== null && 'data' in data ? data.data : data;
  const parsed = startSchema.safeParse(root);
  if (!parsed.success) throw failure(UNEXPECTED_START, 'UNEXPECTED_START_RESPONSE');
  const body = parsed.data;
  const assessmentId = body.assessmentId ?? body.id;
  if (!assessmentId) {
    throw failure(body.message ?? UNEXPECTED_START, 'ASSESSMENT_NOT_STARTED');
  }
  const fromCategories = (body.categories ?? []).flatMap((category) =>
    (category.questions ?? []).map((question) =>
      mapQuestion(question, category.name ?? category.categoryName ?? null),
    ),
  );
  const questions =
    fromCategories.length > 0
      ? fromCategories
      : (body.questions ?? []).map((question) => mapQuestion(question, null));
  return { assessmentId, questions };
}

/** Throws when a 200 response carries one of the documented failure messages. */
export function assertNotKnownFailure(data: unknown): void {
  if (typeof data !== 'object' || data === null) return;
  const message = (data as { message?: unknown }).message;
  if (
    typeof message === 'string' &&
    (KNOWN_FAILURE_MESSAGES as readonly string[]).includes(message)
  ) {
    throw failure(message, 'ASSESSMENT_REJECTED');
  }
}

export async function startAssessment(childId: string): Promise<StartedAssessment> {
  const { data } = await httpClient.post<unknown>(ASSESSMENT_PATHS.start(childId));
  return parseStartResponse(data);
}

export interface AnswerInput {
  assessmentId: string;
  answer: ChoiceAnswer;
}

/**
 * `SubmitInitialAssessmentAnswerRequest` — verified live 2026-10-14: `selectedOptionId`
 * (SingleChoice), `selectedOptionIds` (MultiSelect, exact set), `orderedOptionIds` (Sequence, exact
 * order); 200 `{ questionId, isCorrect }`. The result is not shown to the child.
 */
export async function submitAnswer(input: AnswerInput): Promise<void> {
  const { data } = await httpClient.post<unknown>(
    ASSESSMENT_PATHS.answer(input.assessmentId),
    input.answer,
  );
  assertNotKnownFailure(data);
}

/**
 * `complete` only completes the assessment (backend decision 2026-10-14): its body is not read.
 * The detailed result is for staff, from `GET initial-assessment/{childId}/result`.
 */
export async function completeAssessment(assessmentId: string): Promise<void> {
  const { data } = await httpClient.post<unknown>(ASSESSMENT_PATHS.complete(assessmentId));
  assertNotKnownFailure(data);
}
