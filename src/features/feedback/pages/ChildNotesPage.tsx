import { ArrowRight, NotebookPen, UserX } from 'lucide-react';
import { useId, useState } from 'react';
import { Link, useParams } from 'react-router';

import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { PageHeader } from '@/components/shared/PageHeader';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Button, getButtonClassName } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Feedback';
import { useChildrenForRole } from '@/hooks/api/childResources';
import { useRoleArea } from '@/hooks/useRoleArea';
import { useSession } from '@/services/session';

import { useCreateNote } from '../api/notesQueries';
import { NoteCard } from '../components/NoteCard';
import { NoteForm } from '../components/NoteForm';
import styles from '../components/notes.module.css';
import { useSessionNoteIds } from '../sessionNotes';

import pageStyles from './ChildNotesPage.module.css';

const HISTORY_NOTICE =
  'تظهر هنا الملاحظات التي أضفتها في هذه الجلسة فقط: لا يوفّر الخادم بعد طريقة لعرض الملاحظات السابقة للطفل.';

function NotesWorkspace({ childId, userId }: { childId: string; userId: string }) {
  const headingId = useId();
  const create = useCreateNote(childId);
  const { ids, add, remove } = useSessionNoteIds(userId, childId);
  const [unidentified, setUnidentified] = useState<string[]>([]);

  return (
    <>
      <Card className={styles.card}>
        <ApiErrorAlert error={create.error} />
        <NoteForm
          label="ملاحظة جديدة"
          submitLabel="حفظ الملاحظة"
          isSubmitting={create.isPending}
          onSubmit={async (content) => {
            const id = await create.mutateAsync(content);
            if (id) add(id);
            else setUnidentified((current) => [content, ...current]);
          }}
        />
      </Card>

      <section className={pageStyles.section} aria-labelledby={headingId}>
        <SectionHeader id={headingId} title="ملاحظاتي في هذه الجلسة" icon={NotebookPen} />
        <Alert tone="info">{HISTORY_NOTICE}</Alert>
        {unidentified.length > 0 ? (
          <Alert tone="warning">
            حُفظت ملاحظة لكن الخادم لم يُرجع معرّفها، لذا لا يمكن عرضها من الخادم أو تعديلها هنا.
          </Alert>
        ) : null}
        {ids.length === 0 ? (
          <EmptyState icon={<NotebookPen />} title="لم تُضِف ملاحظات في هذه الجلسة بعد" />
        ) : (
          <ul className={styles.list} aria-label="الملاحظات">
            {ids.map((id) => (
              <NoteCard key={id} noteId={id} onRemoved={remove} />
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

/** Teacher feedback notes for one assigned child (`/teacher/children/:childId/notes`). */
export function ChildNotesPage() {
  const { childId = '' } = useParams();
  const { paths } = useRoleArea();
  const session = useSession();
  const children = useChildrenForRole('Teacher');
  const child = children.data?.find((item) => item.id === childId);

  const backLink = (
    <Link
      to={child ? paths.childProfile(child.id) : paths.children}
      className={pageStyles.backLink}
    >
      <ArrowRight aria-hidden="true" />
      {child ? `العودة إلى ملف ${child.fullName}` : 'العودة إلى الأطفال'}
    </Link>
  );

  let body;
  if (children.isPending) {
    body = <LoadingState />;
  } else if (children.error) {
    body = (
      <ErrorState
        title="تعذّر تحميل بيانات الطفل"
        description={children.error.message}
        action={
          <Button variant="outline" onClick={() => void children.refetch()}>
            إعادة المحاولة
          </Button>
        }
      />
    );
  } else if (!child) {
    body = (
      <EmptyState
        icon={<UserX />}
        title="لم يتم العثور على الطفل"
        description="قد يكون الرابط غير صحيح أو أن الطفل غير مُسنَد إليك."
        action={
          <Link to={paths.children} className={getButtonClassName()}>
            العودة إلى الأطفال
          </Link>
        }
      />
    );
  } else {
    body = (
      <>
        <PageHeader
          title={`ملاحظات المعلم — ${child.fullName}`}
          subtitle="سجّل ملاحظاتك عن تقدّم الطفل في الخطة التدريبية."
        />
        <NotesWorkspace childId={child.id} userId={session?.user.id ?? 'anonymous'} />
      </>
    );
  }

  return (
    <div className={pageStyles.page}>
      {backLink}
      {body}
    </div>
  );
}
