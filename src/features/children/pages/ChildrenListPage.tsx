import { Plus, SearchX, ServerOff, Users } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchField } from '@/components/shared/SearchField';
import { Button, getButtonClassName } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Feedback';
import { ADMIN_PATHS } from '@/constants/routes';
import { useChildrenForRole } from '@/hooks/api/childResources';
import { useRoleArea } from '@/hooks/useRoleArea';

import { ChildFormDialog } from '../components/ChildFormDialog';
import { ChildListCard } from '../components/ChildListCard';

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
  loading: 'جارٍ تحميل الأطفال…',
  errorTitle: 'تعذّر تحميل قائمة الأطفال',
  retry: 'إعادة المحاولة',
  adminBlockedTitle: 'لا تتوفر قائمة أطفال للمدير من الخادم',
  adminBlockedText:
    'لا يوفّر الخادم حالياً قائمة بجميع الأطفال للمدير. يمكنك عرض أطفال كل ولي أمر من صفحة المستخدمين.',
  goToUsers: 'الانتقال إلى المستخدمين',
} as const;

/** Admin: the API has no children-list endpoint (BLOCKED BY BACKEND) — say so honestly. */
function AdminChildrenBlocked() {
  const copy = CHILDREN_LIST_COPY.Admin;
  return (
    <div className={styles.page}>
      <PageHeader title={copy.title} subtitle={copy.subtitle} />
      <EmptyState
        icon={<ServerOff />}
        title={COPY.adminBlockedTitle}
        description={COPY.adminBlockedText}
        action={
          <Link to={ADMIN_PATHS.users} className={getButtonClassName()}>
            {COPY.goToUsers}
          </Link>
        }
      />
    </div>
  );
}

/**
 * Children list for every role. Parent: `GET Parent/GetMyChildren` + add child; Teacher /
 * Specialist: their assigned children (with the parent's name). Admin: blocked (no endpoint).
 */
export function ChildrenListPage() {
  const { role } = useRoleArea();
  const query = useChildrenForRole(role);
  const copy = CHILDREN_LIST_COPY[role];
  const canAddChild = role === 'Parent';
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [lastAddedName, setLastAddedName] = useState<string | null>(null);

  if (role === 'Admin') return <AdminChildrenBlocked />;

  const children = query.data ?? [];
  const openDialog = () => {
    setIsDialogOpen(true);
  };
  const addButton = (
    <Button iconStart={<Plus aria-hidden="true" />} onClick={openDialog}>
      {COPY.add}
    </Button>
  );

  const normalized = search.trim();
  const visible = normalized
    ? children.filter((child) => child.fullName.includes(normalized))
    : children;

  let content;
  if (query.isPending) {
    content = <LoadingState label={COPY.loading} />;
  } else if (query.isError) {
    content = (
      <ErrorState
        title={COPY.errorTitle}
        description={query.error.message}
        action={
          <Button variant="outline" onClick={() => void query.refetch()}>
            {COPY.retry}
          </Button>
        }
      />
    );
  } else if (children.length === 0) {
    content = (
      <EmptyState
        icon={<Users />}
        title={copy.emptyTitle}
        description={copy.emptyText}
        action={canAddChild ? addButton : undefined}
      />
    );
  } else {
    content = (
      <>
        <SearchField
          label={COPY.search}
          placeholder={COPY.searchPlaceholder}
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
          }}
        />
        {visible.length === 0 ? (
          <EmptyState
            icon={<SearchX />}
            title={COPY.noResultsTitle}
            description={COPY.noResultsText}
          />
        ) : (
          <ul className={styles.grid} aria-label={COPY.listLabel}>
            {visible.map((child) => (
              <li key={child.id}>
                <ChildListCard child={child} showParent={!canAddChild} />
              </li>
            ))}
          </ul>
        )}
      </>
    );
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title={copy.title}
        subtitle={copy.subtitle}
        actions={canAddChild && children.length > 0 ? addButton : undefined}
      />
      {lastAddedName ? <Alert tone="success">{COPY.added(lastAddedName)}</Alert> : null}
      {content}
      {canAddChild ? (
        <ChildFormDialog
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
          }}
          onSaved={(name) => {
            setLastAddedName(name);
            setSearch('');
            setIsDialogOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
