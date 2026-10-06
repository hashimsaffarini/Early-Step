import { http, HttpResponse, type HttpHandler } from 'msw';

import { mockId } from '../db';
import {
  mockActivities,
  mockAssessmentQuestionIds,
  mockCategories,
  mockQuestions,
  type MockActivityRow,
  type MockOptionRow,
  type MockQuestionRow,
} from '../fixtures/content';
import { apiUrl, badRequest, notFound, requireRole } from '../http';

/**
 * Admin content mocks. They enforce the INTENDED authorization (Admin only). The live backend was
 * observed answering Admin GETs without authentication — a reported backend vulnerability.
 */
const ADMIN = ['Admin'] as const;
const TYPE_LABEL = { test: 'اختبارات', game: 'ألعاب' } as const;

function text(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

function uploadedUrl(form: FormData, name: string, folder: string): string | null {
  const value = form.get(name);
  return value instanceof Blob && value.size > 0 ? `/uploads/${folder}/${mockId()}.png` : null;
}

function activityType(value: unknown): 'test' | 'game' | null {
  return value === 'test' || value === 'game' ? value : null;
}

function categoryName(id: string): string {
  return mockCategories.find((category) => category.id === id)?.name ?? '';
}

function questionsOf(activityId: string): MockQuestionRow[] {
  return mockQuestions.filter((question) => question.activityId === activityId);
}

function activityDto(row: MockActivityRow) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    slug: row.slug,
    iconUrl: row.iconUrl,
    type: TYPE_LABEL[row.type],
    categoryId: row.categoryId,
    categoryName: categoryName(row.categoryId),
    questionCount: questionsOf(row.id).length,
  };
}

function activityDetailDto(row: MockActivityRow) {
  return {
    ...activityDto(row),
    createdById: row.createdById,
    createdByName: row.createdByName,
    questions: questionsOf(row.id),
  };
}

function findOption(optionId: string): { question: MockQuestionRow; option: MockOptionRow } | null {
  for (const question of mockQuestions) {
    const option = question.options.find((candidate) => candidate.id === optionId);
    if (option) return { question, option };
  }
  return null;
}

function parseOptions(form: FormData): MockOptionRow[] {
  const options: MockOptionRow[] = [];
  for (let index = 0; form.has(`Options[${index.toString()}].Order`); index += 1) {
    const key = (field: string) => `Options[${index.toString()}].${field}`;
    const correctOrder = text(form, key('CorrectOrder'));
    options.push({
      id: mockId(),
      optionText: text(form, key('OptionText')) || null,
      optionImageUrl: uploadedUrl(form, key('OptionImage'), 'options'),
      isCorrect: text(form, key('IsCorrect')) === 'true',
      order: Number(text(form, key('Order'))),
      correctOrder: correctOrder ? Number(correctOrder) : null,
      pairKey: text(form, key('PairKey')) || null,
    });
  }
  return options;
}

