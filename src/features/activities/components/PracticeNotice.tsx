import { Alert } from '@/components/ui/Feedback';

/**
 * The catalogue tests and games are local practice content: the backend has no activities
 * endpoint for non-admin roles and no endpoint to save results (BLOCKED BY BACKEND).
 */
export const PRACTICE_LABEL = 'تدريب — لا تُحفظ النتائج';

export function PracticeNotice() {
  return (
    <Alert tone="info">
      {`${PRACTICE_LABEL}. هذه أنشطة تدريبية للتجربة على هذا الجهاز فقط، ولا تُرسل إلى الخادم. الأنشطة المعتمدة لكل طفل تظهر في ملفه ضمن خطته التدريبية.`}
    </Alert>
  );
}
