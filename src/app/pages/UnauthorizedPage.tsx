import { Link } from 'react-router';

import { ROUTE_PATHS } from '@/app/router/paths';
import { EmptyState } from '@/components/shared/EmptyState';

export function UnauthorizedPage() {
  return (
    <section className="page-center">
      <EmptyState
        title="غير مصرّح لك بالوصول"
        description="ليست لديك صلاحية لعرض هذه الصفحة."
        action={<Link to={ROUTE_PATHS.home}>العودة إلى الصفحة الرئيسية</Link>}
      />
    </section>
  );
}
