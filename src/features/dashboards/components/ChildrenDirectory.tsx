import { SearchX, Users, type LucideIcon } from 'lucide-react';
import { useState, type ReactNode } from 'react';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { SearchField } from '@/components/shared/SearchField';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Button } from '@/components/ui/Button';
import type { ChildSummary } from '@/services/api/childrenLists';
import type { AppError } from '@/services/http/apiError';

import { matchesName } from '../search';

import styles from './ChildrenDirectory.module.css';

export interface ChildrenDirectoryProps {
  headingId: string;
  title: string;
  icon?: LucideIcon;
  items: readonly ChildSummary[] | undefined;
  isPending: boolean;
  error: AppError | null;
  onRetry: () => void;
  searchLabel: string;
  emptyTitle: string;
  emptyDescription?: string;
  action?: ReactNode;
  renderCard: (child: ChildSummary) => ReactNode;
}

/** Dashboard section: title, name search, card grid, loading/error/empty/no-results states. */
export function ChildrenDirectory({
  headingId,
  title,
  icon = Users,
  items,
  isPending,
  error,
  onRetry,
  searchLabel,
  emptyTitle,
  emptyDescription,
  action,
  renderCard,
}: ChildrenDirectoryProps) {
  const [query, setQuery] = useState('');
  const all = items ?? [];
  const visible = all.filter((child) => matchesName(child.fullName, query));

  let content: ReactNode;
  if (isPending) {
    content = <LoadingState label="جارٍ تحميل الأطفال…" />;
  } else if (error) {
    content = (
      <ErrorState
        title="تعذّر تحميل قائمة الأطفال"
        description={error.message}
        action={
          <Button variant="outline" onClick={onRetry}>
            إعادة المحاولة
          </Button>
        }
      />
    );
  } else if (all.length === 0) {
    content = (
      <EmptyState
        icon={<Users />}
        title={emptyTitle}
        {...(emptyDescription ? { description: emptyDescription } : {})}
      />
    );
  } else if (visible.length === 0) {
    content = (
      <EmptyState
        icon={<SearchX />}
        title="لا نتائج للبحث"
        description="جرّب اسماً آخر أو امسح البحث."
      />
    );
  } else {
    content = (
      <ul className={styles.grid} aria-label={title}>
        {visible.map((child) => (
          <li key={child.id}>{renderCard(child)}</li>
        ))}
      </ul>
    );
  }

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <SectionHeader id={headingId} title={title} icon={icon} action={action} />
      {all.length > 0 ? (
        <SearchField
          label={searchLabel}
          placeholder={searchLabel}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
          }}
        />
      ) : null}
      {content}
    </section>
  );
}
