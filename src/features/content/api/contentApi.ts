import { z } from 'zod';

import { normalizeActivityType, type ActivityType } from '@/services/api/activityType';
import { toFormData, type FormFields } from '@/services/http/formData';
import { httpClient } from '@/services/http/httpClient';

import {
  QUESTION_TYPES,
  type ActivityDetail,
  type ActivitySummary,
  type Category,
  type CategoryWithCounts,
  type Question,
  type QuestionOption,
  type QuestionType,
} from '../types';

/**
 * Admin content API (Swagger `/api/Admin/*`, `/api/initial-assessment/*`).
 * Request shapes are from Swagger; responses VERIFIED LIVE with the Admin account (reads and
 * disposable writes — `docs/API_VERIFICATION_MATRIX.md`).
 */
const enc = encodeURIComponent;

export const CONTENT_PATHS = {
  categories: 'Admin/categories',
  category: (id: string) => `Admin/categories/${enc(id)}`,
  categoriesActivity: 'Admin/categoriesActivity',
  activities: (type: ActivityType) => `Admin/activities/${type}`,
  activity: (type: ActivityType, id: string) => `Admin/activities/${type}/${enc(id)}`,
  questions: (activityId: string) => `Admin/activities/${enc(activityId)}/questions`,
  question: (questionId: string) => `Admin/questions/${enc(questionId)}`,
  questionInfo: (questionId: string) => `Admin/questions/${enc(questionId)}/info`,
  questionOptions: (questionId: string) => `Admin/questions/${enc(questionId)}/options`,
  option: (optionId: string) => `Admin/question-options/${enc(optionId)}`,
  assessmentCategories: 'initial-assessment/categories',
  assessmentCategory: (categoryId: string) => `initial-assessment/categories/${enc(categoryId)}`,
  assessmentQuestions: 'initial-assessment/questions',
  assessmentQuestion: (questionId: string) => `initial-assessment/questions/${enc(questionId)}`,
} as const;

/* ── Schemas (lenient) ─────────────────────────────────────────────── */

const categorySchema = z.looseObject({
  id: z.string(),
  name: z.string().nullish(),
  count: z.number().nullish(),
});

const categoryWithCountsSchema = z.looseObject({
  id: z.string(),
  name: z.string().nullish(),
  count: z.number().nullish(),
  isDeleted: z.boolean().nullish(),
});

const activitySchema = z.looseObject({
  id: z.string(),
  title: z.string().nullish(),
  description: z.string().nullish(),
  slug: z.string().nullish(),
  iconUrl: z.string().nullish(),
  type: z.string().nullish(),
  categoryId: z.string().nullish(),
  categoryName: z.string().nullish(),
  questionCount: z.number().nullish(),
});

const optionSchema = z.looseObject({
  id: z.string(),
  optionText: z.string().nullish(),
  optionImageUrl: z.string().nullish(),
  isCorrect: z.boolean().nullish(),
  order: z.number().nullish(),
  correctOrder: z.number().nullish(),
});

const questionSchema = z.looseObject({
  id: z.string(),
  questionText: z.string().nullish(),
  questionImageUrl: z.string().nullish(),
  type: z.string().nullish(),
  order: z.number().nullish(),
  options: z.array(optionSchema).nullish(),
});

const activityDetailSchema = activitySchema.extend({
  createdByName: z.string().nullish(),
  questions: z.array(questionSchema).nullish(),
});

/* ── Mappers ───────────────────────────────────────────────────────── */

function trimName(value: string | null | undefined): string {
  return (value ?? '').trim();
}

export function normalizeQuestionType(value: unknown): QuestionType | null {
  return QUESTION_TYPES.find((type) => type.toLowerCase() === String(value).toLowerCase()) ?? null;
}

function mapCategory(dto: z.infer<typeof categorySchema>): Category {
  return { id: dto.id, name: trimName(dto.name), count: dto.count ?? null };
}

