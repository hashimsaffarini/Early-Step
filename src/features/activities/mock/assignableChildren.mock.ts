/**
 * TEMPORARY UI MOCK DATA — children an activity can be assigned to, per role area
 * (shared roster in docs/MOCK_DATA.md). Delete when the assign flow uses the API.
 */
import type { AreaRole } from '@/constants/routes';

export interface AssignableChild {
  id: string;
  name: string;
  parentName: string;
}

const ROSTER: readonly AssignableChild[] = [
  { id: 'mock-child-1', name: 'يوسف', parentName: 'محمد أحمد' },
  { id: 'mock-child-2', name: 'نور', parentName: 'محمد أحمد' },
  { id: 'mock-child-3', name: 'ريم', parentName: 'محمد أحمد' },
  { id: 'mock-child-4', name: 'عمر', parentName: 'محمد أحمد' },
  { id: 'mock-child-5', name: 'سلمى', parentName: 'خالد يوسف' },
  { id: 'mock-child-6', name: 'آدم', parentName: 'علي حسن' },
  { id: 'mock-child-7', name: 'ليان', parentName: 'سامي محمود' },
];

const VISIBLE_IDS: Record<AreaRole, readonly string[]> = {
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
  Admin: ROSTER.map((child) => child.id),
};

export function getAssignableChildren(role: AreaRole): readonly AssignableChild[] {
  return ROSTER.filter((child) => VISIBLE_IDS[role].includes(child.id));
}
