import { Cake, CalendarDays, Smile, UserRound } from 'lucide-react';
import { Link } from 'react-router';

import { ChildCard, type ChildCardDetail } from '@/components/shared/ChildCard';
import { Badge } from '@/components/ui/Badge';
import { getButtonClassName } from '@/components/ui/Button';
import { CHILD_GENDER_LABELS, CHILD_STATUS_DISPLAY } from '@/constants/childDisplay';
import { useRoleArea } from '@/hooks/useRoleArea';
import { ageInYears, formatAge } from '@/utils/age';
import { formatDisplayDate } from '@/utils/dateFormat';

import type { ChildProfileLocationState } from '../pages/ChildProfilePage';
import type { ChildRecord } from '../types';

export interface ChildListCardProps {
  child: ChildRecord;
  /** Staff see the parent's name; the parent's own list omits it. */
  showParent?: boolean;
}

export function ChildListCard({ child, showParent = false }: ChildListCardProps) {
  const { paths } = useRoleArea();
  const status = CHILD_STATUS_DISPLAY[child.status];
  const details: ChildCardDetail[] = [
    { icon: Cake, label: `العمر: ${formatAge(ageInYears(child.birthDate))}` },
    { icon: CalendarDays, label: `تاريخ الميلاد: ${formatDisplayDate(child.birthDate)}` },
    { icon: Smile, label: `الجنس: ${CHILD_GENDER_LABELS[child.gender]}` },
  ];
  if (showParent && child.parentName) {
    details.push({ icon: UserRound, label: `ولي الأمر: ${child.parentName}` });
  }

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
        <Link
          to={paths.childProfile(child.id)}
          state={{ child } satisfies ChildProfileLocationState}
          className={getButtonClassName({ variant: 'soft', fullWidth: true })}
          aria-label={`عرض ملف ${child.name}`}
        >
          عرض الملف
        </Link>
      }
    />
  );
}
