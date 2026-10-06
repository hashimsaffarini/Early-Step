import { FileText } from 'lucide-react';

import { EmptyState } from '@/components/shared/EmptyState';

/** BLOCKED BY BACKEND: there is no Super Admin endpoint that lists reports. */
export function ReportsTab() {
  return (
    <EmptyState
      icon={<FileText />}
      title="قائمة التقارير غير متاحة"
      description="لا يوفّر الخادم بعد واجهة لعرض جميع التقارير للمدير العام."
    />
  );
}
