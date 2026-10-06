import { CalendarDays, UserRound } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { ChildCard, type ChildCardDetail } from '@/components/shared/ChildCard';
import { getButtonClassName } from '@/components/ui/Button';
import type { ChildSummary } from '@/services/api/childrenLists';
import { ageInYears, formatAge } from '@/utils/age';

import styles from './StaffChildCard.module.css';

export interface StaffChildCardProps {
  child: ChildSummary;
  /** Role-scoped profile path. */
  profilePath: string;
  /** Extra action next to "عرض الملف" (e.g. the specialist's "تقرير جديد"). */
  extraAction?: ReactNode;
  today?: Date;
}

/** Age in years: the API's integer age, or computed from a birth date when that is all we have. */
function ageText(child: ChildSummary, today: Date | undefined): string | null {
  if (child.age !== null) return formatAge(child.age);
  if (child.birthDate) return formatAge(ageInYears(child.birthDate.slice(0, 10), today));
  return null;
}

/**
 * Child card for staff dashboards. Shows only what the API returns (age, gender, parent).
 * No journey status or report counts: the children endpoints do not provide them.
 */
export function StaffChildCard({ child, profilePath, extraAction, today }: StaffChildCardProps) {
  const details: ChildCardDetail[] = [];
  const age = ageText(child, today);
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
