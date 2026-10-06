import type { ChildSummary } from '@/services/api/childrenLists';
import { ageInYears, formatAge } from '@/utils/age';

export interface ChildDetail {
  kind: 'age' | 'gender';
  label: string;
}

/** Age from the API's integer age, or computed from a birth date if that is what is returned. */
export function childAgeYears(child: ChildSummary): number | null {
  if (child.age !== null) return child.age;
  return child.birthDate ? ageInYears(child.birthDate.slice(0, 10)) : null;
}

/** Display rows for the fields the API provides — nothing invented when a field is missing. */
export function childDetails(child: ChildSummary): ChildDetail[] {
  const details: ChildDetail[] = [];
  const age = childAgeYears(child);
  if (age !== null) details.push({ kind: 'age', label: `العمر: ${formatAge(age)}` });
  if (child.gender) details.push({ kind: 'gender', label: `الجنس: ${child.gender}` });
  return details;
}
