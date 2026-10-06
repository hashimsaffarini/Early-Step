import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Feedback';
import { IconButton } from '@/components/ui/IconButton';
import { ConfirmDialog } from '@/components/ui/Modal';
import { HTTP_STATUS } from '@/services/http/httpStatus';
import { formatDisplayDate } from '@/utils/dateFormat';

import { useDeleteNote, useNote, useUpdateNote } from '../api/notesQueries';

import { NoteForm } from './NoteForm';
import styles from './notes.module.css';

export interface NoteCardProps {
  noteId: string;
  /** Called after deletion (or when the server no longer has the note). */
  onRemoved: (noteId: string) => void;
}

/** One saved note, loaded from `GET Teacher/notes/{id}`, with edit and confirmed delete. */
export function NoteCard({ noteId, onRemoved }: NoteCardProps) {
  const note = useNote(noteId);
  const update = useUpdateNote(noteId);
  const remove = useDeleteNote();
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  if (note.isPending) {
    return (
      <Card as="li" className={styles.card}>
        <Spinner />
      </Card>
    );
  }

  if (note.error) {
    const isGone = note.error.status === HTTP_STATUS.NOT_FOUND;
    return (
      <Card as="li" className={styles.card}>
        <ApiErrorAlert
          error={note.error}
          message={isGone ? 'لم تعد هذه الملاحظة موجودة.' : undefined}
        />
        {isGone ? (
          <Button
            variant="ghost"
            onClick={() => {
              onRemoved(noteId);
            }}
          >
            إزالة من القائمة
          </Button>
        ) : (
          <Button variant="outline" onClick={() => void note.refetch()}>
            إعادة المحاولة
          </Button>
        )}
      </Card>
    );
  }

  const date = note.data.updatedAt ?? note.data.createdAt;

  return (
    <Card as="li" className={styles.card}>
      {isEditing ? (
        <>
          <ApiErrorAlert error={update.error} />
          <NoteForm
            label="تعديل الملاحظة"
            submitLabel="حفظ التعديل"
            initialContent={note.data.content}
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
          <p className={styles.content}>{note.data.content}</p>
          <div className={styles.cardFooter}>
            {date ? (
              <time className={styles.date} dateTime={date}>
                {formatDisplayDate(date.slice(0, 10))}
              </time>
            ) : (
              <span />
            )}
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
              onRemoved(noteId);
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