export const contentHandlers: HttpHandler[] = [
  /* Categories */
  http.get(apiUrl('Admin/categories'), ({ request }) => {
    const user = requireRole(request, ADMIN);
    if (user instanceof Response) return user;
    return HttpResponse.json(
      mockCategories
        .filter((category) => !category.isDeleted)
        .map((category) => ({
          id: category.id,
          name: category.name,
          count: mockActivities.filter((activity) => activity.categoryId === category.id).length,
        })),
    );
  }),
  http.post(apiUrl('Admin/categories'), async ({ request }) => {
    const user = requireRole(request, ADMIN);
    if (user instanceof Response) return user;
    const body = (await request.json()) as { name?: string };
    const name = body.name?.trim() ?? '';
    if (!name) return badRequest('اسم التصنيف مطلوب.');
    if (mockCategories.some((category) => category.name === name && !category.isDeleted)) {
      return badRequest('التصنيف موجود بالفعل.');
    }
    const row = { id: mockId(), name, isDeleted: false, isInInitialAssessment: false };
    mockCategories.push(row);
    return HttpResponse.json({ id: row.id, name: row.name, count: 0 });
  }),
  http.put(apiUrl('Admin/categories/:id'), async ({ request, params }) => {
    const user = requireRole(request, ADMIN);
    if (user instanceof Response) return user;
    const row = mockCategories.find((category) => category.id === params.id);
    if (!row) return notFound('التصنيف غير موجود.');
    const body = (await request.json()) as { name?: string };
    row.name = body.name?.trim() ?? row.name;
    return HttpResponse.json({ id: row.id, name: row.name, count: 0 });
  }),
  http.delete(apiUrl('Admin/categories/:id'), ({ request, params }) => {
    const user = requireRole(request, ADMIN);
    if (user instanceof Response) return user;
    const row = mockCategories.find((category) => category.id === params.id);
    if (!row) return notFound('التصنيف غير موجود.');
    row.isDeleted = true;
    return HttpResponse.json('تم حذف التصنيف بنجاح.');
  }),
  http.get(apiUrl('Admin/categoriesActivity'), ({ request }) => {
    const user = requireRole(request, ADMIN);
    if (user instanceof Response) return user;
    const type = activityType(new URL(request.url).searchParams.get('type'));
    if (!type) return badRequest('النوع مطلوب.');
    return HttpResponse.json(
      mockCategories.map((category) => ({
        id: category.id,
        name: category.name,
        count: mockActivities.filter((a) => a.categoryId === category.id && a.type === type).length,
        isDeleted: category.isDeleted,
        isInInitialAssessment: category.isInInitialAssessment,
      })),
    );
  }),

  /* Questions & options (registered before the generic activity routes) */
  http.post(apiUrl('Admin/activities/:activityId/questions'), async ({ request, params }) => {
    const user = requireRole(request, ADMIN);
    if (user instanceof Response) return user;
    const activity = mockActivities.find((row) => row.id === params.activityId);
    if (!activity) return notFound('النشاط غير موجود.');
    const form = await request.formData();
    const questionText = text(form, 'QuestionText');
    if (!questionText) return badRequest('نص السؤال مطلوب.');
    mockQuestions.push({
      id: mockId(),
      activityId: activity.id,
      questionText,
      questionImageUrl: uploadedUrl(form, 'QuestionImage', 'questions'),
      type: text(form, 'Type'),
      order: questionsOf(activity.id).length + 1,
      options: parseOptions(form),
    });
    return HttpResponse.json(activityDetailDto(activity));
  }),
  http.get(apiUrl('Admin/questions/:questionId'), ({ request, params }) => {
    const user = requireRole(request, ADMIN);
    if (user instanceof Response) return user;
    const question = mockQuestions.find((row) => row.id === params.questionId);
    return question ? HttpResponse.json(question) : notFound('السؤال غير موجود.');
  }),
  http.put(apiUrl('Admin/questions/:questionId/info'), async ({ request, params }) => {
    const user = requireRole(request, ADMIN);
    if (user instanceof Response) return user;
    const question = mockQuestions.find((row) => row.id === params.questionId);
    if (!question) return notFound('السؤال غير موجود.');
    const form = await request.formData();
    question.questionText = text(form, 'QuestionText') || question.questionText;
    question.type = text(form, 'Type') || question.type;
    question.questionImageUrl =
      uploadedUrl(form, 'QuestionImage', 'questions') ?? question.questionImageUrl;
    const activity = mockActivities.find((row) => row.id === question.activityId);
    return HttpResponse.json(activity ? activityDetailDto(activity) : question);
  }),
  http.delete(apiUrl('Admin/questions/:questionId/options'), ({ request, params }) => {
    const user = requireRole(request, ADMIN);
    if (user instanceof Response) return user;
    const question = mockQuestions.find((row) => row.id === params.questionId);
    if (!question) return notFound('السؤال غير موجود.');
    question.options = [];
    return HttpResponse.json({ message: 'تم حذف جميع خيارات السؤال بنجاح.' });
  }),
  http.delete(apiUrl('Admin/questions/:questionId'), ({ request, params }) => {
    const user = requireRole(request, ADMIN);
    if (user instanceof Response) return user;
    const index = mockQuestions.findIndex((row) => row.id === params.questionId);
    if (index < 0) return notFound('السؤال غير موجود.');
    mockQuestions.splice(index, 1);
    return HttpResponse.json({ message: 'تم حذف السؤال بنجاح.' });
  }),
  http.put(apiUrl('Admin/question-options/:optionId'), async ({ request, params }) => {
    const user = requireRole(request, ADMIN);
    if (user instanceof Response) return user;
    const found = findOption(String(params.optionId));
    if (!found) return notFound('الخيار غير موجود.');
    const form = await request.formData();
    const { option } = found;
    option.optionText = text(form, 'OptionText') || null;
    option.order = Number(text(form, 'Order')) || option.order;
    option.isCorrect = text(form, 'IsCorrect') === 'true';
    const correctOrder = text(form, 'CorrectOrder');
    option.correctOrder = correctOrder ? Number(correctOrder) : null;
    option.pairKey = text(form, 'PairKey') || null;
    option.optionImageUrl = uploadedUrl(form, 'OptionImage', 'options') ?? option.optionImageUrl;
    return HttpResponse.json(option);
  }),
  http.delete(apiUrl('Admin/question-options/:optionId'), ({ request, params }) => {
    const user = requireRole(request, ADMIN);
    if (user instanceof Response) return user;
    const found = findOption(String(params.optionId));
    if (!found) return notFound('الخيار غير موجود.');
    found.question.options = found.question.options.filter((option) => option !== found.option);
    return HttpResponse.json({ message: 'تم حذف الخيار بنجاح.' });
  }),

  /* Activities */
  http.get(apiUrl('Admin/activities/:type'), ({ request, params }) => {
    const user = requireRole(request, ADMIN);
    if (user instanceof Response) return user;
    const type = activityType(params.type);
    if (!type) return badRequest('نوع النشاط غير صحيح.');
    const categoryId = new URL(request.url).searchParams.get('categoryId');
    return HttpResponse.json(
      mockActivities
        .filter((row) => row.type === type && (!categoryId || row.categoryId === categoryId))
        .map(activityDto),
    );
  }),
  http.get(apiUrl('Admin/activities/:type/:id'), ({ request, params }) => {
    const user = requireRole(request, ADMIN);
    if (user instanceof Response) return user;
    const row = mockActivities.find(
      (activity) => activity.id === params.id && activity.type === params.type,
    );
    return row ? HttpResponse.json(activityDetailDto(row)) : notFound('النشاط غير موجود.');
  }),
  http.post(apiUrl('Admin/activities/:type'), async ({ request, params }) => {
    const user = requireRole(request, ADMIN);
    if (user instanceof Response) return user;
    const type = activityType(params.type);
    if (!type) return badRequest('نوع النشاط غير صحيح.');
    const form = await request.formData();
    const title = text(form, 'Title');
    const categoryId = text(form, 'CategoryId');
    if (!title || !mockCategories.some((category) => category.id === categoryId)) {
      return badRequest('بيانات النشاط غير مكتملة.');
    }
    const row: MockActivityRow = {
      id: mockId(),
      type,
      title,
      description: text(form, 'Description'),
      slug: text(form, 'Slug'),
      iconUrl: uploadedUrl(form, 'Icon', 'activities'),
      categoryId,
      createdById: user.id,
      createdByName: user.fullName,
    };
    mockActivities.push(row);
    return HttpResponse.json(activityDetailDto(row));
  }),
  http.put(apiUrl('Admin/activities/:type/:id'), async ({ request, params }) => {
    const user = requireRole(request, ADMIN);
    if (user instanceof Response) return user;
    const row = mockActivities.find((activity) => activity.id === params.id);
    if (!row) return notFound('النشاط غير موجود.');
    const form = await request.formData();
    row.title = text(form, 'Title') || row.title;
    row.description = text(form, 'Description');
    row.slug = text(form, 'Slug') || row.slug;
    row.categoryId = text(form, 'CategoryId') || row.categoryId;
    row.iconUrl = uploadedUrl(form, 'Icon', 'activities') ?? row.iconUrl;
    return HttpResponse.json(activityDetailDto(row));
  }),
  http.delete(apiUrl('Admin/activities/:type/:id'), ({ request, params }) => {
    const user = requireRole(request, ADMIN);
    if (user instanceof Response) return user;
    const index = mockActivities.findIndex((activity) => activity.id === params.id);
    if (index < 0) return notFound('النشاط غير موجود.');
    mockActivities.splice(index, 1);
    return HttpResponse.json({ message: 'تم حذف النشاط بنجاح.' });
  }),

  /* Initial-assessment composition */
  http.get(apiUrl('initial-assessment/categories'), ({ request }) => {
    const user = requireRole(request, ADMIN);
    if (user instanceof Response) return user;
    return HttpResponse.json({
      categories: mockCategories
        .filter((c) => c.isInInitialAssessment)
        .map((c, index) => ({ id: c.id, name: c.name, order: index + 1 })),
    });
  }),
  http.post(apiUrl('initial-assessment/categories/:categoryId'), ({ request, params }) => {
    const user = requireRole(request, ADMIN);
    if (user instanceof Response) return user;
    const row = mockCategories.find((category) => category.id === params.categoryId);
    if (!row) return notFound('التصنيف غير موجود.');
    row.isInInitialAssessment = true;
    return HttpResponse.json({ message: 'تمت إضافة التصنيف إلى التقييم المبدئي.' });
  }),
  http.delete(apiUrl('initial-assessment/categories/:categoryId'), ({ request, params }) => {
    const user = requireRole(request, ADMIN);
    if (user instanceof Response) return user;
    const row = mockCategories.find((category) => category.id === params.categoryId);
    if (!row) return notFound('التصنيف غير موجود.');
    row.isInInitialAssessment = false;
    return HttpResponse.json({ message: 'تمت إزالة التصنيف من التقييم المبدئي.' });
  }),
  http.post(apiUrl('initial-assessment/questions'), async ({ request }) => {
    const user = requireRole(request, ADMIN);
    if (user instanceof Response) return user;
    const body = (await request.json()) as { questionIds?: string[] };
    for (const id of body.questionIds ?? []) mockAssessmentQuestionIds.add(id);
    return HttpResponse.json({ message: 'تمت إضافة الأسئلة إلى التقييم المبدئي.' });
  }),
  http.delete(apiUrl('initial-assessment/questions/:questionId'), ({ request, params }) => {
    const user = requireRole(request, ADMIN);
    if (user instanceof Response) return user;
    mockAssessmentQuestionIds.delete(String(params.questionId));
    return HttpResponse.json({ message: 'تمت إزالة السؤال من التقييم المبدئي.' });
  }),
];
