/**
 * LIVE, READ-ONLY contract tests: every call is a GET (plus login). They prove that the app's own
 * Zod schemas and mappers accept the real responses. Assertions check structure only.
 */
import { fetchPlanActivityDetail } from '@/features/activities/api/planActivityApi';
import { fetchCurrentUser } from '@/features/auth/api/currentUser';
import { fetchChatUsers, fetchConversations } from '@/features/chat/api/chatApi';
import { fetchParentChild } from '@/features/children/api/childrenApi';
import {
  fetchActivities,
  fetchActivity,
  fetchAssessmentCategoryIds,
  fetchCategories,
  fetchCategoriesWithCounts,
  fetchQuestion,
} from '@/features/content/api/contentApi';
import { fetchDashboardStats } from '@/features/dashboards/api/dashboardsApi';
import {
  fetchSuperAdminChildren,
  fetchSuperAdminUsers,
} from '@/features/dashboards/api/superAdminApi';
import { fetchSpecialistReports } from '@/features/reports/api/reportsApi';
import {
  fetchAvailableActivities,
  fetchSpecialistPlan,
  fetchTeachers,
} from '@/features/training-plans/api/trainingPlansApi';
import { fetchAdminUser, fetchAdminUsers, fetchSpecialists } from '@/features/users/api/usersApi';
import { fetchUnreadMessagesCount } from '@/services/api/chatUnread';
import { fetchChildPlanActivities, fetchChildPlanSummary } from '@/services/api/childPlan';
import { fetchAssessmentResult } from '@/services/api/assessmentResult';
import { fetchChildReport } from '@/services/api/childReports';
import { fetchChildrenForRole } from '@/services/api/childrenLists';
import { fetchChildFeedbacks } from '@/services/api/teacherFeedback';
import { isAppError } from '@/services/http/apiError';

import { hasAccount, signInLive, signOutLive, type LiveAccount } from './liveSession';

async function statusOf(call: () => Promise<unknown>): Promise<number | 'ok'> {
  try {
    await call();
    return 'ok';
  } catch (error) {
    return isAppError(error) ? (error.status ?? 0) : 0;
  }
}

describe('live — GET Auth/me (AuthInfo)', () => {
  it('answers 401 without a token', async () => {
    signOutLive();
    expect(await statusOf(() => fetchCurrentUser())).toBe(401);
  });

  const roles: [LiveAccount, string][] = [
    ['PARENT', 'Parent'],
    ['SPECIALIST', 'Specialist'],
    ['ADMIN', 'Admin'],
    ['SUPERADMIN', 'SuperAdmin'],
  ];
  it.each(roles.filter(([account]) => hasAccount(account)))(
    '%s: login hydrates the user from Auth/me with the right role',
    async (account, role) => {
      const session = await signInLive(account);
      expect(session.user.role).toBe(role);
      expect(session.user.id).toBeTruthy();
      expect(await fetchCurrentUser()).toEqual(session.user);
    },
  );
});

describe.runIf(hasAccount('PARENT'))('live — Parent', () => {
  it('signs in with the verified login contract', async () => {
    const session = await signInLive('PARENT');
    expect(session.user.role).toBe('Parent');
    expect(session.user.id).toBeTruthy();
    expect(session.expiresAt).toBeGreaterThan(Date.now());
  });

  it('reads children, child detail, plan, summary, report, assessment result, activity detail', async () => {
    const children = await fetchChildrenForRole('Parent');
    expect(Array.isArray(children)).toBe(true);
    for (const child of children) {
      expect(child.gender === null || ['ولد', 'بنت'].includes(child.gender)).toBe(true);
      await fetchParentChild(child.id);
      const plan = await fetchChildPlanActivities(child.id);
      await fetchChildPlanSummary(child.id);
      const result = await fetchAssessmentResult(child.id);
      expect(result === null || typeof result.overallScore === 'number').toBe(true);
      const report = await fetchChildReport(child.id);
      expect(report === null || typeof report.id === 'string').toBe(true);
      const first = plan[0];
      if (first) await fetchPlanActivityDetail(child.id, first.activityId);
    }
  });

  it('reads chat contacts, conversations and the unread count', async () => {
    expect((await fetchChatUsers()).length).toBeGreaterThan(0);
    expect(Array.isArray(await fetchConversations())).toBe(true);
    expect(typeof (await fetchUnreadMessagesCount())).toBe('number');
  });
});

describe.runIf(hasAccount('SPECIALIST'))('live — Specialist', () => {
  it('reads dashboard, children, plans, available activities, teachers, reports', async () => {
    const session = await signInLive('SPECIALIST');
    expect(session.user.role).toBe('Specialist');
    expect((await fetchDashboardStats('specialist')).length).toBeGreaterThan(0);
    const children = await fetchChildrenForRole('Specialist');
    for (const child of children) {
      const plan = await fetchSpecialistPlan(child.id);
      expect(typeof plan.hasPlan).toBe('boolean');
      await fetchAvailableActivities(child.id, 'test');
      await fetchAvailableActivities(child.id, 'game');
    }
    expect(Array.isArray(await fetchTeachers())).toBe(true);
    expect(Array.isArray(await fetchSpecialistReports())).toBe(true);
  });

  it("reads each child's assessment result and the teacher's feedback list", async () => {
    await signInLive('SPECIALIST');
    for (const child of await fetchChildrenForRole('Specialist')) {
      const result = await fetchAssessmentResult(child.id);
      expect(result === null || typeof result.overallScore === 'number').toBe(true);
      expect(Array.isArray(await fetchChildFeedbacks(child.id))).toBe(true);
    }
  });

  it('is refused the Admin specialist list (403)', async () => {
    await signInLive('SPECIALIST');
    expect(await statusOf(fetchSpecialists)).toBe(403);
  });
});

describe.runIf(hasAccount('ADMIN'))('live — Admin', () => {
  it('reads dashboard, users, a parent detail, content and assessment categories', async () => {
    const session = await signInLive('ADMIN');
    expect(session.user.role).toBe('Admin');
    expect((await fetchDashboardStats('admin')).length).toBeGreaterThan(0);
    const users = await fetchAdminUsers('', '');
    const parent = users.users.find((user) => user.role === 'Parent');
    if (parent) await fetchAdminUser(parent.id);
    // `Admin/specialists` lists exactly the specialists of the user list.
    const specialists = await fetchSpecialists();
    expect(specialists.map((item) => item.id).sort()).toEqual(
      (await fetchAdminUsers('أخصائي/ة', '')).users.map((user) => user.id).sort(),
    );
    await fetchCategories();
    expect(Array.isArray(await fetchAssessmentCategoryIds())).toBe(true);
    for (const type of ['test', 'game'] as const) {
      await fetchCategoriesWithCounts(type);
      const activities = await fetchActivities(type);
      const withQuestions = activities.find((activity) => activity.questionCount > 0);
      if (withQuestions) {
        const detail = await fetchActivity(type, withQuestions.id);
        const question = detail.questions[0];
        if (question) await fetchQuestion(question.id);
      }
    }
  });
});

describe.runIf(hasAccount('SUPERADMIN'))('live — Super Admin', () => {
  it('reads dashboard, users and children', async () => {
    const session = await signInLive('SUPERADMIN');
    expect(session.user.role).toBe('SuperAdmin');
    expect((await fetchDashboardStats('superAdmin')).length).toBeGreaterThan(0);
    expect((await fetchSuperAdminUsers('', '')).length).toBeGreaterThan(0);
    expect(Array.isArray(await fetchSuperAdminChildren(''))).toBe(true);
  });
});
