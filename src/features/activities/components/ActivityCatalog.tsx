import { useMemo, useState, type ReactNode } from 'react';

import { CategoryTile } from '@/components/shared/CategoryTile';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageBanner, type PageBannerTone } from '@/components/shared/PageBanner';
import { Alert } from '@/components/ui/Feedback';
import { ACTIVITY_CATEGORY_DISPLAY } from '@/constants/activityCategories';
import { useRoleArea } from '@/hooks/useRoleArea';
import { cx } from '@/utils/classNames';

import { getAssignableChildren, type AssignableChild } from '../mock/assignableChildren.mock';

import styles from './ActivityCatalog.module.css';
import { AssignToChildDialog } from './AssignToChildDialog';
import { CatalogCard } from './CatalogCard';
import { CategoryFilter } from './CategoryFilter';
import {
  formatActivityCount,
  type ActivityKind,
  type CatalogItem,
  type CategoryFilterValue,
} from './catalogTypes';

export interface ActivityCatalogProps {
  kind: ActivityKind;
  items: readonly CatalogItem[];
  banner: {
    title: string;
    subtitle: string;
    eyebrow: string;
    tone: PageBannerTone;
  };
  playLabel: string;
  emptyIcon: ReactNode;
  emptyTitle: string;
}

/**
 * Tests/games catalogue body (Replit): gradient hero with real local counts, category
 * chips, card grid, assign-to-child dialog (local confirmation only).
 */
export function ActivityCatalog({
  kind,
  items,
  banner,
  playLabel,
  emptyIcon,
  emptyTitle,
}: ActivityCatalogProps) {
  const { role } = useRoleArea();
  const [category, setCategory] = useState<CategoryFilterValue>('all');
  const [assigning, setAssigning] = useState<CatalogItem | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const counts = useMemo(() => {
    const result: Partial<Record<CategoryFilterValue, number>> = { all: items.length };
    for (const item of items) result[item.category] = (result[item.category] ?? 0) + 1;
    return result;
  }, [items]);

  const categoryCount = Object.keys(counts).length - 1;
  const visible = category === 'all' ? items : items.filter((item) => item.category === category);
  const childrenList = getAssignableChildren(role);

  const handleAssign = (child: AssignableChild) => {
    if (!assigning) return;
    setConfirmation(`تم تعيين «${assigning.title}» لـ ${child.name}.`);
    setAssigning(null);
  };

  return (
    <div className={styles.page}>
      <PageBanner
        title={banner.title}
        subtitle={banner.subtitle}
        eyebrow={banner.eyebrow}
        tone={banner.tone}
        aside={
          <dl className={styles.stats}>
            <div className={styles.stat}>
              <dt className={styles.statLabel}>{kind === 'test' ? 'اختبار متاح' : 'لعبة متاحة'}</dt>
              <dd className={styles.statValue}>{items.length}</dd>
            </div>
            <div className={styles.stat}>
              <dt className={styles.statLabel}>تصنيف</dt>
              <dd className={styles.statValue}>{categoryCount}</dd>
            </div>
          </dl>
        }
      />

      {confirmation ? <Alert tone="success">{confirmation}</Alert> : null}

      <CategoryFilter value={category} onChange={setCategory} counts={counts} />

      {category !== 'all' ? (
        <div className={styles.categoryHeading}>
          <CategoryTile
            category={category}
            emoji={ACTIVITY_CATEGORY_DISPLAY[category].emoji}
            size="sm"
          />
          <div>
            <h2 className={styles.categoryTitle}>{ACTIVITY_CATEGORY_DISPLAY[category].label}</h2>
            <p className={styles.categoryCount}>
              {`${formatActivityCount(visible.length, kind)} في هذا التصنيف`}
            </p>
          </div>
        </div>
      ) : (
        <h2 className="visually-hidden">{kind === 'test' ? 'كل الاختبارات' : 'كل الألعاب'}</h2>
      )}

      {visible.length === 0 ? (
        <EmptyState icon={emptyIcon} title={emptyTitle} />
      ) : (
        <ul
          className={cx(styles.grid, kind === 'game' && styles.games)}
          aria-label={kind === 'test' ? 'قائمة الاختبارات' : 'قائمة الألعاب'}
        >
          {visible.map((item) => (
            <li key={item.id}>
              <CatalogCard item={item} playLabel={playLabel} onAssign={setAssigning} />
            </li>
          ))}
        </ul>
      )}

      <AssignToChildDialog
        isOpen={assigning !== null}
        onClose={() => {
          setAssigning(null);
        }}
        activityTitle={assigning?.title ?? ''}
        kind={kind}
        childrenList={childrenList}
        onAssign={handleAssign}
      />
    </div>
  );
}
