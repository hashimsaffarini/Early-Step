import { Gamepad2, ListChecks, Plus } from 'lucide-react';
import { useState } from 'react';

import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingState } from '@/components/shared/LoadingState';
import { SearchField } from '@/components/shared/SearchField';
import { ServerImage } from '@/components/shared/ServerImage';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Feedback';
import { Modal } from '@/components/ui/Modal';
import { Tabs, type TabItem } from '@/components/ui/Tabs';
import type { ActivityType } from '@/services/api/activityType';

import { useAssignActivityMutation, useAvailableActivities } from '../api/trainingPlansQueries';

import styles from './plans.module.css';

const TYPE_TABS: readonly TabItem<ActivityType>[] = [
  { value: 'test', label: 'اختبارات', icon: <ListChecks aria-hidden="true" size={16} /> },
  { value: 'game', label: 'ألعاب', icon: <Gamepad2 aria-hidden="true" size={16} /> },
];

export interface AssignActivityDialogProps {
  isOpen: boolean;
  childId: string;
  childName: string;
  onClose: () => void;
}

/** Specialist picker over `available-activities` → `POST …/activities { activityId }`. */
export function AssignActivityDialog({
  isOpen,
  childId,
  childName,
  onClose,
}: AssignActivityDialogProps) {
  const [type, setType] = useState<ActivityType>('test');
  const [query, setQuery] = useState('');
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const available = useAvailableActivities(childId, type, isOpen);
  const assignMutation = useAssignActivityMutation(childId);

  const trimmed = query.trim();
  const items = (available.data ?? []).filter(
    (item) =>
      !trimmed || item.title.includes(trimmed) || (item.categoryName ?? '').includes(trimmed),
  );

  let list;
  if (available.isPending) {
    list = <LoadingState label="جارٍ تحميل الأنشطة…" />;
  } else if (available.error) {
    list = <ApiErrorAlert error={available.error} onRetry={() => void available.refetch()} />;
  } else if (items.length === 0) {
    list = (
      <EmptyState
        isBoxed={false}
        title={trimmed ? 'لا توجد نتائج' : 'لا توجد أنشطة متاحة من هذا النوع'}
      />
    );
  } else {
    list = (
      <ul className={styles.pickerList} aria-label="الأنشطة المتاحة">
        {items.map((item) => (
          <li key={item.id} className={styles.item}>
            <span className={styles.itemIcon} aria-hidden="true">
              <ServerImage
                path={item.iconUrl}
                alt=""
                className={styles.itemIconImage}
                fallback={type === 'game' ? <Gamepad2 /> : <ListChecks />}
              />
            </span>
            <div className={styles.itemText}>
              <h3 className={styles.itemTitle}>{item.title || 'نشاط'}</h3>
              <div className={styles.badges}>
                {item.categoryName ? <Badge>{item.categoryName}</Badge> : null}
                {item.questionCount !== null ? (
                  <Badge>{`${item.questionCount} أسئلة`}</Badge>
                ) : null}
              </div>
            </div>
            {item.isAssigned ? (
              <Badge tone="success">مُضاف إلى الخطة</Badge>
            ) : (
              <Button
                size="sm"
                variant="soft"
                iconStart={<Plus aria-hidden="true" />}
                aria-label={`إضافة «${item.title}» إلى الخطة`}
                isLoading={assignMutation.isPending && assignMutation.variables === item.id}
                disabled={assignMutation.isPending}
                onClick={() => {
                  assignMutation.mutate(item.id, {
                    onSuccess: () => {
                      setLastAdded(item.title);
                    },
                  });
                }}
              >
                إضافة
              </Button>
            )}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setLastAdded(null);
        assignMutation.reset();
        onClose();
      }}
      title="إضافة نشاط إلى الخطة"
      description={`اختر نشاطاً لإضافته إلى خطة ${childName}.`}
      size="lg"
    >
      <div className={styles.picker}>
        {lastAdded ? <Alert tone="success">{`تمت إضافة «${lastAdded}» إلى الخطة.`}</Alert> : null}
        {/* Live 2026-10-14: the server explains failures itself, e.g. 400 "يجب تعيين معلم للطفل
            قبل إنشاء الخطة التدريبية." for a first activity without a teacher. */}
        <ApiErrorAlert error={assignMutation.error} />
        <Tabs label="نوع النشاط" items={TYPE_TABS} value={type} onChange={setType}>
          <div className={styles.picker}>
            <SearchField
              label="البحث في الأنشطة"
              placeholder="ابحث بالعنوان أو التصنيف…"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
              }}
            />
            {list}
          </div>
        </Tabs>
      </div>
    </Modal>
  );
}
