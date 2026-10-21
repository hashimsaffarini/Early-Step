import { Plus, Users } from 'lucide-react';
import { useState } from 'react';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { ChildSummary } from '@/services/api/childrenLists';

import { useAssignableChildren } from '../api/usersQueries';

import { AssignChildSpecialistDialog } from './AssignChildSpecialistDialog';
import styles from '../pages/users.module.css';

/** «+ تعيين أخصائي» for one child — shared by the children tab and the parent's page. */
export function AssignSpecialistButton({
  child,
  onClick,
}: {
  child: ChildSummary;
  onClick: () => void;
}) {
  return (
    <Button
      variant="soft"
      size="sm"
      iconStart={<Plus aria-hidden="true" />}
      aria-label={`تعيين أخصائي لـ ${child.fullName}`}
      onClick={onClick}
    >
      تعيين أخصائي
    </Button>
  );
}

/**
 * Every child with its current specialist (see `fetchAssignableChildren`: the API has no Admin
 * children list) and «+ تعيين أخصائي» per child (client revision 2026-10).
 */
export function ChildrenAssignmentList() {
  const children = useAssignableChildren();
  const [assigning, setAssigning] = useState<ChildSummary | null>(null);

  let content;
  if (children.isPending) {
    content = <LoadingState label="جارٍ تحميل الأطفال…" />;
  } else if (children.isError) {
    content = (
      <ErrorState
        title="تعذّر تحميل الأطفال"
        description={children.error.message}
        action={
          <Button variant="outline" onClick={() => void children.refetch()}>
            إعادة المحاولة
          </Button>
        }
      />
    );
  } else if (children.data.length === 0) {
    content = (
      <EmptyState
        icon={<Users />}
        title="لا يوجد أطفال بعد"
        description="يضيف أولياء الأمور أطفالهم من حساباتهم."
      />
    );
  } else {
    content = (
      <ul className={styles.list} aria-label="الأطفال">
        {children.data.map((child) => (
          <li key={child.id} className={styles.childRow}>
            <Avatar name={child.fullName} />
            <span className={styles.childText}>
              <span className={styles.name}>{child.fullName}</span>
              {child.parentName ? (
                <span className={styles.muted}>{`ولي الأمر: ${child.parentName}`}</span>
              ) : null}
            </span>
            {child.specialistName ? (
              <Badge tone="success">{`الأخصائي: ${child.specialistName}`}</Badge>
            ) : (
              <Badge tone="warning">بلا أخصائي</Badge>
            )}
            <AssignSpecialistButton
              child={child}
              onClick={() => {
                setAssigning(child);
              }}
            />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <>
      {content}
      {assigning ? (
        <AssignChildSpecialistDialog
          child={assigning}
          onClose={() => {
            setAssigning(null);
          }}
        />
      ) : null}
    </>
  );
}
