import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { Card } from '@/components/ui/Card';
import { IconButton } from '@/components/ui/IconButton';
import { ConfirmDialog } from '@/components/ui/Modal';
import type { TeacherFeedback } from '@/services/api/teacherFeedback';
import { formatDisplayDate } from '@/utils/dateFormat';

import { useDeleteNote, useUpdateNote } from '../api/notesQueries';

import { NoteForm } from './NoteForm';
import styles from './notes.module.css';

export interface NoteCardProps {
  childId: string;
  note: TeacherFeedback;
  /** The teacher edits and deletes their notes; the specialist only reads them. */
  canEdit: boolean;
}

/** One note from the child's list, with edit and confirmed delete for the teacher. */
export function NoteCard({ childId, note, canEdit }: NoteCardProps) {
  const noteId = note.id;
  const update = useUpdateNote(childId, noteId);
  const remove = useDeleteNote(childId);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const date = note.createdAt;
  const isEditable = canEdit;

  return (
    <Card as="li" className={styles.card}>
      {isEditing ? (
        <>
          <ApiErrorAlert error={update.error} />
          <NoteForm
            label="تعديل الملاحظة"
            submitLabel="حفظ التعديل"
            initialContent={note.content}
            isSubmitting={update.isPending}
            onSubmit={async (content) => {
              await update.mutateAsync(content);
              setIsEditing(false);
            }}
            onCancel={() => {
              update.reset();
              setIsEditing(false);
            }}
          />
        </>
      ) : (
        <>
          <p className={styles.content}>{note.content}</p>
          <div className={styles.cardFooter}>
            {date ? (
              <time className={styles.date} dateTime={date}>
                {formatDisplayDate(date.slice(0, 10))}
              </time>
            ) : (
              <span />
            )}
            {isEditable ? (
              <div className={styles.cardActions}>
                <IconButton
                  label="تعديل الملاحظة"
                  icon={Pencil}
                  variant="muted"
                  onClick={() => {
                    setIsEditing(true);
                  }}
                />
                <IconButton
                  label="حذف الملاحظة"
                  icon={Trash2}
                  variant="danger"
                  onClick={() => {
                    setIsConfirming(true);
                  }}
                />
              </div>
            ) : null}
          </div>
          <ApiErrorAlert error={remove.error} />
        </>
      )}
      <ConfirmDialog
        isOpen={isConfirming}
        title="حذف الملاحظة"
        description="سيتم حذف هذه الملاحظة نهائياً ولا يمكن التراجع عن ذلك."
        confirmLabel="حذف"
        isConfirming={remove.isPending}
        onConfirm={() => {
          remove.mutate(noteId, {
            onSuccess: () => {
              setIsConfirming(false);
            },
            onError: () => {
              setIsConfirming(false);
            },
          });
        }}
        onCancel={() => {
          setIsConfirming(false);
        }}
      />
    </Card>
  );
}
