import { BookOpen, Cake, CalendarDays, Smile } from 'lucide-react';
import { Link } from 'react-router';

import { ComingSoonButton } from '@/components/shared/ComingSoonButton';
import { Avatar } from '@/components/ui/Avatar';
import { getButtonClassName } from '@/components/ui/Button';
import { CHILD_GENDER_LABELS, CHILD_STATUS_DISPLAY } from '@/constants/childDisplay';
import { useRoleArea } from '@/hooks/useRoleArea';
import { ageInYears, formatAge } from '@/utils/age';
import { cx } from '@/utils/classNames';
import { formatDisplayDate } from '@/utils/dateFormat';

import type { ChildProfileDetails, ChildRecord } from '@/features/children/types';

import styles from './ChildProfileHeader.module.css';
import { StartAssessmentLink } from './StartAssessmentLink';

export interface ChildProfileHeaderProps {
  child: ChildRecord;
  details: ChildProfileDetails;
}

/** Replit profile header: gradient card, large avatar, name, info pills, actions. */
export function ChildProfileHeader({ child, details }: ChildProfileHeaderProps) {
  const { paths } = useRoleArea();
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
            <StartAssessmentLink childId={child.id} childName={child.name} variant="outline" />
          ) : null}
          <Link
            to={paths.childPlans(child.id)}
            className={getButtonClassName({ variant: 'outline' })}
          >
            <BookOpen aria-hidden="true" />
            الخطط التعليمية
          </Link>
          <ComingSoonButton variant="outline">تعديل البيانات</ComingSoonButton>
        </div>
      </div>
    </header>
  );
}
