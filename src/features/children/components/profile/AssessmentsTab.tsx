import { ClipboardCheck } from 'lucide-react';

import { EmptyState } from '@/components/shared/EmptyState';

import { ASSESSMENT_RESULTS_UNAVAILABLE } from './assessmentCopy';
import { StartAssessmentLink } from './StartAssessmentLink';

export interface AssessmentsTabProps {
  childId: string;
  childName: string;
  canStart: boolean;
}

/** Assessment history is BLOCKED BY BACKEND (no read endpoint) — say so, offer to start one. */
export function AssessmentsTab({ childId, childName, canStart }: AssessmentsTabProps) {
  return (
    <EmptyState
      icon={<ClipboardCheck />}
      title="سجل التقييمات غير متاح بعد"
      description={ASSESSMENT_RESULTS_UNAVAILABLE}
      action={
        canStart ? <StartAssessmentLink childId={childId} childName={childName} /> : undefined
      }
    />
  );
}
