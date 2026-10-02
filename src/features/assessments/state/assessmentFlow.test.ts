import {
  assessmentFlowReducer,
  countCompletedSections,
  INITIAL_ASSESSMENT_FLOW,
  type AssessmentFlowAction,
  type AssessmentFlowState,
} from './assessmentFlow';

const run = (
  actions: AssessmentFlowAction[],
  from = INITIAL_ASSESSMENT_FLOW,
): AssessmentFlowState => actions.reduce(assessmentFlowReducer, from);

describe('assessmentFlowReducer', () => {
  it('starts on the intro with nothing completed', () => {
    expect(INITIAL_ASSESSMENT_FLOW.view).toEqual({ type: 'intro' });
    expect(countCompletedSections(INITIAL_ASSESSMENT_FLOW)).toBe(0);
  });

  it('plays one section, marks it complete and returns to the intro', () => {
    const state = run([
      { type: 'startSection', section: 'math' },
      { type: 'finishSection', section: 'math', answered: 6 },
    ]);
    expect(state.view).toEqual({ type: 'sectionDone', section: 'math' });
    expect(state.completed.math).toBe(6);

    expect(assessmentFlowReducer(state, { type: 'continue' }).view).toEqual({ type: 'intro' });
  });

  it('plays all remaining sections in order, skipping completed ones', () => {
    let state = run([
      { type: 'startSection', section: 'math' },
      { type: 'finishSection', section: 'math', answered: 6 },
      { type: 'playAll' },
    ]);
    expect(state.view).toEqual({ type: 'section', section: 'reading' });
    expect(state.queue).toEqual(['memory', 'attention']);

    state = run(
      [{ type: 'finishSection', section: 'reading', answered: 6 }, { type: 'continue' }],
      state,
    );
    expect(state.view).toEqual({ type: 'section', section: 'memory' });
  });

  it('shows results once every section is completed', () => {
    const state = run([
      { type: 'playAll' },
      { type: 'finishSection', section: 'reading', answered: 6 },
      { type: 'continue' },
      { type: 'finishSection', section: 'math', answered: 6 },
      { type: 'continue' },
      { type: 'finishSection', section: 'memory', answered: 5 },
      { type: 'continue' },
      { type: 'finishSection', section: 'attention', answered: 6 },
      { type: 'continue' },
    ]);
    expect(state.view).toEqual({ type: 'results' });
    expect(countCompletedSections(state)).toBe(4);
  });

  it('leaves a play-all run when going back to the intro', () => {
    const state = run([{ type: 'playAll' }, { type: 'backToIntro' }]);
    expect(state.view).toEqual({ type: 'intro' });
    expect(state.queue).toEqual([]);
  });
});
