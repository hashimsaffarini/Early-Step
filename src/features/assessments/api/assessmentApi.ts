import { z } from 'zod';

import { AppError } from '@/services/http/apiError';
import { httpClient } from '@/services/http/httpClient';

import type { AssessmentQuestion, AssessmentQuestionType, StartedAssessment } from '../types';

/**
 * Initial assessment endpoints (Swagger `/api/initial-assessment/*`).
 *
 * ⚠️ Response shapes are NOT LIVE-VERIFIED:
 * - start: undocumented. Accepted: an assessment id (`assessmentId` | `id`) with `questions[]`,
 *   or questions grouped under `categories[]` (`{ name, questions }`), optionally wrapped in
 *   `data`. Question fields follow the admin question model (`questionText`, `questionImageUrl`,
 *   `type`, `options[{ id, optionText, optionImageUrl }]`).
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

const QUESTION_TYPES: readonly AssessmentQuestionType[] = [
  'SingleChoice',
  'MultiSelect',
  'Sequence',
  'Matching',
];

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

function toQuestionType(value: string | null | undefined): AssessmentQuestionType | null {
  return QUESTION_TYPES.find((type) => type.toLowerCase() === value?.toLowerCase()) ?? null;
}

function mapQuestion(
  dto: z.infer<typeof questionSchema>,
  sectionTitle: string | null,
): AssessmentQuestion {
  return {
    id: dto.id,
    text: dto.questionText ?? dto.text ?? '',
    imageUrl: dto.questionImageUrl ?? null,
    type: toQuestionType(dto.type),
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
  questionId: string;
  selectedOptionId: string;
}

/** `{ questionId, selectedOptionId }` — one option per question (Swagger). */
export async function submitAnswer(input: AnswerInput): Promise<void> {
  const { data } = await httpClient.post<unknown>(ASSESSMENT_PATHS.answer(input.assessmentId), {
    questionId: input.questionId,
    selectedOptionId: input.selectedOptionId,
  });
  assertNotKnownFailure(data);
}

/**
 * VERIFIED LIVE (2026-10-07): `complete` returns the result —
 * `{ childId, childName, parentId, parentName, overallScore, categories: [{ categoryName, percentage }] }`
 * — and returns the same result when called again. There is no GET endpoint to read it later
 * (requested from the backend).
 */
const assessmentResultSchema = z.looseObject({
  overallScore: z.number(),
  categories: z
    .array(z.looseObject({ categoryName: z.string().nullish(), percentage: z.number() }))
    .nullish(),
});

export interface AssessmentResult {
  overallScore: number;
  categories: { name: string; percentage: number }[];
}

export async function completeAssessment(assessmentId: string): Promise<AssessmentResult | null> {
  const { data } = await httpClient.post<unknown>(ASSESSMENT_PATHS.complete(assessmentId));
  assertNotKnownFailure(data);
  const parsed = assessmentResultSchema.safeParse(data);
  if (!parsed.success) return null;
  return {
    overallScore: parsed.data.overallScore,
    categories: (parsed.data.categories ?? []).map((category) => ({
      name: category.categoryName?.trim() ?? '',
      percentage: category.percentage,
    })),
  };
}
