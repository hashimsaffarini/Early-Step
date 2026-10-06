import { ArrowLeft, Cake, Smile, Users } from 'lucide-react';
import { Link } from 'react-router';

import { ChildCard, type ChildCardDetail } from '@/components/shared/ChildCard';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { getButtonClassName } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/Feedback';
import { buildParentChildProfilePath, ROUTE_PATHS } from '@/constants/routes';
import { useChildPlanActivities } from '@/hooks/api/childResources';
import type { ChildSummary } from '@/services/api/childrenLists';
import { formatAge } from '@/utils/age';

import styles from './ChildrenPreviewSection.module.css';

const HEADING_ID = 'parent-children-title';

/** Plan progress from the child's plan activities (shown only when the plan has activities). */
function PlanProgress({ childId }: { childId: string }) {
  const { data } = useChildPlanActivities(childId);
  if (!data || data.length === 0) return null;
  const completed = data.filter((activity) => activity.isCompleted).length;
  return (
    <ProgressBar
      label="أنشطة الخطة المنجزة"
      value={completed}
      max={data.length}
      valueText={`${completed.toString()} من ${data.length.toString()} أنشطة`}
      showLabel
    />
  );
}

export interface ChildrenPreviewSectionProps {
  children: readonly ChildSummary[];
}

export function ChildrenPreviewSection({ children }: ChildrenPreviewSectionProps) {
  return (
    <section className={styles.section} aria-labelledby={HEADING_ID}>
      <SectionHeader
        id={HEADING_ID}
        title="أطفالي"
        icon={Users}
        action={
          <Link
            to={ROUTE_PATHS.parentChildren}
            className={getButtonClassName({ variant: 'ghost', size: 'sm' })}
          >
            عرض الكل
            <ArrowLeft aria-hidden="true" />
          </Link>
        }
      />
      <ul className={styles.grid}>
        {children.map((child) => {
          const details: ChildCardDetail[] = [];
          if (child.age !== null) {
            details.push({ icon: Cake, label: `العمر: ${formatAge(child.age)}` });
          }
          if (child.gender) details.push({ icon: Smile, label: `الجنس: ${child.gender}` });
          return (
            <li key={child.id}>
              <ChildCard
                name={child.fullName}
                details={details}
                footer={
                  <Link
                    to={buildParentChildProfilePath(child.id)}
                    className={getButtonClassName({ variant: 'soft', fullWidth: true })}
                    aria-label={`عرض ملف ${child.fullName}`}
                  >
                    عرض الملف
                  </Link>
                }
              >
                <PlanProgress childId={child.id} />
              </ChildCard>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
