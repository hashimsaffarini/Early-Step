import { BriefcaseMedical, GraduationCap, UserRound, Users } from 'lucide-react';

import { ChildCard, type ChildCardDetail } from '@/components/shared/ChildCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { CHILD_STATUS_DISPLAY } from '@/constants/childDisplay';
import type { RosterChild } from '@/features/dashboards/types';

import styles from './superAdmin.module.css';

const NOT_ASSIGNED = 'لم يُعيَّن بعد';

export interface ChildrenTabProps {
  roster: readonly RosterChild[];
}

/** All registered children with their parent, specialist and teacher (neutral status). */
export function ChildrenTab({ roster }: ChildrenTabProps) {
  if (roster.length === 0) {
    return <EmptyState icon={<Users />} title="لا يوجد أطفال مسجّلون" />;
  }
  return (
    <ul className={styles.cards} aria-label="الأطفال المسجّلون في النظام">
      {roster.map((child) => {
        const status = CHILD_STATUS_DISPLAY[child.status];
        const details: ChildCardDetail[] = [
          { icon: UserRound, label: `ولي الأمر: ${child.parentName}` },
          { icon: BriefcaseMedical, label: `الأخصائي: ${child.specialistName ?? NOT_ASSIGNED}` },
          { icon: GraduationCap, label: `المعلم: ${child.teacherName ?? NOT_ASSIGNED}` },
        ];
        return (
          <li key={child.id}>
            <ChildCard
              name={child.name}
              tone={status.avatarTone}
              headingLevel={2}
              status={
                <Badge tone={status.tone}>
                  <status.icon aria-hidden="true" size={14} />
                  {status.label}
                </Badge>
              }
              details={details}
            />
          </li>
        );
      })}
    </ul>
  );
}
