import { ClipboardCheck } from 'lucide-react';

import { DashboardPanel } from '@/components/shared/ChildDashboard';
import { useAssessmentResult } from '@/hooks/api/childResources';

import { AssessmentResultView } from './AssessmentResultView';
import styles from './profile.module.css';
import { QueryStatus } from './TabStatus';

/**
 * Staff (Specialist): the child's saved initial-assessment result
 * (`GET initial-assessment/{childId}/result`; null until the assessment is completed).
 */
export function AssessmentResultPanel({ childId }: { childId: string }) {
  const query = useAssessmentResult(childId);
  let body;
  if (query.isPending || query.isError) {
    body = <QueryStatus query={query} errorTitle="تعذّر تحميل نتيجة التقييم" />;
  } else if (query.data) {
    body = <AssessmentResultView result={query.data} />;
  } else {
    body = <p className={styles.muted}>لم يُكمل الطفل التقييم المبدئي بعد.</p>;
  }
  return (
    <DashboardPanel id="child-assessment-title" title="التقييم المبدئي" icon={ClipboardCheck}>
      {body}
    </DashboardPanel>
  );
}
