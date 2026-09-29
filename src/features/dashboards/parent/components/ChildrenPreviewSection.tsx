import { ArrowLeft, CalendarDays, ClipboardList, Users } from 'lucide-react';
import { Link } from 'react-router';

import { ChildCard } from '@/components/shared/ChildCard';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Badge } from '@/components/ui/Badge';
import { getButtonClassName } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/Feedback';
import { CHILD_STATUS_DISPLAY } from '@/constants/childDisplay';
import { buildParentChildProfilePath, ROUTE_PATHS } from '@/constants/routes';
import { formatAge } from '@/utils/age';

import type { ParentChildSummary } from '../types';

import styles from './ChildrenPreviewSection.module.css';

const HEADING_ID = 'parent-children-title';

export interface ChildrenPreviewSectionProps {
  children: readonly ParentChildSummary[];
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
          const status = CHILD_STATUS_DISPLAY[child.status];
          return (
            <li key={child.id}>
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
                  { icon: CalendarDays, label: `العمر: ${formatAge(child.ageYears)}` },
                  { icon: ClipboardList, label: child.latestAssessmentLabel },
                ]}
                footer={
                  <Link
                    to={buildParentChildProfilePath(child.id)}
                    className={getButtonClassName({ variant: 'soft', fullWidth: true })}
                    aria-label={`عرض ملف ${child.name}`}
                  >
                    عرض الملف
                  </Link>
                }
              >
                {child.planProgress ? (
                  <ProgressBar
                    label="أنشطة الخطة المنجزة"
                    value={child.planProgress.completed}
                    max={child.planProgress.total}
                    valueText={`${child.planProgress.completed} من ${child.planProgress.total} أنشطة`}
                    showLabel
                  />
                ) : null}
              </ChildCard>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