function mapActivity(dto: z.infer<typeof activitySchema>): ActivitySummary {
  return {
    id: dto.id,
    title: dto.title ?? '',
    description: dto.description ?? '',
    slug: dto.slug ?? '',
    iconUrl: dto.iconUrl ?? null,
    type: normalizeActivityType(dto.type),
    categoryId: dto.categoryId ?? null,
    categoryName: dto.categoryName ? trimName(dto.categoryName) : null,
    questionCount: dto.questionCount ?? null,
  };
}

function mapOption(dto: z.infer<typeof optionSchema>): QuestionOption {
  return {
    id: dto.id,
    text: dto.optionText ?? '',
    imageUrl: dto.optionImageUrl ?? null,
    isCorrect: dto.isCorrect ?? false,
    order: dto.order ?? null,
    correctOrder: dto.correctOrder ?? null,
  };
}

export function mapQuestion(dto: z.infer<typeof questionSchema>): Question {
  const options = (dto.options ?? []).map(mapOption);
  return {
    id: dto.id,
    text: dto.questionText ?? '',
    imageUrl: dto.questionImageUrl ?? null,
    type: normalizeQuestionType(dto.type),
    order: dto.order ?? null,
    options: options.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  };
}

/* ── Categories ────────────────────────────────────────────────────── */

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await httpClient.get<unknown>(CONTENT_PATHS.categories);
  return z.array(categorySchema).parse(data).map(mapCategory);
}

/** Categories with activity counts and initial-assessment membership (deleted ones hidden). */
/**
 * `GET initial-assessment/categories` — VERIFIED LIVE: `{ categories: [{ id, name, order }] }`.
 * This dedicated endpoint is the source of truth for membership: live, its ids did not match the
 * `isInInitialAssessment` flags of `categoriesActivity` (inconsistency reported to the backend).
 */
const assessmentCategoriesSchema = z.looseObject({
  categories: z.array(
    z.looseObject({ id: z.string(), name: z.string().nullish(), order: z.number().nullish() }),
  ),
});

export async function fetchAssessmentCategoryIds(): Promise<string[]> {
  const { data } = await httpClient.get<unknown>(CONTENT_PATHS.assessmentCategories);
  return assessmentCategoriesSchema.parse(data).categories.map((category) => category.id);
}

export async function fetchCategoriesWithCounts(type: ActivityType): Promise<CategoryWithCounts[]> {
  const { data } = await httpClient.get<unknown>(CONTENT_PATHS.categoriesActivity, {
    params: { type },
  });
  return z
    .array(categoryWithCountsSchema)
    .parse(data)
    .filter((dto) => !dto.isDeleted)
    .map((dto) => ({
      id: dto.id,
      name: trimName(dto.name),
      count: dto.count ?? null,
    }));
}

export async function createCategory(name: string): Promise<void> {
  await httpClient.post(CONTENT_PATHS.categories, { name });
}

export async function updateCategory(id: string, name: string): Promise<void> {
  await httpClient.put(CONTENT_PATHS.category(id), { name });
}

export async function deleteCategory(id: string): Promise<void> {
  await httpClient.delete(CONTENT_PATHS.category(id));
}

/* ── Activities ────────────────────────────────────────────────────── */

export async function fetchActivities(
  type: ActivityType,
  categoryId?: string,
): Promise<ActivitySummary[]> {
  const { data } = await httpClient.get<unknown>(CONTENT_PATHS.activities(type), {
    params: categoryId ? { categoryId } : undefined,
  });
  return z.array(activitySchema).parse(data).map(mapActivity);
}

export async function fetchActivity(type: ActivityType, id: string): Promise<ActivityDetail> {
  const { data } = await httpClient.get<unknown>(CONTENT_PATHS.activity(type, id));
  const dto = activityDetailSchema.parse(data);
  return {
    ...mapActivity(dto),
    createdByName: dto.createdByName ?? null,
    questions: (dto.questions ?? []).map(mapQuestion),
  };
}

export interface ActivityInput {
  title: string;
  description: string;
  slug: string;
  categoryId: string;
  /** Omitted on edit when the icon is unchanged. */
  icon: File | null;
}

