import {
  CircleCheck,
  CircleDashed,
  ChevronDown,
  FolderTree,
  Gamepad2,
  ClipboardList,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Field';
import { useActivities, useCategoryQuestions } from '../api/contentQueries';
import type { Category } from '../types';
import { QueryStatus } from './QueryStatus';
import styles from './AssessmentCategoryBrowser.module.css';

function CategoryActivities({ categoryId }: { categoryId: string }) {
  const query = useCategoryQuestions(categoryId);
  const groups = query.data ?? [];
  const tests = useActivities('test', categoryId);
  const games = useActivities('game', categoryId);
  return (
    <div className={styles.groups}>
      <QueryStatus
        isLoading={query.isPending}
        error={query.error}
        isEmpty={groups.length === 0}
        emptyTitle="لا توجد أنشطة بأسئلة في هذا التصنيف"
        onRetry={() => void query.refetch()}
      />
      {(['test', 'game'] as const).map((type) => {
        const activities = (type === 'test' ? tests.data : games.data) ?? [];
        return (
          <details key={type} className={styles.group}>
            <summary>
              {type === 'game' ? (
                <Gamepad2 aria-hidden="true" />
              ) : (
                <ClipboardList aria-hidden="true" />
              )}
              {type === 'game' ? 'الألعاب' : 'الاختبارات'}
              <Badge tone={type === 'game' ? 'success' : 'accent'}>{activities.length}</Badge>
            </summary>
            {activities.length === 0 ? (
              <p className={styles.muted}>لا توجد عناصر حالياً.</p>
            ) : (
              activities.map((activity) => {
                const questions =
                  groups.find((group) => group.activity.id === activity.id)?.questions ?? [];
                return (
                  <details key={activity.id} className={styles.activity}>
                    <summary>
                      {activity.title}
                      <Badge>{`${questions.length.toString()} أسئلة`}</Badge>
                    </summary>
                    <ol className={styles.questions}>
                      {questions.map((question) => (
                        <li key={question.id}>{question.text || 'سؤال بلا نص'}</li>
                      ))}
                    </ol>
                  </details>
                );
              })
            )}
          </details>
        );
      })}
    </div>
  );
}

/** All real categories with expandable tests/games, counts and immediate API membership updates. */
export function AssessmentCategoryBrowser({
  categories,
  memberIds,
  pending,
  onToggle,
}: {
  categories: readonly Category[];
  memberIds: ReadonlySet<string>;
  pending: boolean;
  onToggle: (categoryId: string, include: boolean) => void;
}) {
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());
  const tests = useActivities('test');
  const games = useActivities('game');
  const ready = tests.isSuccess && games.isSuccess;
  const counts = (categoryId: string) => ({
    tests: (tests.data ?? []).filter((item) => item.categoryId === categoryId).length,
    games: (games.data ?? []).filter((item) => item.categoryId === categoryId).length,
  });
  const toggleExpanded = (id: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  return (
    <div className={styles.browser}>
      <div className={styles.toolbar}>
        <strong>{`التصنيفات المحددة: ${categories.filter((category) => memberIds.has(category.id)).length.toString()} / ${categories.length.toString()}`}</strong>
        <div className={styles.controls}>
          <Button
            size="sm"
            variant="soft"
            onClick={() => {
              setExpanded(new Set(categories.map((category) => category.id)));
            }}
          >
            توسيع الكل
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setExpanded(new Set());
            }}
          >
            طي الكل
          </Button>
        </div>
      </div>
      <ul className={styles.list} aria-label="كل التصنيفات">
        {categories.map((category) => {
          const member = memberIds.has(category.id);
          const count = counts(category.id);
          const open = expanded.has(category.id);
          return (
            <li key={category.id} className={styles.category} data-selected={member}>
              <div className={styles.heading}>
                <span className={styles.icon} aria-hidden="true">
                  <FolderTree />
                </span>
                <div className={styles.identity}>
                  <h3>{category.name}</h3>
                  {ready ? (
                    <div className={styles.counts}>
                      <Badge tone="primary">{`الأنشطة: ${(count.tests + count.games).toString()}`}</Badge>
                      <Badge tone="accent">{`اختبارات: ${count.tests.toString()}`}</Badge>
                      <Badge tone="success">{`ألعاب: ${count.games.toString()}`}</Badge>
                    </div>
                  ) : null}
                  <span className={styles.membership}>
                    {member ? (
                      <CircleCheck aria-hidden="true" />
                    ) : (
                      <CircleDashed aria-hidden="true" />
                    )}
                    {member ? 'ضمن التقييم' : 'غير مضاف'}
                  </span>
                </div>
                <Checkbox
                  label={`تضمين ${category.name} في التقييم`}
                  checked={member}
                  disabled={pending}
                  onChange={(event) => {
                    onToggle(category.id, event.target.checked);
                  }}
                />
                <Button
                  size="sm"
                  variant={member ? 'outline' : 'soft'}
                  disabled={pending}
                  onClick={() => {
                    onToggle(category.id, !member);
                  }}
                >
                  {member
                    ? `إزالة ${category.name} من التقييم`
                    : `إضافة ${category.name} إلى التقييم`}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-expanded={open}
                  aria-label={`${open ? 'طي' : 'توسيع'} ${category.name}`}
                  iconStart={<ChevronDown aria-hidden="true" />}
                  onClick={() => {
                    toggleExpanded(category.id);
                  }}
                />
              </div>
              {open ? <CategoryActivities categoryId={category.id} /> : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
