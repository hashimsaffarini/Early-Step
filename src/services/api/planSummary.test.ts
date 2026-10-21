import type { PlanActivity } from './childPlan';
import { summarizePlan } from './planSummary';

function row(overrides: Partial<PlanActivity>): PlanActivity {
  return {
    id: 'p',
    activityId: 'a',
    title: 'نشاط',
    description: '',
    iconUrl: null,
    type: 'test',
    order: null,
    assignedAt: null,
    isCompleted: false,
    completedAt: null,
    score: null,
    correctAnswers: null,
    wrongAnswers: null,
    slug: null,
    ...overrides,
  };
}

describe('summarizePlan (derived from real plan rows only)', () => {
  it('derives counts and progress: 2 of 4 completed → 50 %, all → 100 %', () => {
    const half = [row({ isCompleted: true }), row({ isCompleted: true }), row({}), row({})];
    expect(summarizePlan(half)).toMatchObject({
      total: 4,
      completed: 2,
      remaining: 2,
      progress: 50,
    });
    expect(summarizePlan(half.map((item) => ({ ...item, isCompleted: true }))).progress).toBe(100);
  });

  it("prefers the plan's server progress when the endpoint sends it", () => {
    expect(summarizePlan([row({ isCompleted: true }), row({})], 40).progress).toBe(40);
  });

  it('sums answers and averages scores over completed activities that have them', () => {
    const summary = summarizePlan([
      row({ isCompleted: true, score: 67, correctAnswers: 2, wrongAnswers: 1 }),
      row({ isCompleted: true, score: 100, correctAnswers: 3, wrongAnswers: 0 }),
      row({ isCompleted: false, score: null }),
    ]);
    expect(summary).toMatchObject({ correctAnswers: 5, wrongAnswers: 1, averageScore: 84 });
  });

  it('never invents 0 for missing data (no score fields → null; empty plan → no progress)', () => {
    expect(summarizePlan([row({ isCompleted: true })])).toMatchObject({
      correctAnswers: null,
      wrongAnswers: null,
      averageScore: null,
    });
    expect(summarizePlan([]).progress).toBeNull();
  });
});
