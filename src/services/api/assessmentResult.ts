import { correctedQuestionText } from './questionContentCache';
import { z } from 'zod';

import { AppError } from '@/services/http/apiError';
import { httpClient } from '@/services/http/httpClient';
import { HTTP_STATUS } from '@/services/http/httpStatus';

/**
 * Initial-assessment result for staff (child profile). Verified live 2026-10-14:
 * `GET initial-assessment/{childId}/result` returns `{ childId, childName, parentId, parentName,
 * overallScore, assessmentId, categories: [{ categoryId, categoryName, percentage, totalQuestions,
 * correctAnswers, questions: [{ questionId, questionText, questionType, isCorrect,
 * childAnswers: [{ optionId, optionText, optionImageUrl }], correctAnswers: [...] }] }] }` (no
 * completion date). Readable by the child's assigned Specialist and Admin (Parent, Super Admin and an
 * unassigned specialist: 403 — 2026-10-15); before completion it answers 404 (plain text). The app
 * does not read the `complete` response.
 */
const resultOptionSchema = z.looseObject({
  optionId: z.string().nullish(),
  optionText: z.string().nullish(),
  optionImageUrl: z.string().nullish(),
});

const resultQuestionSchema = z.looseObject({
  questionId: z.string(),
  questionText: z.string().nullish(),
  questionType: z.string().nullish(),
  isCorrect: z.boolean().nullish(),
  childAnswers: z.array(resultOptionSchema).nullish(),
  correctAnswers: z.array(resultOptionSchema).nullish(),
});

export const assessmentResultSchema = z.looseObject({
  childId: z.string().nullish(),
  assessmentId: z.string().nullish(),
  overallScore: z.number(),
  categories: z
    .array(
      z.looseObject({
        categoryId: z.string().nullish(),
        categoryName: z.string().nullish(),
        percentage: z.number(),
        totalQuestions: z.number().nullish(),
        correctAnswers: z.number().nullish(),
        questions: z.array(resultQuestionSchema).nullish(),
      }),
    )
    .nullish(),
});

export interface AssessmentResultOption {
  id: string | null;
  text: string;
  imageUrl: string | null;
}

export interface AssessmentResultQuestion {
  id: string;
  text: string;
  /** Backend question type as sent (`SingleChoice`, `MultiSelect`, `Sequence`). */
  type: string | null;
  isCorrect: boolean | null;
  /** In the child's order (the order matters for Sequence). */
  childAnswers: AssessmentResultOption[];
  correctAnswers: AssessmentResultOption[];
}

export interface AssessmentResultCategory {
  name: string;
  percentage: number;
  /** Null when the server did not send them. */
  totalQuestions: number | null;
  correctAnswers: number | null;
  questions: AssessmentResultQuestion[];
}

export interface AssessmentResult {
  assessmentId: string | null;
  overallScore: number;
  categories: AssessmentResultCategory[];
}

function mapOption(dto: z.infer<typeof resultOptionSchema>): AssessmentResultOption {
  return {
    id: dto.optionId ?? null,
    text: dto.optionText?.trim() ?? '',
    imageUrl: dto.optionImageUrl ?? null,
  };
}

export function mapAssessmentResult(dto: z.infer<typeof assessmentResultSchema>): AssessmentResult {
  return {
    assessmentId: dto.assessmentId ?? null,
    overallScore: dto.overallScore,
    categories: (dto.categories ?? []).map((category) => {
      return {
        name: category.categoryName?.trim() ?? '',
        percentage: category.percentage,
        totalQuestions: category.totalQuestions ?? null,
        correctAnswers: category.correctAnswers ?? null,
        questions: (category.questions ?? []).map((question) => ({
          id: question.questionId,
          text: correctedQuestionText(question.questionText?.trim() ?? ''),
          type: question.questionType ?? null,
          isCorrect: question.isCorrect ?? null,
          childAnswers: (question.childAnswers ?? []).map(mapOption),
          correctAnswers: (question.correctAnswers ?? []).map(mapOption),
        })),
      };
    }),
  };
}

/** VERIFIED LIVE 2026-10-15: before completion → 404 `text/plain` with this text. */
const NO_RESULT_MESSAGE = 'No completed assessment found';

/**
 * `GET initial-assessment/{childId}/result` — null while the child has no completed assessment.
 * Only that exact 404 means "not completed"; any other 404 is a real error.
 */
export async function fetchAssessmentResult(childId: string): Promise<AssessmentResult | null> {
  try {
    const { data } = await httpClient.get<unknown>(
      `initial-assessment/${encodeURIComponent(childId)}/result`,
    );
    return mapAssessmentResult(assessmentResultSchema.parse(data));
  } catch (error) {
    if (
      error instanceof AppError &&
      error.status === HTTP_STATUS.NOT_FOUND &&
      error.message.includes(NO_RESULT_MESSAGE)
    ) {
      return null;
    }
    throw error;
  }
}
