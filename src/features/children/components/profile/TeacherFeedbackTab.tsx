import { NotebookPen } from 'lucide-react';

import { EmptyState } from '@/components/shared/EmptyState';
import { Card } from '@/components/ui/Card';
import { useChildFeedbacks } from '@/hooks/api/childResources';
import { formatDisplayDate } from '@/utils/dateFormat';

import styles from './profile.module.css';
import { QueryStatus } from './TabStatus';

/**
 * Specialist, read-only: the teacher's notes on the child
 * (`GET Teacher/children/{childId}/feedbacks`, Specialist 200 since 2026-10-14).
 */
export function TeacherFeedbackTab({ childId }: { childId: string }) {
  const query = useChildFeedbacks(childId);
  if (query.isPending || query.isError) {
    return <QueryStatus query={query} errorTitle="تعذّر تحميل ملاحظات المعلم" />;
  }
  if (query.data.length === 0) {
    return (
      <EmptyState
        icon={<NotebookPen />}
        title="لا توجد ملاحظات من المعلم بعد"
        description="تظهر هنا ملاحظات معلم الطفل عن تقدّمه في الخطة التدريبية."
      />
    );
  }
  return (
    <ul className={styles.list} aria-label="ملاحظات المعلم">
      {query.data.map((note, index) => {
        const date = note.updatedAt ?? note.createdAt;
        return (
          <Card as="li" key={note.id ?? index} className={styles.card}>
            <p>{note.content}</p>
            {date ? (
              <time className={styles.muted} dateTime={date}>
                {formatDisplayDate(date.slice(0, 10))}
              </time>
            ) : null}
          </Card>
        );
      })}
    </ul>
  );
}
