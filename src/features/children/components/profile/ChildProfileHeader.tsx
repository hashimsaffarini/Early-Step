import { Cake, CalendarDays, ClipboardCheck, Smile } from 'lucide-react';

import { ComingSoonButton } from '@/components/shared/ComingSoonButton';
import { Avatar } from '@/components/ui/Avatar';
import { CHILD_GENDER_LABELS, CHILD_STATUS_DISPLAY } from '@/constants/childDisplay';
import { ageInYears, formatAge } from '@/utils/age';
import { cx } from '@/utils/classNames';
import { formatDisplayDate } from '@/utils/dateFormat';

import type { ChildProfileDetails, ParentChild } from '@/features/children/types';

import styles from './ChildProfileHeader.module.css';

export interface ChildProfileHeaderProps {
  child: ParentChild;
  details: ChildProfileDetails;
}

/** Replit profile header: gradient card, large avatar, name, info pills, actions. */
export function ChildProfileHeader({ child, details }: ChildProfileHeaderProps) {
  const status = CHILD_STATUS_DISPLAY[child.status];
  const hasPendingAssessment = details.assessments.some(
    (assessment) => assessment.state === 'not-started',
  );

  return (
    <header className={styles.header}>
      <Avatar name={child.name} size="xl" shape="circle" className={styles.avatar} />
      <div className={styles.body}>
        <h1 className={styles.title}>{child.name}</h1>
        <ul className={styles.pills} aria-label="بيانات الطفل">
          <li className={cx(styles.pill, styles.status)}>
            <status.icon aria-hidden="true" />
            {status.label}
          </li>
          <li className={styles.pill}>
            <Cake aria-hidden="true" />
            العمر: {formatAge(ageInYears(child.birthDate))}
          </li>
          <li className={styles.pill}>
            <CalendarDays aria-hidden="true" />
            تاريخ الميلاد: {formatDisplayDate(child.birthDate)}
          </li>
          <li className={styles.pill}>
            <Smile aria-hidden="true" />
            {CHILD_GENDER_LABELS[child.gender]}
          </li>
        </ul>
        <div className={styles.actions}>
          {hasPendingAssessment ? (
            <ComingSoonButton variant="outline" iconStart={<ClipboardCheck aria-hidden="true" />}>
              بدء التقييم
            </ComingSoonButton>
          ) : null}
          <ComingSoonButton variant="outline">تعديل البيانات</ComingSoonButton>
        </div>
      </div>
    </header>
  );
}