function activityForm(input: ActivityInput): FormData {
  return toFormData({
    Title: input.title,
    Description: input.description,
    Slug: input.slug,
    CategoryId: input.categoryId,
    Icon: input.icon,
  });
}

export async function createActivity(type: ActivityType, input: ActivityInput): Promise<void> {
  await httpClient.post(CONTENT_PATHS.activities(type), activityForm(input));
}

export async function updateActivity(
  type: ActivityType,
  id: string,
  input: ActivityInput,
): Promise<void> {
  await httpClient.put(CONTENT_PATHS.activity(type, id), activityForm(input));
}

export async function deleteActivity(type: ActivityType, id: string): Promise<void> {
  await httpClient.delete(CONTENT_PATHS.activity(type, id));
}

/* ── Questions & options ───────────────────────────────────────────── */

export interface OptionInput {
  text: string;
  image: File | null;
  isCorrect: boolean;
  correctOrder: number | null;
}

export interface QuestionInput {
  text: string;
  image: File | null;
  type: QuestionType;
  options: OptionInput[];
}

/** Builds the multipart body with ASP.NET indexed keys (`Options[0].OptionText`, …). */
export function buildQuestionForm(input: QuestionInput): FormData {
  const options: FormFields[] = input.options.map((option, index) => ({
    OptionText: option.text || null,
    OptionImage: option.image,
    Order: index + 1,
    IsCorrect: option.isCorrect,
    CorrectOrder: input.type === 'Sequence' ? option.correctOrder : null,
  }));
  return toFormData({
    QuestionText: input.text,
    QuestionImage: input.image,
    Type: input.type,
    Options: options,
  });
}

export async function createQuestion(activityId: string, input: QuestionInput): Promise<void> {
  await httpClient.post(CONTENT_PATHS.questions(activityId), buildQuestionForm(input));
}

export async function fetchQuestion(questionId: string): Promise<Question> {
  const { data } = await httpClient.get<unknown>(CONTENT_PATHS.question(questionId));
  return mapQuestion(questionSchema.parse(data));
}

export interface QuestionInfoInput {
  text: string;
  image: File | null;
  type: QuestionType;
}

export async function updateQuestionInfo(
  questionId: string,
  input: QuestionInfoInput,
): Promise<void> {
  await httpClient.put(
    CONTENT_PATHS.questionInfo(questionId),
    toFormData({ QuestionText: input.text, QuestionImage: input.image, Type: input.type }),
  );
}

export async function deleteQuestion(questionId: string): Promise<void> {
  await httpClient.delete(CONTENT_PATHS.question(questionId));
}

export interface OptionUpdateInput {
  text: string;
  image: File | null;
  order: number;
  isCorrect: boolean;
  correctOrder: number | null;
}

export async function updateOption(optionId: string, input: OptionUpdateInput): Promise<void> {
  await httpClient.put(
    CONTENT_PATHS.option(optionId),
    toFormData({
      OptionText: input.text || null,
      OptionImage: input.image,
      Order: input.order,
      IsCorrect: input.isCorrect,
      CorrectOrder: input.correctOrder,
    }),
  );
}

export async function deleteOption(optionId: string): Promise<void> {
  await httpClient.delete(CONTENT_PATHS.option(optionId));
}

export async function deleteAllOptions(questionId: string): Promise<void> {
  await httpClient.delete(CONTENT_PATHS.questionOptions(questionId));
}

/* ── Initial-assessment composition ────────────────────────────────── */

export async function addCategoryToAssessment(categoryId: string): Promise<void> {
  await httpClient.post(CONTENT_PATHS.assessmentCategory(categoryId));
}

export async function removeCategoryFromAssessment(categoryId: string): Promise<void> {
  await httpClient.delete(CONTENT_PATHS.assessmentCategory(categoryId));
}

export async function addQuestionsToAssessment(questionIds: string[]): Promise<void> {
  await httpClient.post(CONTENT_PATHS.assessmentQuestions, { questionIds });
}

export async function removeQuestionFromAssessment(questionId: string): Promise<void> {
  await httpClient.delete(CONTENT_PATHS.assessmentQuestion(questionId));
}
