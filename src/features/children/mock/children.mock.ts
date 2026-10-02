/**
 * TEMPORARY UI MOCK DATA for the children screens of every role (no backend yet).
 * Follows the shared roster in docs/MOCK_DATA.md. Delete when the children screens are
 * connected to the API. Illustrative only — no diagnoses, risk scores or real children.
 */
import type { AreaRole } from '@/constants/routes';

import type { ChildRecord } from '../types';

const PARENT_NAME = 'محمد أحمد';

export const MOCK_CHILDREN: readonly ChildRecord[] = [
  {
    id: 'mock-child-1',
    name: 'يوسف',
    birthDate: '2019-03-12',
    gender: 'boy',
    status: 'training-plan-active',
    parentName: PARENT_NAME,
  },
  {
    id: 'mock-child-2',
    name: 'نور',
    birthDate: '2021-07-02',
    gender: 'girl',
    status: 'assessment-completed',
    parentName: PARENT_NAME,
  },
  {
    id: 'mock-child-3',
    name: 'ريم',
    birthDate: '2022-01-20',
    gender: 'girl',
    status: 'assessment-pending',
    parentName: PARENT_NAME,
  },
  {
    id: 'mock-child-4',
    name: 'عمر',
    birthDate: '2018-11-05',
    gender: 'boy',
    status: 'assessment-completed',
    parentName: PARENT_NAME,
  },
  {
    id: 'mock-child-5',
    name: 'سلمى',
    birthDate: '2019-09-14',
    gender: 'girl',
    status: 'training-plan-active',
    parentName: 'خالد يوسف',
  },
  {
    id: 'mock-child-6',
    name: 'آدم',
    birthDate: '2020-04-03',
    gender: 'boy',
    status: 'assessment-completed',
    parentName: 'علي حسن',
  },
  {
    id: 'mock-child-7',
    name: 'ليان',
    birthDate: '2018-06-21',
    gender: 'girl',
    status: 'training-plan-active',
    parentName: 'سامي محمود',
  },
];

/** Which mock children each role's account can see (docs/MOCK_DATA.md). */
const VISIBLE_CHILD_IDS: Record<AreaRole, readonly string[]> = {
  Parent: ['mock-child-1', 'mock-child-2', 'mock-child-3', 'mock-child-4'],
  Teacher: ['mock-child-1', 'mock-child-2', 'mock-child-5', 'mock-child-6'],
  Specialist: [
    'mock-child-1',
    'mock-child-2',
    'mock-child-3',
    'mock-child-5',
    'mock-child-6',
    'mock-child-7',
  ],
  Admin: MOCK_CHILDREN.map((child) => child.id),
};

export function getMockChildrenForRole(role: AreaRole): readonly ChildRecord[] {
  const visible = VISIBLE_CHILD_IDS[role];
  return MOCK_CHILDREN.filter((child) => visible.includes(child.id));
}
