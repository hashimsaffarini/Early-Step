import { CircleCheck, ClipboardList, Gamepad2, SearchX } from 'lucide-react';
import { useState } from 'react';

import { CategoryTile } from '@/components/shared/CategoryTile';
import { EmptyState } from '@/components/shared/EmptyState';
import { SearchField } from '@/components/shared/SearchField';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Tabs, type TabItem } from '@/components/ui/Tabs';
import { ACTIVITY_CATEGORY_DISPLAY } from '@/constants/activityCategories';
import { cx } from '@/utils/classNames';

import { ASSIGNABLE_ACTIVITIES, type AssignableActivity } from '../mock/assignableActivities.mock';
import type { PlanActivityType } from '../types';

import styles from './AssignActivityDialog.module.css';
import { formatActivityCount } from './profile/labels';

export interface AssignActivityDialogProps {
  isOpen: boolean;
  childName: string;
  /** Game/test ids the child already has (plan + local assignments). */
  assignedActivityIds: ReadonlySet<string>;
  onAssign: (activity: AssignableActivity) => void;
  onClose: () => void;
}

const TYPE_TABS: readonly { type: PlanActivityType; label: string }[] = [
  { type: 'game', label: 'الألعاب' },
  { type: 'test', label: 'الاختبارات' },
];

/**
 * Replit "تعيين نشاط للطفل": pick games or tests for a child. Staff only.
 * UI only — assignments stay in the profile page's local state.
 */
export function AssignActivityDialog({
  isOpen,
  childName,
  assignedActivityIds,
  onAssign,
  onClose,
}: AssignActivityDialogProps) {
  const [type, setType] = useState<PlanActivityType>('game');
  const [query, setQuery] = useState('');
  const [assignedNow, setAssignedNow] = useState(0);

  const close = () => {
    setQuery('');
    setAssignedNow(0);
    onClose();
  };

  const tabItems: readonly TabItem<PlanActivityType>[] = TYPE_TABS.map((tab) => ({
    value: tab.type,
    label: tab.label,
    count: ASSIGNABLE_ACTIVITIES.filter((activity) => activity.type === tab.type).length,
    icon:
      tab.type === 'game' ? (
        <Gamepad2 aria-hidden="true" size={16} />
      ) : (
        <ClipboardList aria-hidden="true" size={16} />
      ),
  }));

  const normalizedQuery = query.trim();
  const visible = ASSIGNABLE_ACTIVITIES.filter(
    (activity) =>
      activity.type === type &&
      (!normalizedQuery ||
        activity.title.includes(normalizedQuery) ||
        ACTIVITY_CATEGORY_DISPLAY[activity.category].label.includes(normalizedQuery)),
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      size="lg"
      title="تعيين نشاط للطفل"
      description={`اختر ألعاباً أو اختبارات ليمارسها ${childName}.`}
      footer={
        <div className={styles.footer}>
          <p className={styles.count} role="status">
            {assignedNow > 0 ? `تم تعيين ${formatActivityCount(assignedNow)}` : ''}
          </p>
          <Button onClick={close}>تم</Button>
        </div>
      }
    >
      <div className={styles.body}>
        <Tabs
          label="نوع النشاط"
          items={tabItems}
          value={type}
          onChange={(value) => {
            setType(value);
            setQuery('');
          }}
        >
          <div className={styles.body}>
            <SearchField
              label="البحث عن نشاط"
              placeholder="ابحث بالاسم أو المهارة…"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
              }}
            />
            {visible.length === 0 ? (
              <EmptyState isBoxed={false} icon={<SearchX />} title="لا توجد نتائج" />
            ) : (
              <ul className={styles.list}>
                {visible.map((activity) => {
                  const isAssigned = assignedActivityIds.has(activity.id);
                  return (
                    <li
                      key={activity.id}
                      className={cx(styles.item, isAssigned && styles.assigned)}
                    >
                      <CategoryTile category={activity.category} emoji={activity.emoji} size="sm" />
                      <div className={styles.itemBody}>
                        <span className={styles.itemTitle}>{activity.title}</span>
                        <span className={styles.itemMeta}>
                          {ACTIVITY_CATEGORY_DISPLAY[activity.category].label}
                        </span>
                      </div>
                      {isAssigned ? (
                        <Badge tone="success">
                          <CircleCheck aria-hidden="true" size={14} />
                          مُعيَّن
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="soft"
                          aria-label={`تعيين ${activity.title}`}
                          onClick={() => {
                            onAssign(activity);
                            setAssignedNow((count) => count + 1);
                          }}
                        >
                          تعيين
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Tabs>
      </div>
    </Modal>
  );
}
