import { SearchX, Users, type LucideIcon } from 'lucide-react';
import { useState, type ReactNode } from 'react';

import { EmptyState } from '@/components/shared/EmptyState';
import { SearchField } from '@/components/shared/SearchField';
import { SectionHeader } from '@/components/shared/SectionHeader';

import { matchesName } from '../roster';
import type { RosterChild } from '../types';

import styles from './ChildrenDirectory.module.css';

export interface ChildrenDirectoryProps {
  headingId: string;
  title: string;
  icon?: LucideIcon;
  items: readonly RosterChild[];
  searchLabel: string;
  emptyTitle: string;
  emptyDescription?: string;
  action?: ReactNode;
  renderCard: (child: RosterChild) => ReactNode;
}

/** Dashboard section: title, name search, card grid, empty and no-results states. */
export function ChildrenDirectory({
  headingId,
  title,
  icon = Users,
  items,
  searchLabel,
  emptyTitle,
  emptyDescription,
  action,
  renderCard,
}: ChildrenDirectoryProps) {
  const [query, setQuery] = useState('');
  const visible = items.filter((child) => matchesName(child.name, query));

  let content: ReactNode;
  if (items.length === 0) {
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
      {items.length > 0 ? (
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
