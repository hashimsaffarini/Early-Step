/**
 * LIVE WRITE suite (`npm run test:live:write`) — authorized disposable records only.
 * Every record is named "E2E Test …", tracked when created and deleted in `afterAll`; the suite
 * FAILS if cleanup leaves anything behind. Uses the app's own API functions. No data is printed.
 * Not included: chat messages (the API cannot delete them) and Parent registration (no user delete).
 */
import {
  fetchPlanActivityDetail,
  submitPlanActivity,
} from '@/features/activities/api/planActivityApi';
import {
  completeAssessment,
  startAssessment,
  submitAnswer,
} from '@/features/assessments/api/assessmentApi';
import {
  createChild,
  deleteChild,
  fetchParentChild,
  updateChild,
} from '@/features/children/api/childrenApi';
import {
  addCategoryToAssessment,
  addQuestionsToAssessment,
  createActivity,
  createCategory,
  createQuestion,
  deleteActivity,
  deleteCategory,
  deleteOption,
  deleteQuestion,
  fetchActivities,
  fetchActivity,
  fetchAssessmentCategoryIds,
  fetchCategories,
  fetchQuestion,
  removeCategoryFromAssessment,
  removeQuestionFromAssessment,
  updateActivity,
  updateCategory,
  updateOption,
} from '@/features/content/api/contentApi';
import {
  createReport,
  deleteReport,
  downloadReportPdf,
  fetchSpecialistReports,
  updateReport,
} from '@/features/reports/api/reportsApi';
import {
  assignActivity,
  assignTeacher,
  fetchSpecialistPlan,
  fetchTeachers,
  removeActivity,
} from '@/features/training-plans/api/trainingPlansApi';
import { assignChildrenToSpecialist } from '@/features/users/api/usersApi';
import { fetchChildReport } from '@/services/api/childReports';
import { fetchAssessmentResult } from '@/services/api/assessmentResult';
import { fetchChildPlanActivities } from '@/services/api/childPlan';
import { fetchChildrenForRole } from '@/services/api/childrenLists';
import { isAppError } from '@/services/http/apiError';

import { hasAccount, signInLive, type LiveAccount } from './liveSession';

const RUN = Date.now().toString(36);
const NAME = (what: string) => `E2E Test ${what} ${RUN}`;

interface Tracked {
  kind: 'child' | 'report' | 'category' | 'activity' | 'question' | 'assessmentCategory';
  id: string;
  account: LiveAccount;
  extra?: string;
}
const ledger: Tracked[] = [];
const track = (entry: Tracked) => {
  ledger.push(entry);
};
const untrack = (kind: Tracked['kind'], id: string) => {
  const index = ledger.findIndex((entry) => entry.kind === kind && entry.id === id);
  if (index >= 0) ledger.splice(index, 1);
};

async function isGone(probe: () => Promise<unknown>): Promise<boolean> {
  try {
    await probe();
    return false;
  } catch (error) {
    return isAppError(error) && error.status === 404;
  }
}

const ALL = hasAccount('PARENT') && hasAccount('SPECIALIST') && hasAccount('ADMIN');

