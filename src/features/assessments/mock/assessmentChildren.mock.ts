/**
 * TEMPORARY UI MOCK DATA — children who can open the initial assessment (no backend yet).
 * Follows the shared roster in docs/MOCK_DATA.md. Delete when the API is integrated.
 */
import type { AssessmentChild } from '../types';

export const MOCK_ASSESSMENT_CHILDREN: readonly AssessmentChild[] = [
  { id: 'mock-child-1', name: 'يوسف' },
  { id: 'mock-child-2', name: 'نور' },
  { id: 'mock-child-3', name: 'ريم' },
  { id: 'mock-child-4', name: 'عمر' },
  { id: 'mock-child-5', name: 'سلمى' },
  { id: 'mock-child-6', name: 'آدم' },
  { id: 'mock-child-7', name: 'ليان' },
];

export function findAssessmentChild(childId: string | undefined): AssessmentChild | undefined {
  return MOCK_ASSESSMENT_CHILDREN.find((child) => child.id === childId);
}
