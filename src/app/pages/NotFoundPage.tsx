import { Link } from 'react-router';

import { ROUTE_PATHS } from '@/app/router/paths';
import { EmptyState } from '@/components/shared/EmptyState';

export function NotFoundPage() {
  return (
    <section className="page-center">
      <EmptyState
        title="الصفحة غير موجودة"
        description="لم نتمكن من العثور على الصفحة المطلوبة."
        action={<Link to={ROUTE_PATHS.home}>العودة إلى الصفحة الرئيسية</Link>}
      />
    </section>
  );
}
