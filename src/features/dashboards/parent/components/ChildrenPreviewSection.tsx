import {
  CalendarDays,
  CircleCheck,
  ClipboardList,
  Hourglass,
  Target,
  Users,
  type LucideIcon,
} from 'lucide-react';

import { ChildCard, type ChildCardTone } from '@/components/shared/ChildCard';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/Feedback';

import { formatAge } from '../format';
import type { ChildJourneyStatus, ParentChildSummary } from '../types';

import { ComingSoonButton } from './ComingSoonButton';
import styles from './ChildrenPreviewSection.module.css';

const HEADING_ID = 'parent-children-title';

const STATUS_DISPLAY: Record<
  ChildJourneyStatus,
  { label: string; tone: BadgeTone; icon: LucideIcon; cardTone: ChildCardTone }
> = {
  'training-plan-active': {
    label: 'لديه خطة تدريبية',
    tone: 'primary',
    icon: Target,
    cardTone: 'primary',
  },
  'assessment-completed': {
    label: 'التقييم المبدئي مكتمل',
    tone: 'success',
    icon: CircleCheck,
    cardTone: 'violet',
  },
  'assessment-pending': {
    label: 'بانتظار بدء التقييم',
    tone: 'warning',
    icon: Hourglass,
    cardTone: 'warning',
  },
};

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
        action={<ComingSoonButton variant="ghost">عرض الكل</ComingSoonButton>}
      />
      <ul className={styles.grid}>
        {children.map((child) => {
          const status = STATUS_DISPLAY[child.status];
          return (
            <li key={child.id}>
              <ChildCard
                name={child.name}
                tone={status.cardTone}
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
                  <ComingSoonButton fullWidth size="md">
                    عرض الملف
                  </ComingSoonButton>
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
