import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router';

import { ROUTE_PATHS } from '@/app/router/paths';
import { EmptyState } from '@/components/shared/EmptyState';
import { getButtonClassName } from '@/components/ui/Button';

export function UnauthorizedPage() {
  return (
    <main className="page-center">
      <EmptyState
        icon={<ShieldAlert />}
        title="غير مصرّح لك بالوصول"
        description="ليست لديك صلاحية لعرض هذه الصفحة."
        action={
          <Link to={ROUTE_PATHS.home} className={getButtonClassName()}>
            العودة إلى الصفحة الرئيسية
          </Link>
        }
      />
    </main>
  );
}
