import { z } from 'zod';
import { mediaKeys, saveLocalMedia, removeLocalMedia } from '@/services/media/localMedia';
import {
  rememberQuestionContent,
  forgetQuestionContent,
  forgetOptionContent,
  correctedQuestionText,
} from '@/services/api/questionContentCache';

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
  const question = {
    id: dto.id,
    text: correctedQuestionText(dto.questionText ?? ''),
    imageUrl: dto.questionImageUrl ?? null,
    type: normalizeQuestionType(dto.type),
    order: dto.order ?? null,
    options: options.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  };
  rememberQuestionContent(question);
  return question;
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
  let before: Set<string> | null = null;
  if (input.icon)
    await localFallback(async () => {
      before = new Set((await fetchActivities(type)).map((activity) => activity.id));
    });
  const { data } = await httpClient.post<unknown>(
    CONTENT_PATHS.activities(type),
    activityForm(input),
  );
  if (input.icon)
    await localFallback(async () => {
      const dto = activitySchema.safeParse(data);
      if (dto.success) {
        await saveLocalMedia(mediaKeys.activity(type, dto.data.id), input.icon, dto.data.iconUrl);
        return;
      }
      if (before === null) return;
      const matches = (await fetchActivities(type)).filter(
        (activity) =>
          !before?.has(activity.id) &&
          activity.slug === input.slug &&
          activity.title === input.title &&
          activity.categoryId === input.categoryId,
      );
      if (matches.length === 1 && matches[0])
        await saveLocalMedia(
          mediaKeys.activity(type, matches[0].id),
          input.icon,
          matches[0].iconUrl,
        );
    });
}

export async function updateActivity(
  type: ActivityType,
  id: string,
  input: ActivityInput,
): Promise<void> {
  await httpClient.put(CONTENT_PATHS.activity(type, id), activityForm(input));
  await saveLocalMedia(mediaKeys.activity(type, id), input.icon);
}

export async function deleteActivity(type: ActivityType, id: string): Promise<void> {
  await httpClient.delete(CONTENT_PATHS.activity(type, id));
  await removeLocalMedia(mediaKeys.activity(type, id));
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

async function localFallback(action: () => Promise<void>): Promise<void> {
  try {
    await action();
  } catch {
    /* A successful upload remains successful if local caching cannot bind it. */
  }
}

async function rememberQuestionImages(question: Question, input: QuestionInput): Promise<void> {
  await saveLocalMedia(mediaKeys.question(question.id), input.image, question.imageUrl);
  await Promise.all(
    question.options.map(async (option) => {
      const matches = input.options.filter(
        (candidate) =>
          candidate.text === option.text &&
          (input.type === 'Sequence'
            ? candidate.correctOrder === option.correctOrder
            : candidate.isCorrect === option.isCorrect),
      );
      let source: OptionInput | undefined;
      if (option.order !== null && option.order > 0) {
        const ordered = input.options[option.order - 1];
        if (ordered && matches.includes(ordered)) source = ordered;
      }
      // When the backend discarded Order, duplicate indistinguishable choices cannot be safely
      // paired with different image files. Their individual editor still has an exact option id.
      if (!source && matches.length === 1) source = matches[0];
      if (source) await saveLocalMedia(mediaKeys.option(option.id), source.image, option.imageUrl);
    }),
  );
}

export async function createQuestion(
  activityId: string,
  input: QuestionInput,
  activityType: ActivityType = 'test',
): Promise<void> {
  const hasImages = input.image !== null || input.options.some((option) => option.image !== null);
  let before: Set<string> | null = null;
  if (hasImages)
    await localFallback(async () => {
      before = new Set(
        (await fetchActivity(activityType, activityId)).questions.map((question) => question.id),
      );
    });
  const { data } = await httpClient.post<unknown>(
    CONTENT_PATHS.questions(activityId),
    buildQuestionForm(input),
  );
  if (hasImages)
    await localFallback(async () => {
      const detail = activityDetailSchema.safeParse(data);
      const single = questionSchema.safeParse(data);
      let questions: Question[];
      if (detail.success && Array.isArray(detail.data.questions) && before !== null)
        questions = detail.data.questions.map(mapQuestion);
      else if (
        single.success &&
        typeof single.data.questionText === 'string' &&
        Array.isArray(single.data.options)
      )
        questions = [mapQuestion(single.data)];
      else if (before !== null)
        questions = (await fetchActivity(activityType, activityId)).questions;
      else return;
      const matches = questions.filter(
        (question) =>
          !before?.has(question.id) &&
          question.text === correctedQuestionText(input.text) &&
          question.type === input.type &&
          question.options.length === input.options.length,
      );
      if (matches.length === 1 && matches[0]) await rememberQuestionImages(matches[0], input);
    });
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
  await saveLocalMedia(mediaKeys.question(questionId), input.image);
}

export async function deleteQuestion(questionId: string): Promise<void> {
  await httpClient.delete(CONTENT_PATHS.question(questionId));
  forgetQuestionContent(questionId);
  await removeLocalMedia(mediaKeys.question(questionId));
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
  await saveLocalMedia(mediaKeys.option(optionId), input.image);
}

export async function deleteOption(optionId: string): Promise<void> {
  await httpClient.delete(CONTENT_PATHS.option(optionId));
  forgetOptionContent(optionId);
  await removeLocalMedia(mediaKeys.option(optionId));
}

export async function deleteAllOptions(questionId: string): Promise<void> {
  await httpClient.delete(CONTENT_PATHS.questionOptions(questionId));
  forgetQuestionContent(questionId);
}

/* ── Initial-assessment composition ────────────────────────────────── */

export interface CategoryQuestionGroup {
  activity: ActivitySummary;
  questions: Question[];
}

/**
 * The questions that belong to a category (client revision 2026-10): its activities of both types
 * (`GET Admin/activities/{type}?categoryId=`) and each activity's questions
 * (`GET Admin/activities/{type}/{id}`). Activities without questions are left out.
 */
export async function fetchCategoryQuestions(categoryId: string): Promise<CategoryQuestionGroup[]> {
  const types = ['test', 'game'] as const;
  const lists = await Promise.all(
    types.map(async (type) =>
      (await fetchActivities(type, categoryId)).map((activity) => ({ type, id: activity.id })),
    ),
  );
  const details = await Promise.all(lists.flat().map(({ type, id }) => fetchActivity(type, id)));
  return details.flatMap((detail) =>
    detail.questions.length > 0 ? [{ activity: detail, questions: detail.questions }] : [],
  );
}

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
