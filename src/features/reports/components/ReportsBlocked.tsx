import { FileText } from 'lucide-react';

import { EmptyState } from '@/components/shared/EmptyState';

/** Admin: the API has no reports endpoint for this role (BLOCKED BY BACKEND). */
export function ReportsBlocked() {
  return (
    <EmptyState
      icon={<FileText />}
      title="التقارير غير متاحة لهذا الدور بعد"
      description="لا يوفّر الخادم حالياً طريقة لعرض التقارير لحساب المدير. ستظهر هنا عند توفرها."
    />
  );
}
