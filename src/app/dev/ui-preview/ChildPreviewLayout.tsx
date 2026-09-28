import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

import { DEV_PREVIEW_PATHS } from '@/app/router/paths';
import { ChildActivityLayout } from '@/components/layout/ChildActivityLayout';
import { getButtonClassName } from '@/components/ui/Button';

import styles from './preview.module.css';

export function ChildPreviewLayout() {
  return (
    <ChildActivityLayout
      topBar={
        <>
          <Link
            to={DEV_PREVIEW_PATHS.root}
            className={getButtonClassName({ variant: 'ghost', size: 'sm' })}
          >
            <ArrowRight aria-hidden="true" />
            خروج
          </Link>
          <span className={styles.topBarTitle}>نشاط تجريبي</span>
        </>
      }
    />
  );
}
