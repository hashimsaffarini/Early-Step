/**
 * TEMPORARY UI MOCK DATA for the staff dashboards and the super admin panel (no backend yet).
 * Follows the shared roster in docs/MOCK_DATA.md. Delete when the dashboards use the API.
 * Neutral, illustrative content only — no diagnoses, risk levels, percentages or success claims.
 */
import type { RosterChild, RosterReport, RosterUser } from '../types';

const TEACHER = 'أ. سارة خالد';
const SPECIALIST = 'أ. ليلى حسن';
const MAIN_PARENT = 'محمد أحمد';

export const MOCK_ROSTER_CHILDREN: readonly RosterChild[] = [
  {
    id: 'mock-child-1',
    name: 'يوسف',
    gender: 'boy',
    birthDate: '2019-03-12',
    status: 'training-plan-active',
    parentName: MAIN_PARENT,
    teacherName: TEACHER,
    specialistName: SPECIALIST,
    reportCount: 2,
    lastReportDate: '2026-09-22',
  },
  {
    id: 'mock-child-2',
    name: 'نور',
    gender: 'girl',
    birthDate: '2021-07-02',
    status: 'assessment-completed',
    parentName: MAIN_PARENT,
    teacherName: TEACHER,
    specialistName: SPECIALIST,
    reportCount: 1,
    lastReportDate: '2026-09-20',
  },
  {
    id: 'mock-child-3',
    name: 'ريم',
    gender: 'girl',
    birthDate: '2022-01-20',
    status: 'assessment-pending',
    parentName: MAIN_PARENT,
    specialistName: SPECIALIST,
    reportCount: 0,
  },
  {
    id: 'mock-child-4',
    name: 'عمر',
    gender: 'boy',
    birthDate: '2018-11-05',
    status: 'assessment-completed',
    parentName: MAIN_PARENT,
    reportCount: 0,
  },
  {
    id: 'mock-child-5',
    name: 'سلمى',
    gender: 'girl',
    birthDate: '2019-09-14',
    status: 'training-plan-active',
    parentName: 'خالد يوسف',
    teacherName: TEACHER,
    specialistName: SPECIALIST,
    reportCount: 1,
    lastReportDate: '2026-09-24',
  },
  {
    id: 'mock-child-6',
    name: 'آدم',
    gender: 'boy',
    birthDate: '2020-04-03',
    status: 'assessment-completed',
    parentName: 'علي حسن',
    teacherName: TEACHER,
    specialistName: SPECIALIST,
    reportCount: 1,
    lastReportDate: '2026-09-15',
  },
  {
    id: 'mock-child-7',
    name: 'ليان',
    gender: 'girl',
    birthDate: '2018-06-21',
    status: 'training-plan-active',
    parentName: 'سامي محمود',
    specialistName: SPECIALIST,
    reportCount: 1,
    lastReportDate: '2026-09-08',
  },
];

/** Children assigned to the mock teacher / specialist (docs/MOCK_DATA.md). */
export const TEACHER_CHILD_IDS: readonly string[] = [
  'mock-child-1',
  'mock-child-2',
  'mock-child-5',
  'mock-child-6',
];
export const SPECIALIST_CHILD_IDS: readonly string[] = [
  'mock-child-1',
  'mock-child-2',
  'mock-child-3',
  'mock-child-5',
  'mock-child-6',
  'mock-child-7',
];

export function pickChildren(ids: readonly string[]): RosterChild[] {
  return MOCK_ROSTER_CHILDREN.filter((child) => ids.includes(child.id));
}

export const MOCK_ROSTER_REPORTS: readonly RosterReport[] = [
  {
    id: 'report-4',
    childId: 'mock-child-5',
    childName: 'سلمى',
    title: 'تقرير متابعة',
    date: '2026-09-24',
    authorName: SPECIALIST,
  },
  {
    id: 'report-1',
    childId: 'mock-child-1',
    childName: 'يوسف',
    title: 'تقرير متابعة',
    date: '2026-09-22',
    authorName: SPECIALIST,
  },
  {
    id: 'report-3',
    childId: 'mock-child-2',
    childName: 'نور',
    title: 'تقرير التقييم المبدئي',
    date: '2026-09-20',
    authorName: SPECIALIST,
  },
  {
    id: 'report-5',
    childId: 'mock-child-6',
    childName: 'آدم',
    title: 'تقرير التقييم المبدئي',
    date: '2026-09-15',
    authorName: SPECIALIST,
  },
  {
    id: 'report-2',
    childId: 'mock-child-1',
    childName: 'يوسف',
    title: 'تقرير التقييم المبدئي',
    date: '2026-09-12',
    authorName: SPECIALIST,
  },
  {
    id: 'report-6',
    childId: 'mock-child-7',
    childName: 'ليان',
    title: 'تقرير متابعة',
    date: '2026-09-08',
    authorName: SPECIALIST,
  },
];

/** Placeholder accounts. Addresses use the reserved `.test` domain — never real emails. */
export const MOCK_ROSTER_USERS: readonly RosterUser[] = [
  { id: 'user-1', name: 'عبدالله منصور', email: 'superadmin@example.test', role: 'SuperAdmin' },
  { id: 'user-2', name: 'خالد سعيد', email: 'admin1@example.test', role: 'Admin' },
  { id: 'user-3', name: 'أ. ليلى حسن', email: 'specialist1@example.test', role: 'Specialist' },
  { id: 'user-4', name: 'د. أحمد فؤاد', email: 'specialist2@example.test', role: 'Specialist' },
  { id: 'user-5', name: 'أ. سارة خالد', email: 'teacher1@example.test', role: 'Teacher' },
  { id: 'user-6', name: 'أ. مريم علي', email: 'teacher2@example.test', role: 'Teacher' },
  { id: 'user-7', name: 'محمد أحمد', email: 'parent1@example.test', role: 'Parent' },
  { id: 'user-8', name: 'خالد يوسف', email: 'parent2@example.test', role: 'Parent' },
  { id: 'user-9', name: 'علي حسن', email: 'parent3@example.test', role: 'Parent' },
  { id: 'user-10', name: 'سامي محمود', email: 'parent4@example.test', role: 'Parent' },
];
