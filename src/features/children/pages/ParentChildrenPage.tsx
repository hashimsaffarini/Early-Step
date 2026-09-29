import { Plus, SearchX, Users } from 'lucide-react';
import { useState } from 'react';

import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchField } from '@/components/shared/SearchField';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Feedback';

import { AddChildDialog } from '../components/AddChildDialog';
import { ParentChildCard } from '../components/ParentChildCard';
import { MOCK_PARENT_CHILDREN_LIST } from '../mock/parentChildren.mock';
import type { AddChildFormValues } from '../schemas/addChild';
import type { ParentChild } from '../types';

import styles from './ParentChildrenPage.module.css';

const COPY = {
  title: 'أطفالي',
  subtitle: 'إدارة الملفات الشخصية ومتابعة التطور',
  add: 'إضافة طفل',
  search: 'البحث عن طفل',
  searchPlaceholder: 'ابحث بالاسم…',
  listLabel: 'قائمة الأطفال',
  emptyTitle: 'لا يوجد أطفال هنا',
  emptyText: 'قم بإضافة ملف طفل للبدء بالتقييم',
  noResultsTitle: 'لا توجد نتائج',
  noResultsText: 'لم نجد طفلاً بهذا الاسم.',
  added: (name: string) => `تمت إضافة ${name} إلى قائمة أطفالك.`,
  localOnly: 'نسخة للواجهة فقط: لن تُحفظ الإضافة بعد تحديث الصفحة.',
} as const;

export interface ParentChildrenPageProps {
  /** Initial list (defaults to the temporary mock list). */
  initialChildren?: readonly ParentChild[];
}

/**
 * Parent children list + add-child dialog (Replit children screen).
 * UI only: the list lives in local state; added children are not persisted.
 */
export function ParentChildrenPage({
  initialChildren = MOCK_PARENT_CHILDREN_LIST,
}: ParentChildrenPageProps) {
  const [children, setChildren] = useState<readonly ParentChild[]>(initialChildren);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [lastAddedName, setLastAddedName] = useState<string | null>(null);

  const openDialog = () => {
    setIsDialogOpen(true);
  };

  // TEMPORARY local behaviour until the children API is integrated.
  const handleAdd = (values: AddChildFormValues) => {
    const child: ParentChild = {
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
        title={COPY.title}
        subtitle={COPY.subtitle}
        actions={children.length > 0 ? addButton : undefined}
      />

      {lastAddedName ? (
        <Alert tone="success">
          {COPY.added(lastAddedName)} {COPY.localOnly}
        </Alert>
      ) : null}

      {children.length === 0 ? (
        <EmptyState
          icon={<Users />}
          title={COPY.emptyTitle}
          description={COPY.emptyText}
          action={addButton}
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
                  <ParentChildCard child={child} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <AddChildDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
        }}
        onAdd={handleAdd}
      />
    </div>
  );
}
