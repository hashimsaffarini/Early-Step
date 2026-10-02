import { CalendarDays, FileText, UserRound } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { ChildCard, type ChildCardDetail } from '@/components/shared/ChildCard';
import { Badge } from '@/components/ui/Badge';
import { getButtonClassName } from '@/components/ui/Button';
import { CHILD_GENDER_LABELS, CHILD_STATUS_DISPLAY } from '@/constants/childDisplay';
import { ageInYears, formatAge } from '@/utils/age';
import { formatDisplayDate } from '@/utils/dateFormat';

import type { RosterChild } from '../types';

import styles from './StaffChildCard.module.css';

export interface StaffChildCardProps {
  child: RosterChild;
  /** Role-scoped profile path. */
  profilePath: string;
  /** Extra action next to "عرض الملف" (e.g. the specialist's "تقرير جديد"). */
  extraAction?: ReactNode;
  /** Show the parent's name (admin / super admin views). */
  showParent?: boolean;
  today?: Date;
}

/**
 * Student card for staff dashboards (Replit teacher/specialist card): age and gender as
 * text (Replit's gender emoji was wrong), neutral journey status instead of a risk pill,
 * report count and latest report date.
 */
export function StaffChildCard({
  child,
  profilePath,
  extraAction,
  showParent = false,
  today,
}: StaffChildCardProps) {
  const status = CHILD_STATUS_DISPLAY[child.status];
  const details: ChildCardDetail[] = [
    {
      icon: CalendarDays,
      label: `العمر: ${formatAge(ageInYears(child.birthDate, today))} · ${CHILD_GENDER_LABELS[child.gender]}`,
    },
    {
      icon: FileText,
      label: child.lastReportDate
        ? `التقارير: ${child.reportCount} · آخر تقرير: ${formatDisplayDate(child.lastReportDate)}`
        : 'لا توجد تقارير بعد',
    },
  ];
  if (showParent) details.push({ icon: UserRound, label: `ولي الأمر: ${child.parentName}` });

  return (
    <ChildCard
      name={child.name}
      tone={status.avatarTone}
      status={
        <Badge tone={status.tone}>
          <status.icon aria-hidden="true" size={14} />
          {status.label}
        </Badge>
      }
      details={details}
      footer={
        <div className={styles.actions}>
          <Link
            to={profilePath}
            className={getButtonClassName({ variant: 'soft', fullWidth: true })}
            aria-label={`عرض ملف ${child.name}`}
          >
            عرض الملف
          </Link>
          {extraAction}
        </div>
      }
    />
  );
}
