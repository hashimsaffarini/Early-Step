import { SearchX } from 'lucide-react';
import { Link } from 'react-router';

import { ROUTE_PATHS } from '@/app/router/paths';
import { EmptyState } from '@/components/shared/EmptyState';
import { getButtonClassName } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <main className="page-center">
      <EmptyState
        icon={<SearchX />}
        title="الصفحة غير موجودة"
        description="لم نتمكن من العثور على الصفحة المطلوبة."
        action={
          <Link to={ROUTE_PATHS.home} className={getButtonClassName()}>
            العودة إلى الصفحة الرئيسية
          </Link>
        }
      />
    </main>
  );
}
