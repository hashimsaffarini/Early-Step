/**
 * TEMPORARY MOCK DATA — the shared children table behind every mock handler (Parent, Teacher,
 * Specialist, SuperAdmin, Admin user detail, training plans, reports…). Fictional records
 * (docs/MOCK_DATA.md). Handlers map these rows to each endpoint's response shape.
 * Mutable: Parent add/edit/delete and Admin/Specialist assignments change it; reset per test.
 */
import { registerMockTable } from '../db';

export interface MockChildRow {
  id: string;
  fullName: string;
  /** The API stores an integer age (Swagger `Age:int32`), not a birth date. */
  age: number;
  gender: 'ولد' | 'بنت';
  parentId: string;
  parentName: string;
  specialistId: string | null;
  specialistName: string | null;
  teacherId: string | null;
  teacherName: string | null;
}

const INITIAL: readonly MockChildRow[] = [
  {
    id: 'c0000000-0000-4000-8000-000000000001',
    fullName: 'يوسف',
    age: 7,
    gender: 'ولد',
    parentId: 'u-parent',
    parentName: 'محمد أحمد',
    specialistId: 'u-specialist',
    specialistName: 'أ. ليلى حسن',
    teacherId: 'u-teacher',
    teacherName: 'أ. سارة خالد',
  },
  {
    id: 'c0000000-0000-4000-8000-000000000002',
    fullName: 'نور',
    age: 5,
    gender: 'بنت',
    parentId: 'u-parent',
    parentName: 'محمد أحمد',
    specialistId: 'u-specialist',
    specialistName: 'أ. ليلى حسن',
    teacherId: 'u-teacher',
    teacherName: 'أ. سارة خالد',
  },
  {
    id: 'c0000000-0000-4000-8000-000000000003',
    fullName: 'ريم',
    age: 4,
    gender: 'بنت',
    parentId: 'u-parent',
    parentName: 'محمد أحمد',
    specialistId: null,
    specialistName: null,
    teacherId: null,
    teacherName: null,
  },
  {
    id: 'c0000000-0000-4000-8000-000000000005',
    fullName: 'سلمى',
    age: 7,
    gender: 'بنت',
    parentId: 'u-parent-2',
    parentName: 'خالد يوسف',
    specialistId: 'u-specialist',
    specialistName: 'أ. ليلى حسن',
    teacherId: 'u-teacher',
    teacherName: 'أ. سارة خالد',
  },
];

export const mockChildren: MockChildRow[] = [];

registerMockTable(() => {
  mockChildren.splice(0, mockChildren.length, ...INITIAL.map((row) => ({ ...row })));
});

export function findMockChild(id: string): MockChildRow | undefined {
  return mockChildren.find((child) => child.id === id);
}
