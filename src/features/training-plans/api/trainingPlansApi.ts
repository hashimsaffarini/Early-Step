import { z } from 'zod';

import { normalizeActivityType, type ActivityType } from '@/services/api/activityType';
import {
  mapPlanActivity,
  planActivityDtoSchema,
  type PlanActivity,
} from '@/services/api/childPlan';
import { AppError } from '@/services/http/apiError';
import { httpClient } from '@/services/http/httpClient';
import { HTTP_STATUS } from '@/services/http/httpStatus';

const childBase = (childId: string) =>
  `TrainingPlan/specialist/children/${encodeURIComponent(childId)}`;

export const TRAINING_PLAN_PATHS = {
  specialistPlan: childBase,
  available: (childId: string) => `${childBase(childId)}/available-activities`,
  activities: (childId: string) => `${childBase(childId)}/activities`,
  activity: (childId: string, activityId: string) =>
    `${childBase(childId)}/activities/${encodeURIComponent(activityId)}`,
} as const;

export interface SpecialistPlan {
  /** False when the backend answers 404 "لا توجد خطة تدريبية لهذا الطفل." (no plan yet). */
  hasPlan: boolean;
  /** Plan status as sent by the backend (live values: `Active`, `Completed`). */
  status: string | null;
  /** Server-computed % of completed activities. */
  progress: number | null;
  teacherId: string | null;
  teacherName: string | null;
  activities: PlanActivity[];
}

/** VERIFIED LIVE (2026-10-06): the specialist plan object. */
const planSchema = z.looseObject({
  id: z.string(),
  childId: z.string(),
  childName: z.string().nullish(),
  specialistId: z.string().nullish(),
  specialistName: z.string().nullish(),
  teacherId: z.string().nullish(),
  teacherName: z.string().nullish(),
  status: z.string().nullish(),
  /** % of completed activities (verified 2026-10-14; status becomes `Completed` at 100). */
  progress: z.number().nullish(),
  activities: z.array(planActivityDtoSchema),
});

const NO_PLAN: SpecialistPlan = {
  hasPlan: false,
  status: null,
  progress: null,
  teacherId: null,
  teacherName: null,
  activities: [],
};

export function parseSpecialistPlan(data: unknown): SpecialistPlan {
  const plan = planSchema.parse(data);
  return {
    hasPlan: true,
    status: plan.status ?? null,
    progress: plan.progress ?? null,
    teacherId: plan.teacherId ?? null,
    teacherName: plan.teacherName ?? null,
    activities: plan.activities.map(mapPlanActivity),
  };
}

const NO_PLAN_MESSAGE = 'لا توجد خطة تدريبية';

/** `GET TrainingPlan/specialist/children/{childId}` — 404 + "no plan" message → `hasPlan: false`. */
export async function fetchSpecialistPlan(childId: string): Promise<SpecialistPlan> {
  try {
    const { data } = await httpClient.get<unknown>(TRAINING_PLAN_PATHS.specialistPlan(childId));
    return parseSpecialistPlan(data);
  } catch (error) {
    if (
      error instanceof AppError &&
      error.status === HTTP_STATUS.NOT_FOUND &&
      error.message.includes(NO_PLAN_MESSAGE)
    ) {
      return NO_PLAN;
    }
    throw error;
  }
}

/** Available-activity item — VERIFIED LIVE (2026-10-06). */
const availableActivitySchema = z.looseObject({
  id: z.string(),
  title: z.string().nullish(),
  description: z.string().nullish(),
  iconUrl: z.string().nullish(),
  type: z.string().nullish(),
  categoryId: z.string().nullish(),
  categoryName: z.string().nullish(),
  isAssigned: z.boolean().nullish(),
  questionCount: z.number().nullish(),
  /** Not sent live yet (2026-10-15); read when present to show the game template. */
  slug: z.string().nullish(),
});

export interface AvailableActivity {
  id: string;
  title: string;
  description: string;
  iconUrl: string | null;
  type: ActivityType | null;
  categoryName: string | null;
  isAssigned: boolean;
  questionCount: number | null;
  slug: string | null;
}

function trimOrNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : null;
}

