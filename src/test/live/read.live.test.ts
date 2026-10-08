/**
 * LIVE, READ-ONLY contract tests: every call is a GET (plus login). They prove that the app's own
 * Zod schemas and mappers accept the real responses. Assertions check structure only.
 */
import { fetchPlanActivityDetail } from '@/features/activities/api/planActivityApi';
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
import { fetchAdminUser, fetchAdminUsers } from '@/features/users/api/usersApi';
import { fetchUnreadMessagesCount } from '@/services/api/chatUnread';
import { fetchChildPlanActivities, fetchChildPlanSummary } from '@/services/api/childPlan';
import { fetchChildReport } from '@/services/api/childReports';
import { fetchChildrenForRole } from '@/services/api/childrenLists';

import { hasAccount, signInLive } from './liveSession';

describe.runIf(hasAccount('PARENT'))('live — Parent', () => {
  it('signs in with the verified login contract', async () => {
    const session = await signInLive('PARENT');
    expect(session.user.role).toBe('Parent');
    expect(session.user.id).toBeTruthy();
    expect(session.expiresAt).toBeGreaterThan(Date.now());
  });

  it('reads children, child detail, plan, summary, reports, activity detail', async () => {
    const children = await fetchChildrenForRole('Parent');
    expect(Array.isArray(children)).toBe(true);
    for (const child of children) {
      expect(child.gender === null || ['ولد', 'بنت'].includes(child.gender)).toBe(true);
      await fetchParentChild(child.id);
      const plan = await fetchChildPlanActivities(child.id);
      await fetchChildPlanSummary(child.id);
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
});

describe.runIf(hasAccount('ADMIN'))('live — Admin', () => {
  it('reads dashboard, users, a parent detail, content and assessment categories', async () => {
    const session = await signInLive('ADMIN');
    expect(session.user.role).toBe('Admin');
    expect((await fetchDashboardStats('admin')).length).toBeGreaterThan(0);
    const users = await fetchAdminUsers('', '');
    const parent = users.users.find((user) => user.role === 'Parent');
    if (parent) await fetchAdminUser(parent.id);
    await fetchCategories();
    await fetchAssessmentCategoryIds();
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
