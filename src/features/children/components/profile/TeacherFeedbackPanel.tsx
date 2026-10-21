import { NotebookPen } from 'lucide-react';

import { DashboardPanel } from '@/components/shared/ChildDashboard';
import { useChildFeedbacks } from '@/hooks/api/childResources';
import { formatDisplayDate } from '@/utils/dateFormat';

import styles from './profile.module.css';
import { QueryStatus } from './TabStatus';

/**
 * Specialist, read-only: the teacher's notes on the child
 * (`GET Teacher/children/{childId}/feedbacks`, Specialist 200 since 2026-10-14).
 */
export function TeacherFeedbackPanel({ childId }: { childId: string }) {
  const query = useChildFeedbacks(childId);
  let body;
  if (query.isPending || query.isError) {
    body = <QueryStatus query={query} errorTitle="تعذّر تحميل ملاحظات المعلم" />;
  } else if (query.data.length === 0) {
    body = <p className={styles.muted}>لا توجد ملاحظات من المعلم بعد.</p>;
  } else {
    body = (
      <ul className={styles.notes} aria-label="ملاحظات المعلم">
        {query.data.map((note) => (
          <li key={note.id} className={styles.note}>
            <p className={styles.noteText}>{note.content}</p>
            <p className={styles.muted}>
              {note.teacherName}
              {note.teacherName && note.createdAt ? ' · ' : null}
              {note.createdAt ? (
                <time dateTime={note.createdAt}>
                  {formatDisplayDate(note.createdAt.slice(0, 10))}
                </time>
              ) : null}
            </p>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <DashboardPanel
      id="child-feedback-title"
      title="ملاحظات المعلم"
      icon={NotebookPen}
      iconTone="violet"
    >
      {body}
    </DashboardPanel>
  );
}
