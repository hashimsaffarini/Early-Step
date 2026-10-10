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
}

/** The child's initial-assessment result (`GET initial-assessment/{childId}/result`). */
export function AssessmentsTab({ childId, childName, canStart }: AssessmentsTabProps) {
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
        action={
          canStart ? <StartAssessmentLink childId={childId} childName={childName} /> : undefined
        }
      />
    );
  }
  return (
    <Card as="section" className={styles.card} aria-label="نتيجة التقييم المبدئي">
      <AssessmentResultView result={query.data} />
    </Card>
  );
}
