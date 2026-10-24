import { ClipboardCheck } from 'lucide-react';
import type { ReactNode } from 'react';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Button } from '@/components/ui/Button';
import type { AssessmentStatus } from '@/hooks/api/assessmentStatus';

export const PLAN_AFTER_ASSESSMENT = 'ستظهر الخطة التدريبية بعد إكمال التقييم الأولي.';

export interface AssessmentPlanGateProps {
  status: AssessmentStatus;
  children: ReactNode;
}

/**
 * The training plan appears only after the initial assessment is completed (client revision
 * 2026-10), from the real result endpoint: nothing is shown while it loads (no flash of the plan),
 * an incomplete assessment shows why, an error offers a retry. When the endpoint is not readable
 * by this account (403 — today the Parent), the app cannot know, so the plan stays as before.
 */
export function AssessmentPlanGate({ status, children }: AssessmentPlanGateProps) {
  switch (status.state) {
    case 'loading':
      return <LoadingState label="جارٍ التحقق من التقييم الأولي…" />;
    case 'error':
      return (
        <ErrorState
          title="تعذّر التحقق من حالة التقييم الأولي"
          description={status.error.message}
          action={
            <Button variant="outline" onClick={status.retry}>
              إعادة المحاولة
            </Button>
          }
        />
      );
    case 'incomplete':
      return (
        <EmptyState
          icon={<ClipboardCheck />}
          title="لم يكتمل التقييم الأولي بعد."
          description={PLAN_AFTER_ASSESSMENT}
        />
      );
    case 'complete':
    case 'unavailable':
      return children;
  }
}
