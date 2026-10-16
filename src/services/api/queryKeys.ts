/**
 * Centralized TanStack Query keys. Every feature builds keys here so a mutation in one feature
 * can invalidate data shown by another (e.g. creating a report refreshes a child's report list).
 * Keys hold mapped domain data; one key = one shape (never cache two shapes under one key).
 * Logout/401 clears the whole cache, so no user's data survives an account switch.
 */
export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  children: {
    all: ['children'] as const,
    detail: (childId: string) => ['children', 'detail', childId] as const,
    byRole: (role: string) => ['children', 'role', role] as const,
  },
  reports: {
    all: ['reports'] as const,
    specialist: () => ['reports', 'specialist'] as const,
    byChild: (childId: string) => ['reports', 'child', childId] as const,
  },
  trainingPlans: {
    all: ['trainingPlans'] as const,
    childActivities: (childId: string, type?: string) =>
      ['trainingPlans', 'child', childId, 'activities', type ?? 'all'] as const,
    childSummary: (childId: string) => ['trainingPlans', 'child', childId, 'summary'] as const,
    childActivity: (childId: string, activityId: string) =>
      ['trainingPlans', 'child', childId, 'activity', activityId] as const,
    specialistPlan: (childId: string) => ['trainingPlans', 'specialist', childId] as const,
    activityResult: (childId: string, planActivityId: string) =>
      ['trainingPlans', 'specialist', childId, 'result', planActivityId] as const,
    available: (childId: string, type?: string) =>
      ['trainingPlans', 'specialist', childId, 'available', type ?? 'all'] as const,
  },
  assessments: {
    all: ['assessments'] as const,
    result: (childId: string) => ['assessments', 'result', childId] as const,
  },
  content: {
    all: ['content'] as const,
    categories: () => ['content', 'categories'] as const,
    categoriesWithCounts: (type: string) => ['content', 'categoriesActivity', type] as const,
    activities: (type: string, categoryId?: string) =>
      ['content', 'activities', type, categoryId ?? 'all'] as const,
    activity: (type: string, activityId: string) =>
      ['content', 'activity', type, activityId] as const,
    question: (questionId: string) => ['content', 'question', questionId] as const,
    initialAssessmentCategories: () => ['content', 'initialAssessment', 'categories'] as const,
  },
  dashboards: {
    admin: () => ['dashboards', 'admin'] as const,
    specialist: () => ['dashboards', 'specialist'] as const,
    teacher: () => ['dashboards', 'teacher'] as const,
    superAdmin: () => ['dashboards', 'superAdmin'] as const,
  },
  users: {
    all: ['users'] as const,
    admin: (role?: string, search?: string) =>
      ['users', 'admin', role ?? '', search ?? ''] as const,
    adminDetail: (userId: string) => ['users', 'admin', 'detail', userId] as const,
    specialists: () => ['users', 'specialists'] as const,
    assignableChildren: () => ['users', 'admin', 'assignableChildren'] as const,
    superAdmin: (role?: string, search?: string) =>
      ['users', 'superAdmin', role ?? '', search ?? ''] as const,
  },
  notes: {
    all: ['notes'] as const,
    byChild: (childId: string) => ['notes', 'child', childId] as const,
  },
  chat: {
    all: ['chat'] as const,
    conversations: () => ['chat', 'conversations'] as const,
    messages: (conversationId: string) => ['chat', 'messages', conversationId] as const,
    users: () => ['chat', 'users'] as const,
    unread: () => ['chat', 'unread'] as const,
  },
} as const;
