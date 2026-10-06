import { BookOpen, Cake, NotebookPen, Pencil, Smile, Trash2 } from 'lucide-react';
import { Link } from 'react-router';

import { Avatar } from '@/components/ui/Avatar';
import { Button, getButtonClassName } from '@/components/ui/Button';
import type { AreaRole } from '@/constants/routes';
import { useRoleArea } from '@/hooks/useRoleArea';
import type { ChildSummary } from '@/services/api/childrenLists';
import { formatAge } from '@/utils/age';

import { childAgeYears } from '../childDisplay';

import styles from './ChildProfileHeader.module.css';
import { StartAssessmentLink } from './StartAssessmentLink';

export interface ChildProfileHeaderProps {
  child: ChildSummary;
  role: AreaRole;
  /** Parent only. */
  onEdit?: (() => void) | undefined;
  /** Parent only. */
  onDelete?: (() => void) | undefined;
}

const PLANS_LABEL: Record<AreaRole, string> = {
  Parent: 'الخطة التدريبية',
  Teacher: 'الخطة التدريبية',
  Specialist: 'إدارة الخطة التدريبية',
  Admin: 'الخطة التدريبية',
};

/** Replit profile header: gradient card, large avatar, name, info pills (API fields), actions. */
export function ChildProfileHeader({ child, role, onEdit, onDelete }: ChildProfileHeaderProps) {
  const { paths } = useRoleArea();
  const age = childAgeYears(child);

  return (
    <header className={styles.header}>
      <Avatar name={child.fullName} size="xl" shape="circle" className={styles.avatar} />
      <div className={styles.body}>
        <h1 className={styles.title}>{child.fullName}</h1>
        <ul className={styles.pills} aria-label="بيانات الطفل">
          {age !== null ? (
            <li className={styles.pill}>
              <Cake aria-hidden="true" />
              العمر: {formatAge(age)}
            </li>
          ) : null}
          {child.gender ? (
            <li className={styles.pill}>
              <Smile aria-hidden="true" />
              {child.gender}
            </li>
          ) : null}
        </ul>
        <div className={styles.actions}>
          {role === 'Parent' ? (
            <StartAssessmentLink childId={child.id} childName={child.fullName} variant="outline" />
          ) : null}
          <Link
            to={paths.childPlans(child.id)}
            className={getButtonClassName({ variant: 'outline' })}
          >
            <BookOpen aria-hidden="true" />
            {PLANS_LABEL[role]}
          </Link>
          {role === 'Teacher' ? (
            <Link
              to={paths.childNotes(child.id)}
              className={getButtonClassName({ variant: 'outline' })}
            >
              <NotebookPen aria-hidden="true" />
              ملاحظات المعلم
            </Link>
          ) : null}
          {onEdit ? (
            <Button variant="outline" iconStart={<Pencil aria-hidden="true" />} onClick={onEdit}>
              تعديل البيانات
            </Button>
          ) : null}
          {onDelete ? (
            <Button variant="outline" iconStart={<Trash2 aria-hidden="true" />} onClick={onDelete}>
              حذف الملف
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
