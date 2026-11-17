import { BriefcaseMedical, Cake, GraduationCap, Smile, UserRound } from 'lucide-react';

import type { ChildHeroFact } from '@/components/shared/ChildDashboard';
import type { ChildSummary } from '@/services/api/childrenLists';
import { formatAge } from '@/utils/age';

import { childAgeYears } from '../childDisplay';

export interface ChildFactOptions {
  /** The parent sees their own name nowhere: only staff pages show it. */
  withParent?: boolean;
  /**
   * Names from another real source when the list has none (client revision 2026-11: every child
   * file names its specialist and teacher): the specialist plan, the child's report, or the
   * signed-in staff member's own name on their own child page.
   */
  teacherName?: string | null;
  specialistName?: string | null;
}

/** The child's real facts for the dashboard header — a field the server did not send is left out. */
export function childFacts(child: ChildSummary, options: ChildFactOptions = {}): ChildHeroFact[] {
  const facts: ChildHeroFact[] = [];
  const age = childAgeYears(child);
  if (age !== null) facts.push({ icon: Cake, label: `العمر: ${formatAge(age)}` });
  if (child.gender) facts.push({ icon: Smile, label: `الجنس: ${child.gender}` });
  if (options.withParent && child.parentName) {
    facts.push({ icon: UserRound, label: `ولي الأمر: ${child.parentName}` });
  }
  const specialist = child.specialistName ?? options.specialistName ?? null;
  if (specialist) facts.push({ icon: BriefcaseMedical, label: `الأخصائي: ${specialist}` });
  const teacher = child.teacherName ?? options.teacherName ?? null;
  if (teacher) facts.push({ icon: GraduationCap, label: `المعلم: ${teacher}` });
  return facts;
}
