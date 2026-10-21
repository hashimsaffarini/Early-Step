/**
 * LIVE WRITE suite (`npm run test:live:write`) — authorized disposable records only.
 * Every record is named "E2E Test …", tracked when created and deleted in `afterAll`; the suite
 * FAILS if cleanup leaves anything behind. Uses the app's own API functions. No data is printed.
 * Not included: chat messages (the API cannot delete them) and Parent registration (no user delete).
 * A SUCCESSFUL plan-activity submission is opt-in (`E2E_PLAN_SUBMIT=1`): by product rule a child
 * with saved activity results is kept (deletion refused), so it would leave a record behind.
 */
import {
  fetchPlanActivityDetail,
  submitPlanActivity,
  type PlanQuestion,
} from '@/features/activities/api/planActivityApi';
import type { ChoiceAnswer } from '@/components/players';
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
  fetchPlanActivityResult,
  fetchSpecialistPlan,
  fetchTeachers,
  removeActivity,
} from '@/features/training-plans/api/trainingPlansApi';
import { assignChildrenToSpecialist, fetchSpecialists } from '@/features/users/api/usersApi';
import { fetchChildReport } from '@/services/api/childReports';
import { fetchAssessmentResult } from '@/services/api/assessmentResult';
import { fetchChildPlanActivities } from '@/services/api/childPlan';
import { fetchChildrenForRole } from '@/services/api/childrenLists';
import { planCorrectAnswerUpdates } from '@/features/content/api/correctAnswers';
import { isAppError } from '@/services/http/apiError';

import { hasAccount, signInLive, type LiveAccount } from './liveSession';

const RUN = Date.now().toString(36);
const PLAN_SUBMIT = process.env.E2E_PLAN_SUBMIT === '1';

/** First option(s) of each question, in the payload its type needs (all options for a Sequence). */
function firstAnswer(question: Pick<PlanQuestion, 'id' | 'type' | 'options'>): ChoiceAnswer | null {
  const [first] = question.options;
  if (!first) return null;
  if (question.type === 'MultiSelect') {
    return { questionId: question.id, selectedOptionIds: [first.id] };
  }
  if (question.type === 'Sequence') {
    return { questionId: question.id, orderedOptionIds: question.options.map((o) => o.id) };
  }
  return { questionId: question.id, selectedOptionId: first.id };
}

async function statusOf(call: () => Promise<unknown>): Promise<number | 'ok'> {
  try {
    await call();
    return 'ok';
  } catch (error) {
    return isAppError(error) ? (error.status ?? 0) : 0;
  }
}

async function messageOf(call: () => Promise<unknown>): Promise<string> {
  try {
    await call();
    return '';
  } catch (error) {
    return error instanceof Error ? error.message : '';
  }
}
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

