import { z } from 'zod';

import { toChoiceQuestionType, type ChoiceAnswer } from '@/components/players';
import { AppError } from '@/services/http/apiError';
import { httpClient } from '@/services/http/httpClient';

import type { AssessmentCategory, AssessmentQuestion, StartedAssessment } from '../types';

/**
 * Initial assessment endpoints (Swagger `/api/initial-assessment/*`), live contracts:
 * - start (verified live 2026-10-14): `{ assessmentId, categories: [{ id, name, order, questions:
 *   [{ id, questionText, questionImageUrl, type, order, options: [{ id, optionText,
 *   optionImageUrl }] }] }] }`. Failures are real HTTP errors (e.g. 404 after completion).
 * - answer / complete: failures are 400 with `{ message }` (no 200-with-message failures).
 */
export const ASSESSMENT_PATHS = {
  categories: 'initial-assessment/categories',
  start: (childId: string) => `initial-assessment/${encodeURIComponent(childId)}/start`,
  answer: (assessmentId: string) => `initial-assessment/${encodeURIComponent(assessmentId)}/answer`,
  complete: (assessmentId: string) =>
    `initial-assessment/${encodeURIComponent(assessmentId)}/complete`,
} as const;

const optionSchema = z.looseObject({
  id: z.string(),
  optionText: z.string().nullish(),
  optionImageUrl: z.string().nullish(),
});

const questionSchema = z.looseObject({
  id: z.string(),
  questionText: z.string().nullish(),
  questionImageUrl: z.string().nullish(),
  type: z.string().nullish(),
  options: z.array(optionSchema).nullish(),
});

const startSchema = z.looseObject({
  assessmentId: z.string(),
  categories: z.array(
    z.looseObject({
      id: z.string().nullish(),
      name: z.string().nullish(),
      questions: z.array(questionSchema).nullish(),
    }),
  ),
});

function mapQuestion(
  dto: z.infer<typeof questionSchema>,
  section: { id: string | null; title: string | null },
): AssessmentQuestion {
  return {
    id: dto.id,
    text: dto.questionText ?? '',
    imageUrl: dto.questionImageUrl ?? null,
    type: toChoiceQuestionType(dto.type),
    options: (dto.options ?? []).map((option) => ({
      id: option.id,
      text: option.optionText ?? '',
      imageUrl: option.optionImageUrl ?? null,
    })),
    sectionTitle: section.title,
    categoryId: section.id,
  };
}

const UNEXPECTED_START = 'تعذّر بدء التقييم: استجابة غير متوقعة من الخادم.';

export function parseStartResponse(data: unknown): StartedAssessment {
  const parsed = startSchema.safeParse(data);
  if (!parsed.success) {
    throw new AppError(UNEXPECTED_START, { kind: 'http', code: 'UNEXPECTED_START_RESPONSE' });
  }
  const { assessmentId, categories } = parsed.data;
  const questions = categories.flatMap((category) =>
    (category.questions ?? []).map((question) =>
      mapQuestion(question, { id: category.id ?? null, title: category.name ?? null }),
    ),
  );
  return { assessmentId, questions };
}

/**
 * `GET initial-assessment/categories` — verified live 2026-10-16 for the Parent (read-only, creates
 * nothing): `{ categories: [{ id, name, order }] }`. `description` / `iconUrl` are read only if the
 * server ever sends them; nothing is invented when it does not.
 */
const categoriesSchema = z.looseObject({
  categories: z.array(
    z.looseObject({
      id: z.string(),
      name: z.string().nullish(),
      order: z.number().nullish(),
      description: z.string().nullish(),
      iconUrl: z.string().nullish(),
    }),
  ),
});

function nonBlank(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : null;
}

export function parseCategoriesResponse(data: unknown): AssessmentCategory[] {
  return [...categoriesSchema.parse(data).categories]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((dto) => ({
      id: dto.id,
      name: nonBlank(dto.name) ?? 'تصنيف',
      description: nonBlank(dto.description),
      iconUrl: dto.iconUrl ?? null,
    }));
}

export async function fetchAssessmentCategories(): Promise<AssessmentCategory[]> {
  const { data } = await httpClient.get<unknown>(ASSESSMENT_PATHS.categories);
  return parseCategoriesResponse(data);
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
  await httpClient.post(ASSESSMENT_PATHS.answer(input.assessmentId), input.answer);
}

/**
 * `complete` only completes the assessment (backend decision 2026-10-14): its body is not read.
 * The detailed result is for staff, from `GET initial-assessment/{childId}/result`.
 */
export async function completeAssessment(assessmentId: string): Promise<void> {
  await httpClient.post(ASSESSMENT_PATHS.complete(assessmentId));
}
