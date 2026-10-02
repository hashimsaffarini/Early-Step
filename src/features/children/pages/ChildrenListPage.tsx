import { Plus, SearchX, Users } from 'lucide-react';
import { useState } from 'react';

import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchField } from '@/components/shared/SearchField';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Feedback';
import { useRoleArea } from '@/hooks/useRoleArea';

import { AddChildDialog } from '../components/AddChildDialog';
import { ChildListCard } from '../components/ChildListCard';
import { getMockChildrenForRole } from '../mock/children.mock';
import type { AddChildFormValues } from '../schemas/addChild';
import type { ChildRecord } from '../types';

import styles from './ChildrenListPage.module.css';
import { CHILDREN_LIST_COPY } from './childrenCopy';

const COPY = {
  add: 'إضافة طفل',
  search: 'البحث عن طفل',
  searchPlaceholder: 'ابحث بالاسم…',
  listLabel: 'قائمة الأطفال',
  noResultsTitle: 'لا توجد نتائج',
  noResultsText: 'لم نجد طفلاً بهذا الاسم.',
  added: (name: string) => `تمت إضافة ${name} إلى قائمة أطفالك.`,
  localOnly: 'نسخة للواجهة فقط: لن تُحفظ الإضافة بعد تحديث الصفحة.',
} as const;

export interface ChildrenListPageProps {
  /** Initial list (defaults to the temporary mock list visible to the current role). */
  initialChildren?: readonly ChildRecord[];
}

/**
 * Children list for every role (Replit children screen). The parent can add a child
 * (the API only lets parents create children); staff see the children they follow,
 * with the parent's name. UI only: the list lives in local state; nothing is persisted.
 */
export function ChildrenListPage({ initialChildren }: ChildrenListPageProps) {
  const { role } = useRoleArea();
  const copy = CHILDREN_LIST_COPY[role];
  const canAddChild = role === 'Parent';
  const [children, setChildren] = useState<readonly ChildRecord[]>(
    () => initialChildren ?? getMockChildrenForRole(role),
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [lastAddedName, setLastAddedName] = useState<string | null>(null);

  const openDialog = () => {
    setIsDialogOpen(true);
  };

  // TEMPORARY local behaviour until the children API is integrated.
  const handleAdd = (values: AddChildFormValues) => {
    const child: ChildRecord = {
      id: `local-${crypto.randomUUID()}`,
      name: values.name,
      birthDate: values.birthDate,
      gender: values.gender,
      status: 'assessment-pending',
    };
    setChildren((current) => [...current, child]);
    setLastAddedName(child.name);
    setQuery('');
    setIsDialogOpen(false);
  };

  const normalizedQuery = query.trim();
  const visibleChildren = normalizedQuery
    ? children.filter((child) => child.name.includes(normalizedQuery))
    : children;

  const addButton = (
    <Button iconStart={<Plus aria-hidden="true" />} onClick={openDialog}>
      {COPY.add}
    </Button>
  );

  return (
    <div className={styles.page}>
      <PageHeader
        title={copy.title}
        subtitle={copy.subtitle}
        actions={canAddChild && children.length > 0 ? addButton : undefined}
      />

      {lastAddedName ? (
        <Alert tone="success">
          {COPY.added(lastAddedName)} {COPY.localOnly}
        </Alert>
      ) : null}

      {children.length === 0 ? (
        <EmptyState
          icon={<Users />}
          title={copy.emptyTitle}
          description={copy.emptyText}
          action={canAddChild ? addButton : undefined}
        />
      ) : (
        <>
          <SearchField
            label={COPY.search}
            placeholder={COPY.searchPlaceholder}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
            }}
          />
          {visibleChildren.length === 0 ? (
            <EmptyState
              icon={<SearchX />}
              title={COPY.noResultsTitle}
              description={COPY.noResultsText}
            />
          ) : (
            <ul className={styles.grid} aria-label={COPY.listLabel}>
              {visibleChildren.map((child) => (
                <li key={child.id}>
                  <ChildListCard child={child} showParent={!canAddChild} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {canAddChild ? (
        <AddChildDialog
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
          }}
          onAdd={handleAdd}
        />
      ) : null}
    </div>
  );
}
