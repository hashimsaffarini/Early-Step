import { ArrowRight, NotebookPen, UserX } from 'lucide-react';
import { useId } from 'react';
import { Link, useParams } from 'react-router';

import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { PageHeader } from '@/components/shared/PageHeader';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Button, getButtonClassName } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useChildFeedbacks, useChildrenForRole } from '@/hooks/api/childResources';
import { useRoleArea } from '@/hooks/useRoleArea';

import { useCreateNote } from '../api/notesQueries';
import { NoteCard } from '../components/NoteCard';
import { NoteForm } from '../components/NoteForm';
import styles from '../components/notes.module.css';

import pageStyles from './ChildNotesPage.module.css';

function NotesWorkspace({ childId }: { childId: string }) {
  const headingId = useId();
  const create = useCreateNote(childId);
  const notes = useChildFeedbacks(childId);

  let list;
  if (notes.isPending) {
    list = <LoadingState label="جارٍ تحميل الملاحظات…" />;
  } else if (notes.error) {
    list = (
      <ErrorState
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
    list = <EmptyState icon={<NotebookPen />} title="لا توجد ملاحظات لهذا الطفل بعد" />;
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
    <>
      <Card className={styles.card}>
        <ApiErrorAlert error={create.error} />
        <NoteForm
          label="ملاحظة جديدة"
          submitLabel="حفظ الملاحظة"
          isSubmitting={create.isPending}
          onSubmit={async (content) => {
            await create.mutateAsync(content);
          }}
        />
      </Card>

      <section className={pageStyles.section} aria-labelledby={headingId}>
        <SectionHeader id={headingId} title="ملاحظات الطفل" icon={NotebookPen} />
        {list}
      </section>
    </>
  );
}

/** Teacher feedback notes for one assigned child (`/teacher/children/:childId/notes`). */
export function ChildNotesPage() {
  const { childId = '' } = useParams();
  const { paths } = useRoleArea();
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
        <NotesWorkspace childId={child.id} />
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
