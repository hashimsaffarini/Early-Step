import { ASSESSMENT_SECTION_KEYS, type AssessmentSectionKey } from '../types';

/**
 * Local state machine for the initial assessment:
 * intro → section → sectionDone → (next section | intro) → … → results.
 * Nothing is persisted and no score is kept — only how many questions each section answered.
 */
export type AssessmentView =
  | { type: 'intro' }
  | { type: 'section'; section: AssessmentSectionKey }
  | { type: 'sectionDone'; section: AssessmentSectionKey }
  | { type: 'results' };

export interface AssessmentFlowState {
  view: AssessmentView;
  /** Answered-question count per completed section. */
  completed: Partial<Record<AssessmentSectionKey, number>>;
  /** Sections still to play in a "play all" run. */
  queue: readonly AssessmentSectionKey[];
}

export type AssessmentFlowAction =
  | { type: 'startSection'; section: AssessmentSectionKey }
  | { type: 'playAll' }
  | { type: 'finishSection'; section: AssessmentSectionKey; answered: number }
  | { type: 'continue' }
  | { type: 'backToIntro' };

export const INITIAL_ASSESSMENT_FLOW: AssessmentFlowState = {
  view: { type: 'intro' },
  completed: {},
  queue: [],
};

export function isSectionCompleted(
  state: AssessmentFlowState,
  section: AssessmentSectionKey,
): boolean {
  return state.completed[section] !== undefined;
}

export function countCompletedSections(state: AssessmentFlowState): number {
  return ASSESSMENT_SECTION_KEYS.filter((key) => isSectionCompleted(state, key)).length;
}

function remainingSections(state: AssessmentFlowState): AssessmentSectionKey[] {
  return ASSESSMENT_SECTION_KEYS.filter((key) => !isSectionCompleted(state, key));
}

function playNextIn(
  state: AssessmentFlowState,
  queue: readonly AssessmentSectionKey[],
): AssessmentFlowState {
  const pending = queue.filter((key) => !isSectionCompleted(state, key));
  const [next, ...rest] = pending;
  if (next) return { ...state, view: { type: 'section', section: next }, queue: rest };
  if (remainingSections(state).length === 0) {
    return { ...state, view: { type: 'results' }, queue: [] };
  }
  return { ...state, view: { type: 'intro' }, queue: [] };
}

export function assessmentFlowReducer(
  state: AssessmentFlowState,
  action: AssessmentFlowAction,
): AssessmentFlowState {
  switch (action.type) {
    case 'startSection':
      return { ...state, view: { type: 'section', section: action.section }, queue: [] };
    case 'playAll':
      return playNextIn(state, remainingSections(state));
    case 'finishSection':
      return {
        ...state,
        completed: { ...state.completed, [action.section]: action.answered },
        view: { type: 'sectionDone', section: action.section },
      };
    case 'continue':
      return playNextIn(state, state.queue);
    case 'backToIntro':
      return { ...state, view: { type: 'intro' }, queue: [] };
  }
}
