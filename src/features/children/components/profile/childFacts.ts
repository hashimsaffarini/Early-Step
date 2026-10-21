import { BriefcaseMedical, Cake, GraduationCap, Smile, UserRound } from 'lucide-react';

import type { ChildHeroFact } from '@/components/shared/ChildDashboard';
import type { ChildSummary } from '@/services/api/childrenLists';
import { formatAge } from '@/utils/age';

import { childAgeYears } from '../childDisplay';

export interface ChildFactOptions {
  /** The parent sees their own name nowhere: only staff pages show it. */
  withParent?: boolean;
  /** A teacher name from a richer source (the specialist plan), when the list has none. */
  teacherName?: string | null;
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
  if (child.specialistName) {
    facts.push({ icon: BriefcaseMedical, label: `الأخصائي: ${child.specialistName}` });
  }
  const teacher = child.teacherName ?? options.teacherName ?? null;
  if (teacher) facts.push({ icon: GraduationCap, label: `المعلم: ${teacher}` });
  return facts;
}
