import type { ChildSummary } from '@/services/api/childrenLists';
import { formatAge } from '@/utils/age';

export interface ChildDetail {
  kind: 'age' | 'gender';
  label: string;
}

/** Age from the API's integer age. */
export function childAgeYears(child: ChildSummary): number | null {
  return child.age;
}

/** Display rows for the fields the API provides — nothing invented when a field is missing. */
export function childDetails(child: ChildSummary): ChildDetail[] {
  const details: ChildDetail[] = [];
  const age = childAgeYears(child);
  if (age !== null) details.push({ kind: 'age', label: `العمر: ${formatAge(age)}` });
  if (child.gender) details.push({ kind: 'gender', label: `الجنس: ${child.gender}` });
  return details;
}
