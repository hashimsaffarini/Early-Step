/**
 * TEMPORARY UI MOCK DATA for the parent's children list (no backend yet).
 * Delete when the children screen is connected to the API. Illustrative only —
 * no diagnoses, risk scores or real children.
 */
import type { ParentChild } from '../types';

export const MOCK_PARENT_CHILDREN_LIST: readonly ParentChild[] = [
  {
    id: 'mock-child-1',
    name: 'يوسف',
    birthDate: '2019-03-12',
    gender: 'boy',
    status: 'training-plan-active',
  },
  {
    id: 'mock-child-2',
    name: 'نور',
    birthDate: '2021-07-02',
    gender: 'girl',
    status: 'assessment-completed',
  },
  {
    id: 'mock-child-3',
    name: 'ريم',
    birthDate: '2022-01-20',
    gender: 'girl',
    status: 'assessment-pending',
  },
  {
    id: 'mock-child-4',
    name: 'عمر',
    birthDate: '2018-11-05',
    gender: 'boy',
    status: 'assessment-completed',
  },
];
