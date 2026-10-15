import { ClipboardCheck } from 'lucide-react';

import { EmptyState } from '@/components/shared/EmptyState';
import { Card } from '@/components/ui/Card';
import { useAssessmentResult } from '@/hooks/api/childResources';

import { AssessmentResultView } from './AssessmentResultView';
import styles from './profile.module.css';
import { StartAssessmentLink } from './StartAssessmentLink';
import { QueryStatus } from './TabStatus';

export interface AssessmentsTabProps {
  childId: string;
  childName: string;
  canStart: boolean;
  /** The result endpoint is for the assigned Specialist and Admin only. */
  canReadResult: boolean;
}

/**
 * Staff: the child's initial-assessment result (`GET initial-assessment/{childId}/result`).
 * Parent: only the way to start it — the saved result is for staff (product decision 2026-10-14).
 */
export function AssessmentsTab({
  childId,
  childName,
  canStart,
  canReadResult,
}: AssessmentsTabProps) {
  if (canStart) {
    return (
      <EmptyState
        icon={<ClipboardCheck />}
        title="التقييم المبدئي"
        description="يُكمل طفلك التقييم المبدئي مرة واحدة، ويراجع الأخصائي النتيجة."
        action={<StartAssessmentLink childId={childId} childName={childName} />}
      />
    );
  }
  if (!canReadResult) {
    return (
      <EmptyState
        icon={<ClipboardCheck />}
        title="يراجع الأخصائي نتيجة التقييم المبدئي"
        description="نتيجة التقييم المبدئي متاحة للأخصائي المتابِع للطفل."
      />
    );
  }
  return <StaffAssessmentResult childId={childId} />;
}

function StaffAssessmentResult({ childId }: { childId: string }) {
  const query = useAssessmentResult(childId);
  if (query.isPending || query.isError) {
    return <QueryStatus query={query} errorTitle="تعذّر تحميل نتيجة التقييم" />;
  }
  if (!query.data) {
    return (
      <EmptyState
        icon={<ClipboardCheck />}
        title="لم يُكمل الطفل التقييم المبدئي بعد"
        description="ستظهر النتيجة هنا بعد إنهاء التقييم المبدئي."
      />
    );
  }
  return (
    <Card as="section" className={styles.card} aria-label="نتيجة التقييم المبدئي">
      <AssessmentResultView result={query.data} />
    </Card>
  );
}