/** A valid 1×1 PNG for the image upload checks (disposable records only). */
const PNG = Uint8Array.from(
  atob(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  ),
  (char) => char.charCodeAt(0),
);

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

  it('Parent: initial assessment start → answer every type → complete; staff GET the result', async () => {
    await signInLive('ADMIN');
    expect(await fetchAssessmentResult(childId)).toBeNull();
    await signInLive('PARENT');
    const started = await startAssessment(childId);
    expect(started.questions.length).toBeGreaterThan(0);
    for (const question of started.questions) {
      const answer = firstAnswer(question);
      if (answer) await submitAnswer({ assessmentId: started.assessmentId, answer });
    }
    await completeAssessment(started.assessmentId);
    // The Result endpoint is the source of truth, for staff (the parent does not reopen it).
    // Since 2026-10-15 a specialist not assigned to the child gets 403; Admin reads it.
    await signInLive('SPECIALIST');
    await expect(fetchAssessmentResult(childId)).rejects.toMatchObject({ status: 403 });
    await signInLive('ADMIN');
    const saved = await fetchAssessmentResult(childId);
    expect(saved?.assessmentId).toBe(started.assessmentId);
    expect(typeof saved?.overallScore).toBe('number');
    const answered = saved?.categories.flatMap((category) => category.questions) ?? [];
    expect(answered).toHaveLength(started.questions.length);
    expect(saved?.categories.every((c) => c.totalQuestions === c.questions.length)).toBe(true);
  });

  it('Admin: picks the specialist from Admin/specialists and assigns the child', async () => {
    const specialist = await signInLive('SPECIALIST');
    specialistId = specialist.user.id;
    await signInLive('ADMIN');
    expect((await fetchSpecialists()).some((item) => item.id === specialistId)).toBe(true);
    await assignChildrenToSpecialist({ specialistId, childIds: [childId] });
    await signInLive('SPECIALIST');
    expect((await fetchChildrenForRole('Specialist')).some((c) => c.id === childId)).toBe(true);
    // Once assigned, the specialist reads the child's saved result.
    expect((await fetchAssessmentResult(childId))?.overallScore).toEqual(expect.any(Number));
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

    // One report per child: a second one is refused (409).
    expect(
      await statusOf(() =>
        createReport({
          childId,
          title: NAME('Report 2'),
          weaknesses: 'E2E',
          recommendations: 'E2E',
        }),
      ),
    ).toBe(409);

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
    // Images (client revision 2026-10): an uploaded icon is stored, a replacement gets a new path,
    // and an edit without a file keeps it. (Serving the files is a backend issue: /uploads → 404.)
    const icon = () => new File([PNG], 'e2e.png', { type: 'image/png' });
    const editTest = (withIcon: boolean) =>
      updateActivity('test', activityIds.test, {
        title: NAME('Activity test edited'),
        description: 'E2E edited',
        slug: `e2e-test-${RUN}`,
        categoryId,
        icon: withIcon ? icon() : null,
      });
    await editTest(true);
    const firstIcon = (await fetchActivity('test', activityIds.test)).iconUrl;
    expect(firstIcon).toMatch(/^\/uploads\//);
    await editTest(true);
    const secondIcon = (await fetchActivity('test', activityIds.test)).iconUrl;
    expect(secondIcon).toMatch(/^\/uploads\//);
    expect(secondIcon).not.toBe(firstIcon);
    await editTest(false);
    expect((await fetchActivity('test', activityIds.test)).iconUrl).toBe(secondIcon);

    await createQuestion(activityIds.test, {
      text: NAME('Question'),
      image: null,
      type: 'SingleChoice',
      options: [
        { text: 'E2E A', image: null, isCorrect: true, correctOrder: null },
        { text: 'E2E B', image: null, isCorrect: false, correctOrder: null },
      ],
    });
    await createQuestion(activityIds.test, {
      text: NAME('Question 2'),
      image: null,
      type: 'MultiSelect',
      options: [
        { text: 'E2E C', image: null, isCorrect: true, correctOrder: null },
        { text: 'E2E D', image: null, isCorrect: true, correctOrder: null },
      ],
    });
    const detail = await fetchActivity('test', activityIds.test);
    expect(detail.title).toBe(NAME('Activity test edited'));
    for (const item of detail.questions) {
      if (item.text === NAME('Question 2'))
        track({ kind: 'question', id: item.id, account: 'ADMIN' });
    }
    const question = detail.questions.find((item) => item.text === NAME('Question'));
    expect(question).toBeDefined();
    const questionId = question?.id ?? '';
    track({ kind: 'question', id: questionId, account: 'ADMIN' });

    // Correct answers (client revision 2026-10): switch the SingleChoice answer A → B and back
    // with the planned update order; each switch survives a re-fetch.
    const switchTo = async (text: string) => {
      const current = await fetchQuestion(questionId);
      const target = current.options.find((item) => item.text === text);
      for (const step of planCorrectAnswerUpdates(current, {
        kind: 'choice',
        correctIds: target ? [target.id] : [],
      })) {
        await updateOption(step.optionId, step.input);
      }
      return (await fetchQuestion(questionId)).options.map((item) => [item.text, item.isCorrect]);
    };
    expect(await switchTo('E2E B')).toEqual(
      expect.arrayContaining([
        ['E2E A', false],
        ['E2E B', true],
      ]),
    );
    expect(await switchTo('E2E A')).toEqual(
      expect.arrayContaining([
        ['E2E A', true],
        ['E2E B', false],
      ]),
    );
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

    // The first plan activity needs a teacher: without one → 400 with a clear message.
    await signInLive('SPECIALIST');
    expect(await messageOf(() => assignActivity(childId, activityIds.test))).toBe(
      'يجب تعيين معلم للطفل قبل إنشاء الخطة التدريبية.',
    );
    const [teacher] = await fetchTeachers();
    expect(teacher).toBeDefined();
    await assignTeacher(teacher?.id ?? '', [childId]);
    await assignActivity(childId, activityIds.test);
    expect((await fetchSpecialistPlan(childId)).activities.map((a) => a.activityId)).toContain(
      activityIds.test,
    );
    await signInLive('PARENT');
    expect(
      (await fetchChildPlanActivities(childId)).some((a) => a.activityId === activityIds.test),
    ).toBe(true);
    // Submissions the server refuses save nothing: empty answers and partial answers → 400.
    const played = await fetchPlanActivityDetail(childId, activityIds.test);
    expect(played.questions).toHaveLength(2);
    const answers = played.questions.map(firstAnswer).filter((a) => a !== null);
    expect(await statusOf(() => submitPlanActivity(childId, played.activity.id, []))).toBe(400);
    expect(
      await messageOf(() => submitPlanActivity(childId, played.activity.id, answers.slice(0, 1))),
    ).toBe('All activity questions must be answered.');
    // The result exists only after a submission (Specialist; Parent 403).
    expect(await statusOf(() => fetchPlanActivityResult(childId, played.activity.id))).toBe(403);
    await signInLive('SPECIALIST');
    expect(await statusOf(() => fetchPlanActivityResult(childId, played.activity.id))).toBe(404);
    if (PLAN_SUBMIT) {
      // Opt-in: leaves the child undeletable on the live backend (see the header).
      await signInLive('PARENT');
      await submitPlanActivity(childId, played.activity.id, answers);
      expect(await statusOf(() => submitPlanActivity(childId, played.activity.id, answers))).toBe(
        409,
      );
      await signInLive('SPECIALIST');
      const result = await fetchPlanActivityResult(childId, played.activity.id);
      expect(result.activity).toMatchObject({ isCompleted: true, score: 50, correctAnswers: 1 });
      expect(result.questions.map((q) => q.isCorrect)).toEqual([true, false]);
      const row = (await fetchSpecialistPlan(childId)).activities.find(
        (a) => a.activityId === activityIds.test,
      );
      expect(row).toMatchObject({ isCompleted: true, score: 50 });
    }
    // A played activity keeps its results (product rule) — only an unplayed one is removed.
    if (!PLAN_SUBMIT) await removeActivity(childId, activityIds.test);
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

    for (const item of detail.questions) {
      await deleteQuestion(item.id);
      untrack('question', item.id);
      expect(await isGone(() => fetchQuestion(item.id))).toBe(true);
    }
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
