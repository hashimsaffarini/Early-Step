import {
  Activity,
  BarChart3,
  BriefcaseMedical,
  FileText,
  FolderTree,
  GraduationCap,
  NotebookPen,
  Target,
  UserRound,
  Users,
  type LucideIcon,
} from 'lucide-react';

import type { StatCardTone } from '@/components/shared/StatCard';

import type { DashboardStat } from '../types';

interface StatDisplay {
  label: string;
  icon: LucideIcon;
  tone: StatCardTone;
}

/**
 * Known dashboard fields → display. VERIFIED LIVE (2026-10-06):
 * - Admin: `إجمالي المستخدمين`, `إجمالي التقارير`, `إجمالي الانشطة`, `إجمالي الفئات`, `عدد الأطفال`
 * - Specialist: `عددالأطفال الكلي`, `عددالتقارير` (sic, no space)
 * - SuperAdmin: `totalUsers`, `totalReports`, `totalActivities` (+ `usersByRole[]`, read separately)
 * Teacher: not verified (no teacher demo account). Other English keys stay as a fallback.
 */
const KNOWN_STATS: Readonly<Record<string, StatDisplay>> = {
  'إجمالي المستخدمين': { label: 'إجمالي المستخدمين', icon: UserRound, tone: 'primary' },
  'عدد الأطفال': { label: 'عدد الأطفال', icon: Users, tone: 'success' },
  'إجمالي التقارير': { label: 'إجمالي التقارير', icon: FileText, tone: 'violet' },
  'إجمالي الانشطة': { label: 'إجمالي الأنشطة', icon: Activity, tone: 'warning' },
  'إجمالي الفئات': { label: 'إجمالي الفئات', icon: FolderTree, tone: 'primary' },
  'عددالأطفال الكلي': { label: 'الأطفال المتابَعون', icon: Users, tone: 'success' },
  عددالتقارير: { label: 'التقارير', icon: FileText, tone: 'violet' },
  totalUsers: { label: 'إجمالي المستخدمين', icon: UserRound, tone: 'primary' },
  totalParents: { label: 'أولياء الأمور', icon: UserRound, tone: 'success' },
  totalTeachers: { label: 'المعلمون', icon: GraduationCap, tone: 'violet' },
  totalSpecialists: { label: 'الأخصائيون', icon: BriefcaseMedical, tone: 'warning' },
  totalChildren: { label: 'عدد الأطفال', icon: Users, tone: 'success' },
  childrenCount: { label: 'عدد الأطفال', icon: Users, tone: 'success' },
  assignedChildren: { label: 'الأطفال المُسنَدون', icon: Users, tone: 'success' },
  totalReports: { label: 'التقارير', icon: FileText, tone: 'violet' },
  reportsCount: { label: 'التقارير', icon: FileText, tone: 'violet' },
  totalActivities: { label: 'الأنشطة', icon: Activity, tone: 'warning' },
  totalNotes: { label: 'الملاحظات', icon: NotebookPen, tone: 'primary' },
  activeTrainingPlans: { label: 'خطط تدريبية نشطة', icon: Target, tone: 'violet' },
};

const FALLBACK_TONES: readonly StatCardTone[] = ['primary', 'success', 'violet', 'warning'];

/**
 * Turns a dashboard response into stat cards — **only numeric fields the server sent**.
 * Known keys get Arabic labels and icons; any other numeric field is shown with the server's own
 * key as its label (never renamed or guessed). Non-numeric/nested fields are ignored.
 */
export function toDashboardStats(data: unknown): DashboardStat[] {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) return [];
  const stats: DashboardStat[] = [];
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (typeof value !== 'number' || !Number.isFinite(value)) continue;
    const known = KNOWN_STATS[key];
    stats.push({
      key,
      label: known?.label ?? key,
      value,
      icon: known?.icon ?? BarChart3,
      tone: known?.tone ?? FALLBACK_TONES[stats.length % FALLBACK_TONES.length] ?? 'primary',
    });
  }
  return stats;
}