/** `GET …/available-activities?type=test|game` */
export async function fetchAvailableActivities(
  childId: string,
  type: ActivityType,
): Promise<AvailableActivity[]> {
  const { data } = await httpClient.get<unknown>(TRAINING_PLAN_PATHS.available(childId), {
    params: { type },
  });
  return z
    .array(availableActivitySchema)
    .parse(data)
    .map((dto) => ({
      id: dto.id,
      title: dto.title ?? '',
      description: dto.description ?? '',
      iconUrl: dto.iconUrl ?? null,
      type: normalizeActivityType(dto.type),
      categoryName: trimOrNull(dto.categoryName),
      isAssigned: dto.isAssigned ?? false,
      questionCount: dto.questionCount ?? null,
      slug: dto.slug ?? null,
    }));
}

/** `POST …/activities` `{ activityId }` (Swagger `AssignActivityToChildRequest`). */
export async function assignActivity(childId: string, activityId: string): Promise<void> {
  await httpClient.post(TRAINING_PLAN_PATHS.activities(childId), { activityId });
}

/** `DELETE …/activities/{activityId}` — the catalogue activity id (VERIFIED LIVE — WRITE). */
export async function removeActivity(childId: string, activityId: string): Promise<void> {
  await httpClient.delete(TRAINING_PLAN_PATHS.activity(childId, activityId));
}

/** `GET specialist/teachers` — VERIFIED LIVE (2026-10-06): `[{ id, fullName }]`. */
const teacherSchema = z.looseObject({ id: z.string(), fullName: z.string().nullish() });

export interface TeacherOption {
  id: string;
  name: string;
}

export async function fetchTeachers(): Promise<TeacherOption[]> {
  const { data } = await httpClient.get<unknown>('specialist/teachers');
  return z
    .array(teacherSchema)
    .parse(data)
    .map((teacher) => ({ id: teacher.id, name: teacher.fullName?.trim() ?? '' }));
}

/** `POST specialist/assign-teacher { teacherId, childIds }` — VERIFIED LIVE — WRITE; 400 message when the child has no teacher to assign. */
export async function assignTeacher(teacherId: string, childIds: readonly string[]): Promise<void> {
  await httpClient.post('specialist/assign-teacher', { teacherId, childIds });
}

/**
 * `GET TrainingPlan/children/{childId}/activities/{planActivityId}/result` — VERIFIED LIVE
 * 2026-10-14: readable by the Specialist only (Parent, Admin, Super Admin 403); 404 `{ message }`
 * before the child submits. Shape: the plan row (`score`, `correctAnswers`, `wrongAnswers`,
 * `completedAt`, …) plus `questions: [{ questionId, questionText, questionImageUrl, type,
 * selectedOptions: [{ id, optionText, optionImageUrl }], isCorrect }]` (no correct answers).
 */
const resultQuestionSchema = z.looseObject({
  questionId: z.string(),
  questionText: z.string().nullish(),
  questionImageUrl: z.string().nullish(),
  type: z.string().nullish(),
  selectedOptions: z
    .array(
      z.looseObject({
        id: z.string(),
        optionText: z.string().nullish(),
        optionImageUrl: z.string().nullish(),
      }),
    )
    .nullish(),
  isCorrect: z.boolean().nullish(),
});

const activityResultSchema = planActivityDtoSchema.extend({
  questions: z.array(resultQuestionSchema).nullish(),
});

export interface PlanActivityResultQuestion {
  id: string;
  text: string;
  /** Backend question type as sent. */
  type: string | null;
  imageUrl: string | null;
  /** The child's choices, in the child's order. */
  selected: { id: string; text: string; imageUrl: string | null }[];
  isCorrect: boolean | null;
}

export interface PlanActivityResult {
  activity: PlanActivity;
  questions: PlanActivityResultQuestion[];
}

export async function fetchPlanActivityResult(
  childId: string,
  planActivityId: string,
): Promise<PlanActivityResult> {
  const { data } = await httpClient.get<unknown>(
    `TrainingPlan/children/${encodeURIComponent(childId)}/activities/${encodeURIComponent(planActivityId)}/result`,
  );
  const dto = activityResultSchema.parse(data);
  return {
    activity: mapPlanActivity(dto),
    questions: (dto.questions ?? []).map((question) => ({
      id: question.questionId,
      text: question.questionText?.trim() ?? '',
      type: question.type ?? null,
      imageUrl: question.questionImageUrl ?? null,
      selected: (question.selectedOptions ?? []).map((option) => ({
        id: option.id,
        text: option.optionText?.trim() ?? '',
        imageUrl: option.optionImageUrl ?? null,
      })),
      isCorrect: question.isCorrect ?? null,
    })),
  };
}