describe.runIf(ALL)('live WRITE — disposable records with verified cleanup', () => {
  let childId = '';
  let specialistId = '';

  afterAll(async () => {
    const leftovers: string[] = [];
    // Delete in dependency order: assessment links → questions → activities → categories → reports → children.
    const order: Tracked['kind'][] = [
      'assessmentCategory',
      'question',
      'activity',
      'category',
      'report',
      'child',
    ];
    for (const kind of order) {
      for (const entry of ledger.filter((item) => item.kind === kind)) {
        try {
          await signInLive(entry.account);
          if (kind === 'assessmentCategory') await removeCategoryFromAssessment(entry.id);
          if (kind === 'question') await deleteQuestion(entry.id);
          if (kind === 'activity')
            await deleteActivity(entry.extra === 'game' ? 'game' : 'test', entry.id);
          if (kind === 'category') await deleteCategory(entry.id);
          if (kind === 'report') await deleteReport(entry.id);
          if (kind === 'child') await deleteChild(entry.id);
        } catch (error) {
          // 404 = already gone (e.g. reports cascade-deleted with their child).
          if (!(isAppError(error) && error.status === 404)) leftovers.push(`${kind}:${entry.id}`);
        }
      }
    }
    if (leftovers.length > 0) {
      throw new Error(`LIVE CLEANUP FAILED — leftover test records: ${leftovers.join(', ')}`);
    }
  });

  it('Parent: create → read → edit a disposable child', async () => {
    await signInLive('PARENT');
    const before = await fetchChildrenForRole('Parent');
    await createChild({ fullName: NAME('Child'), age: 6, gender: 'ولد' });
    const created = (await fetchChildrenForRole('Parent')).find(
      (c) => c.fullName === NAME('Child'),
    );
    expect(created).toBeDefined();
    childId = created?.id ?? '';
    track({ kind: 'child', id: childId, account: 'PARENT' });
    expect((await fetchChildrenForRole('Parent')).length).toBe(before.length + 1);

    await updateChild(childId, { fullName: NAME('Child Edited'), age: 7, gender: 'بنت' });
    const detail = await fetchParentChild(childId);
    expect(detail).toMatchObject({ fullName: NAME('Child Edited'), age: 7, gender: 'بنت' });
  });

  it('Parent: initial assessment start → answer → complete → GET result (same object)', async () => {
    await signInLive('PARENT');
    expect(await fetchAssessmentResult(childId)).toBeNull();
    const started = await startAssessment(childId);
    expect(started.questions.length).toBeGreaterThan(0);
    for (const question of started.questions) {
      const option = question.options[0];
      if (!option) continue;
      await submitAnswer({
        assessmentId: started.assessmentId,
        questionId: question.id,
        selectedOptionId: option.id,
      });
    }
    const result = await completeAssessment(started.assessmentId);
    expect(result).not.toBeNull();
    expect(typeof result?.overallScore).toBe('number');
    // Persisted: readable again later (GET initial-assessment/{childId}/result), also by staff.
    expect(await fetchAssessmentResult(childId)).toEqual(result);
    await signInLive('SPECIALIST');
    expect(await fetchAssessmentResult(childId)).toEqual(result);
  });

  it('Admin → Specialist: assign the specialist, then the specialist assigns a teacher', async () => {
    const specialist = await signInLive('SPECIALIST');
    specialistId = specialist.user.id ?? '';
    await signInLive('ADMIN');
    await assignChildrenToSpecialist({ specialistId, childIds: [childId] });
    await signInLive('SPECIALIST');
    expect((await fetchChildrenForRole('Specialist')).some((c) => c.id === childId)).toBe(true);
    const teachers = await fetchTeachers();
    const teacher = teachers[0];
    if (teacher) await assignTeacher(teacher.id, [childId]);
  });

  it('Specialist: report create → edit → PDF → delete; parent sees it while it exists', async () => {
    await signInLive('SPECIALIST');
    await createReport({
      childId,
      title: NAME('Report'),
      weaknesses: 'E2E',
      recommendations: 'E2E 1\nE2E 2',
    });
    const report = (await fetchSpecialistReports()).find((r) => r.title === NAME('Report'));
    expect(report).toBeDefined();
    const reportId = report?.id ?? '';
    track({ kind: 'report', id: reportId, account: 'SPECIALIST' });

    await updateReport(reportId, {
      title: NAME('Report Edited'),
      weaknesses: 'E2E',
      recommendations: 'E2E',
    });
    expect((await fetchSpecialistReports()).some((r) => r.title === NAME('Report Edited'))).toBe(
      true,
    );

    const pdf = await downloadReportPdf(reportId);
    // Browsers receive a Blob; the Node test adapter delivers the same bytes as a string.
    const body: unknown = pdf.blob;
    const head = body instanceof Blob ? await body.slice(0, 5).text() : String(body).slice(0, 5);
    const size = body instanceof Blob ? body.size : String(body).length;
    expect(head).toBe('%PDF-');
    expect(size).toBeGreaterThan(1000);
    expect(pdf.filename).toMatch(/\.pdf$/);

    await signInLive('PARENT');
    expect((await fetchChildReport(childId))?.id).toBe(reportId);

    await signInLive('SPECIALIST');
    await deleteReport(reportId);
    untrack('report', reportId);
    expect((await fetchSpecialistReports()).some((r) => r.id === reportId)).toBe(false);
  });

  it('Admin: category, test + game activities, question/option CRUD, assessment composition', async () => {
    await signInLive('ADMIN');
    await createCategory(NAME('Category'));
    const category = (await fetchCategories()).find((c) => c.name === NAME('Category'));
    expect(category).toBeDefined();
    const categoryId = category?.id ?? '';
    track({ kind: 'category', id: categoryId, account: 'ADMIN' });
    await updateCategory(categoryId, NAME('Category Edited'));

    const activityIds: Record<'test' | 'game', string> = { test: '', game: '' };
    for (const type of ['test', 'game'] as const) {
      await createActivity(type, {
        title: NAME(`Activity ${type}`),
        description: 'E2E',
        slug: `e2e-${type}-${RUN}`,
        categoryId,
        icon: null,
      });
      const activity = (await fetchActivities(type)).find(
        (a) => a.title === NAME(`Activity ${type}`),
      );
      expect(activity).toBeDefined();
      activityIds[type] = activity?.id ?? '';
      track({ kind: 'activity', id: activityIds[type], account: 'ADMIN', extra: type });
    }
    await updateActivity('test', activityIds.test, {
      title: NAME('Activity test edited'),
      description: 'E2E edited',
      slug: `e2e-test-${RUN}`,
      categoryId,
      icon: null,
    });

    await createQuestion(activityIds.test, {
      text: NAME('Question'),
      image: null,
      type: 'SingleChoice',
      options: [
        { text: 'E2E A', image: null, isCorrect: true, correctOrder: null },
        { text: 'E2E B', image: null, isCorrect: false, correctOrder: null },
      ],
    });
    const detail = await fetchActivity('test', activityIds.test);
    expect(detail.title).toBe(NAME('Activity test edited'));
    const question = detail.questions[0];
    expect(question).toBeDefined();
    const questionId = question?.id ?? '';
    track({ kind: 'question', id: questionId, account: 'ADMIN' });
    const option = (await fetchQuestion(questionId)).options[1];
    if (option) {
      await updateOption(option.id, {
        text: 'E2E B edited',
        image: null,
        order: 2,
        isCorrect: false,
        correctOrder: null,
      });
      await deleteOption(option.id);
      expect((await fetchQuestion(questionId)).options).toHaveLength(1);
    }

    // First plan activity for a child without a plan (teacher assigned above) creates the plan.
    await signInLive('SPECIALIST');
    await assignActivity(childId, activityIds.test);
    expect((await fetchSpecialistPlan(childId)).activities.map((a) => a.activityId)).toContain(
      activityIds.test,
    );
    await signInLive('PARENT');
    expect(
      (await fetchChildPlanActivities(childId)).some((a) => a.activityId === activityIds.test),
    ).toBe(true);
    // The child plays it and the result is saved (POST …/activities/{planActivityId}/submit).
    const played = await fetchPlanActivityDetail(childId, activityIds.test);
    const playedQuestion = played.questions[0];
    const playedOption = playedQuestion?.options[0];
    expect(playedOption).toBeDefined();
    await submitPlanActivity(childId, played.activity.id, [
      { questionId: playedQuestion?.id ?? '', selectedOptionId: playedOption?.id ?? '' },
    ]);
    await signInLive('SPECIALIST');
    const saved = (await fetchSpecialistPlan(childId)).activities.find(
      (a) => a.activityId === activityIds.test,
    );
    expect(saved).toMatchObject({ isCompleted: true, correctAnswers: 1, wrongAnswers: 0 });
    await removeActivity(childId, activityIds.test);
    await signInLive('ADMIN');

    await addCategoryToAssessment(categoryId);
    track({ kind: 'assessmentCategory', id: categoryId, account: 'ADMIN' });
    // Live 2026-10-10: initial-assessment/categories is readable by the Specialist only (Admin 403).
    await signInLive('SPECIALIST');
    expect(await fetchAssessmentCategoryIds()).toContain(categoryId);
    await signInLive('ADMIN');
    await addQuestionsToAssessment([questionId]);
    await removeQuestionFromAssessment(questionId);
    await removeCategoryFromAssessment(categoryId);
    untrack('assessmentCategory', categoryId);
    await signInLive('SPECIALIST');
    expect(await fetchAssessmentCategoryIds()).not.toContain(categoryId);
    await signInLive('ADMIN');

    await deleteQuestion(questionId);
    untrack('question', questionId);
    expect(await isGone(() => fetchQuestion(questionId))).toBe(true);
    for (const type of ['test', 'game'] as const) {
      await deleteActivity(type, activityIds[type]);
      untrack('activity', activityIds[type]);
      expect(await isGone(() => fetchActivity(type, activityIds[type]))).toBe(true);
    }
    await deleteCategory(categoryId);
    untrack('category', categoryId);
    expect((await fetchCategories()).some((c) => c.id === categoryId)).toBe(false);
  });

  it('Parent: delete the disposable child (cascade verified)', async () => {
    await signInLive('PARENT');
    await deleteChild(childId);
    untrack('child', childId);
    expect(await isGone(() => fetchParentChild(childId))).toBe(true);
    expect(await fetchChildReport(childId).catch(() => null)).toBeNull();
  });
});
