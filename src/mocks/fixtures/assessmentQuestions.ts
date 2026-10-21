/**
 * TEMPORARY MOCK DATA — initial-assessment questions and plan-activity questions served by the
 * MSW handlers (fictional, child-friendly). Shapes follow the admin question model (verified live).
 * Correct answers exist only server-side; the child never sees them.
 */
import { registerMockTable } from '../db';

import { MOCK_CATEGORY_IDS } from './content';

export interface MockOption {
  id: string;
  optionText: string;
  optionImageUrl: string | null;
  isCorrect: boolean;
  /** Sequence position (1-based); null for other types. */
  correctOrder: number | null;
}

export interface MockQuestion {
  id: string;
  questionText: string;
  questionImageUrl: string | null;
  type: 'SingleChoice' | 'MultiSelect' | 'Sequence';
  options: MockOption[];
}

function single(
  id: string,
  text: string,
  options: readonly string[],
  correct: number,
): MockQuestion {
  return {
    id,
    questionText: text,
    questionImageUrl: null,
    type: 'SingleChoice',
    options: options.map((optionText, index) => ({
      id: `${id}-o${(index + 1).toString()}`,
      optionText,
      optionImageUrl: null,
      isCorrect: index === correct,
      correctOrder: null,
    })),
  };
}

function multi(id: string, text: string, options: readonly [string, boolean][]): MockQuestion {
  return {
    id,
    questionText: text,
    questionImageUrl: null,
    type: 'MultiSelect',
    options: options.map(([optionText, isCorrect], index) => ({
      id: `${id}-o${(index + 1).toString()}`,
      optionText,
      optionImageUrl: null,
      isCorrect,
      correctOrder: null,
    })),
  };
}

/** Options listed in display order; `order` gives each one's correct position. */
function sequence(id: string, text: string, options: readonly [string, number][]): MockQuestion {
  return {
    id,
    questionText: text,
    questionImageUrl: null,
    type: 'Sequence',
    options: options.map(([optionText, order], index) => ({
      id: `${id}-o${(index + 1).toString()}`,
      optionText,
      optionImageUrl: null,
      isCorrect: false,
      correctOrder: order,
    })),
  };
}

/**
 * Initial-assessment questions per admin category id (`content.ts`). `start` sends the categories
 * that are in the assessment (admin membership), each with these questions — every question type.
 */
export const MOCK_ASSESSMENT_QUESTIONS: Readonly<Record<string, readonly MockQuestion[]>> = {
  [MOCK_CATEGORY_IDS.reading]: [
    single('q-read-1', 'أي صورة تبدأ بحرف الباء؟', ['بطة', 'تفاحة', 'سمكة', 'قطة'], 0),
    single('q-read-2', 'ما الحرف الأول في كلمة «قمر»؟', ['ق', 'م', 'ر', 'ب'], 0),
  ],
  [MOCK_CATEGORY_IDS.math]: [
    single('q-math-1', 'كم تفاحة إذا كان لديك تفاحتان وأضفت واحدة؟', ['2', '3', '4', '5'], 1),
    multi('q-math-2', 'اختر الأعداد الزوجية', [
      ['2', true],
      ['3', false],
      ['4', true],
    ]),
    sequence('q-math-3', 'رتّب الأعداد من الأصغر إلى الأكبر', [
      ['5', 3],
      ['1', 1],
      ['3', 2],
    ]),
  ],
};

/** Questions inside training-plan activities, keyed by `activityId`. */
export const MOCK_ACTIVITY_QUESTIONS: Readonly<Record<string, readonly MockQuestion[]>> = {
  // Mock game activities (dev review of the game engines; mock mode only).
  'g0000000-0000-4000-8000-000000000001': [
    single('q-g1-1', 'ما الحرف الأول في كلمة «أسد»؟', ['أ', 'ب', 'ت'], 0),
    single('q-g1-2', 'ما الحرف الأول في كلمة «شمس»؟', ['س', 'ش', 'ص'], 1),
  ],
  'g0000000-0000-4000-8000-000000000002': [
    single('q-g2-1', 'كم عدد أصابع اليد الواحدة؟', ['3', '4', '5', '6'], 2),
    single('q-g2-2', 'ما العدد الذي يأتي بعد 7؟', ['6', '8', '9', '10'], 1),
  ],
  'g0000000-0000-4000-8000-000000000003': [
    sequence('q-g3-1', 'رتّب حروف كلمة «قلم»', [
      ['ل', 2],
      ['م', 3],
      ['ق', 1],
    ]),
  ],
  'g0000000-0000-4000-8000-000000000004': [
    multi('q-g4-1', 'اختر كل الفواكه', [
      ['تفاحة', true],
      ['كرسي', false],
      ['موز', true],
      ['قلم', false],
      ['عنب', true],
      ['كرة', false],
    ]),
  ],
  'a0000000-0000-4000-8000-000000000001': [
    single('q-act1-1', 'أي كلمة تبدأ بحرف الباء؟', ['بطة', 'تفاحة', 'شجرة', 'سيارة'], 0),
    single('q-act1-2', 'كم حرفاً في كلمة «شمس»؟', ['2', '3', '4', '5'], 1),
  ],
};

export interface MockAssessmentSection {
  id: string;
  name: string;
  questions: readonly MockQuestion[];
}

export interface MockAssessmentSession {
  id: string;
  childId: string;
  sections: readonly MockAssessmentSection[];
  questions: MockQuestion[];
  /** questionId → the option ids the child chose (in order) and the server's verdict. */
  answers: Map<string, { optionIds: string[]; isCorrect: boolean }>;
  completed: boolean;
}

/** Scoring verified live 2026-10-14 (initial assessment and plan submit). */
export function isMockAnswerCorrect(question: MockQuestion, optionIds: readonly string[]): boolean {
  if (question.type === 'Sequence') {
    const expected = [...question.options]
      .sort((a, b) => (a.correctOrder ?? 0) - (b.correctOrder ?? 0))
      .map((option) => option.id);
    return (
      expected.length === optionIds.length && expected.every((id, index) => optionIds[index] === id)
    );
  }
  const correct = question.options.filter((option) => option.isCorrect).map((option) => option.id);
  return correct.length === optionIds.length && optionIds.every((id) => correct.includes(id));
}

export const mockAssessmentSessions = new Map<string, MockAssessmentSession>();

registerMockTable(() => {
  mockAssessmentSessions.clear();
});
