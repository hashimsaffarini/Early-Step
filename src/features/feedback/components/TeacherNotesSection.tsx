import { NotebookPen } from 'lucide-react';
import { useId } from 'react';

import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useChildFeedbacks } from '@/hooks/api/childResources';

import { useCreateNote } from '../api/notesQueries';

import { NoteCard } from './NoteCard';
import { NoteForm } from './NoteForm';
import styles from './notes.module.css';

/**
 * «ملاحظات المعلم» inside the teacher's training-plan view (client revision 2026-10: feedback
 * lives in the plan, not on a separate page). List from `GET Teacher/children/{childId}/feedbacks`;
 * add (`POST Teacher/children/{childId}/notes`), edit and delete (`PUT/DELETE Teacher/notes/{id}`).
 */
export function TeacherNotesSection({ childId }: { childId: string }) {
  const headingId = useId();
  const create = useCreateNote(childId);
  const notes = useChildFeedbacks(childId);

  let list;
  if (notes.isPending) {
    list = <LoadingState label="جارٍ تحميل الملاحظات…" />;
  } else if (notes.error) {
    list = (
      <ErrorState
        isBoxed={false}
        title="تعذّر تحميل الملاحظات"
        description={notes.error.message}
        action={
          <Button variant="outline" onClick={() => void notes.refetch()}>
            إعادة المحاولة
          </Button>
        }
      />
    );
  } else if (notes.data.length === 0) {
    list = (
      <EmptyState isBoxed={false} icon={<NotebookPen />} title="لا توجد ملاحظات لهذا الطفل بعد" />
    );
  } else {
    list = (
      <ul className={styles.list} aria-label="الملاحظات">
        {notes.data.map((note) => (
          <NoteCard key={note.id} childId={childId} note={note} canEdit />
        ))}
      </ul>
    );
  }

  return (
    <Card as="section" className={styles.section} aria-labelledby={headingId}>
      <SectionHeader id={headingId} title="ملاحظات المعلم" icon={NotebookPen} />
      <ApiErrorAlert error={create.error} />
      <NoteForm
        label="ملاحظة جديدة"
        submitLabel="حفظ الملاحظة"
        isSubmitting={create.isPending}
        onSubmit={async (content) => {
          await create.mutateAsync(content);
        }}
      />
      {list}
    </Card>
  );
}
