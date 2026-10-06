/**
 * TEMPORARY MOCK DATA — initial-assessment questions and plan-activity questions served by the
 * MSW handlers (fictional, child-friendly). Shapes follow the admin question model (Apidog);
 * NOT LIVE-VERIFIED. Correct answers exist only server-side; the assessment UI never shows them.
 */
import { registerMockTable } from '../db';

export interface MockOption {
  id: string;
  optionText: string;
  optionImageUrl: string | null;
  isCorrect: boolean;
}

export interface MockQuestion {
  id: string;
  questionText: string;
  questionImageUrl: string | null;
  type: 'SingleChoice' | 'MultiSelect' | 'Sequence' | 'Matching';
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
    })),
  };
}

/** Initial assessment: two categories (sections) of single-choice questions. */
export const MOCK_ASSESSMENT_CATEGORIES: readonly { name: string; questions: MockQuestion[] }[] = [
  {
    name: 'القراءة',
    questions: [
      single('q-read-1', 'أي صورة تبدأ بحرف الباء؟', ['بطة', 'تفاحة', 'سمكة', 'قطة'], 0),
      single('q-read-2', 'ما الحرف الأول في كلمة «قمر»؟', ['ق', 'م', 'ر', 'ب'], 0),
    ],
  },
  {
    name: 'الرياضيات',
    questions: [
      single('q-math-1', 'كم تفاحة إذا كان لديك تفاحتان وأضفت واحدة؟', ['2', '3', '4', '5'], 1),
    ],
  },
];

/** Questions inside training-plan activities, keyed by `activityId`. */
export const MOCK_ACTIVITY_QUESTIONS: Readonly<Record<string, readonly MockQuestion[]>> = {
  'a0000000-0000-4000-8000-000000000001': [
    single('q-act1-1', 'أي كلمة تبدأ بحرف الباء؟', ['بطة', 'تفاحة', 'شجرة', 'سيارة'], 0),
    single('q-act1-2', 'كم حرفاً في كلمة «شمس»؟', ['2', '3', '4', '5'], 1),
  ],
};

export interface MockAssessmentSession {
  id: string;
  childId: string;
  questions: MockQuestion[];
  answered: Set<string>;
  completed: boolean;
}

export const mockAssessmentSessions = new Map<string, MockAssessmentSession>();

registerMockTable(() => {
  mockAssessmentSessions.clear();
});
