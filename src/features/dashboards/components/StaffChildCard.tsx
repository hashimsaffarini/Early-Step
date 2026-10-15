import { CalendarDays, UserRound } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { ChildCard, type ChildCardDetail } from '@/components/shared/ChildCard';
import { getButtonClassName } from '@/components/ui/Button';
import type { ChildSummary } from '@/services/api/childrenLists';
import { formatAge } from '@/utils/age';

import styles from './StaffChildCard.module.css';

export interface StaffChildCardProps {
  child: ChildSummary;
  /** Role-scoped profile path. */
  profilePath: string;
  /** Extra action next to "عرض الملف" (e.g. the specialist's "تقرير جديد"). */
  extraAction?: ReactNode;
}

/** Age in years from the API's integer age. */
function ageText(child: ChildSummary): string | null {
  return child.age === null ? null : formatAge(child.age);
}

/**
 * Child card for staff dashboards. Shows only what the API returns (age, gender, parent).
 * No journey status or report counts: the children endpoints do not provide them.
 */
export function StaffChildCard({ child, profilePath, extraAction }: StaffChildCardProps) {
  const details: ChildCardDetail[] = [];
  const age = ageText(child);
  const parts = [age ? `العمر: ${age}` : null, child.gender].filter(Boolean);
  if (parts.length > 0) details.push({ icon: CalendarDays, label: parts.join(' · ') });
  if (child.parentName) details.push({ icon: UserRound, label: `ولي الأمر: ${child.parentName}` });

  return (
    <ChildCard
      name={child.fullName}
      details={details}
      footer={
        <div className={styles.actions}>
          <Link
            to={profilePath}
            className={getButtonClassName({ variant: 'soft', fullWidth: true })}
            aria-label={`عرض ملف ${child.fullName}`}
          >
            عرض الملف
          </Link>
          {extraAction}
        </div>
      }
    />
  );
}
