import { Link } from 'react-router';

import { DEV_PREVIEW_PATHS } from '@/app/router/paths';
import { BrandMark } from '@/components/layout/BrandMark';
import { getButtonClassName } from '@/components/ui/Button';

/** Temporary foundation screen. Replaced once real routes exist. */
export function HomePage() {
  return (
    <main className="page-center stack" aria-labelledby="home-title">
      <BrandMark />
      <h1 id="home-title">أهلاً بك في Early Step</h1>
      <p>تمّت تهيئة الواجهة الأساسية للمشروع.</p>
      {import.meta.env.DEV ? (
        <Link to={DEV_PREVIEW_PATHS.root} className={getButtonClassName({ variant: 'soft' })}>
          معاينة مكونات الواجهة
        </Link>
      ) : null}
    </main>
  );
}
