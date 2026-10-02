import type { ActivityCategory } from '@/constants/activityCategories';

/** The four sections of the initial assessment (Replit's four mini-games). */
export const ASSESSMENT_SECTION_KEYS = ['reading', 'math', 'memory', 'attention'] as const;

export type AssessmentSectionKey = (typeof ASSESSMENT_SECTION_KEYS)[number];

export interface AssessmentOption {
  label: string;
  emoji?: string;
}

export interface AssessmentStimulus {
  value: string;
  /** Math expressions stay left-to-right inside the RTL page. */
  kind?: 'text' | 'expression';
}

export interface MemoryItem {
  emoji: string;
  label: string;
}

export interface AssessmentQuestion {
  id: string;
  prompt: string;
  stimulus: AssessmentStimulus;
  options: readonly AssessmentOption[];
  /** Memory questions: pictures shown first, before the question. */
  memorize?: readonly MemoryItem[];
}

export interface AssessmentSection {
  key: AssessmentSectionKey;
  title: string;
  subtitle: string;
  emoji: string;
  category: ActivityCategory;
  questions: readonly AssessmentQuestion[];
}

export interface AssessmentChild {
  id: string;
  name: string;
}
