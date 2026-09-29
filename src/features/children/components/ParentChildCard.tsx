import { Cake, CalendarDays, Smile } from 'lucide-react';
import { Link } from 'react-router';

import { ChildCard } from '@/components/shared/ChildCard';
import { Badge } from '@/components/ui/Badge';
import { getButtonClassName } from '@/components/ui/Button';
import { CHILD_GENDER_LABELS, CHILD_STATUS_DISPLAY } from '@/constants/childDisplay';
import { buildParentChildProfilePath } from '@/constants/routes';
import { ageInYears, formatAge } from '@/utils/age';
import { formatDisplayDate } from '@/utils/dateFormat';

import type { ChildProfileLocationState } from '../pages/ChildProfilePage';
import type { ParentChild } from '../types';

export interface ParentChildCardProps {
  child: ParentChild;
}

export function ParentChildCard({ child }: ParentChildCardProps) {
  const status = CHILD_STATUS_DISPLAY[child.status];

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
      details={[
        { icon: Cake, label: `العمر: ${formatAge(ageInYears(child.birthDate))}` },
        { icon: CalendarDays, label: `تاريخ الميلاد: ${formatDisplayDate(child.birthDate)}` },
        { icon: Smile, label: `الجنس: ${CHILD_GENDER_LABELS[child.gender]}` },
      ]}
      footer={
        <Link
          to={buildParentChildProfilePath(child.id)}
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
