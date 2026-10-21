import { ClipboardX, RotateCcw, UserX } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router';

import { PlayerShell } from '@/components/players';
import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Button, getButtonClassName } from '@/components/ui/Button';
import { useChildrenForRole } from '@/hooks/api/childResources';
import { useRoleArea } from '@/hooks/useRoleArea';

import { useCompleteAssessment, useStartAssessment } from '../api/assessmentMutations';
import { useAssessmentCategories } from '../api/assessmentQueries';
import { AssessmentCategoryPicker, PLAY_ALL } from '../components/AssessmentCategoryPicker';
import { AssessmentQuestionRunner, type RunProgress } from '../components/AssessmentQuestionRunner';
import { AssessmentResults } from '../components/AssessmentResults';
import { categoryProgress, questionsInScope, type AssessmentScope } from '../state/assessmentRun';

const TITLE = 'التقييم الأولي';
const EMOJI = '🎯';

/**
 * Initial assessment (Replit `/assessment/:id`) — full-screen, light child style.
 * Parent only: pick a category (or play all) → start → answer each question → complete (Swagger
 * `initial-assessment/*`). The flow ends with the submission; the saved result is for staff
 * (product decision 2026-10-14).
 */
export function AssessmentPage() {
  const { childId = '' } = useParams();
  const { role, paths } = useRoleArea();
  const profilePath = paths.childProfile(childId);
  const shell = { exitTo: profilePath, category: 'attention' as const, emoji: EMOJI };

  if (role !== 'Parent') {
    return (
      <PlayerShell {...shell} title={TITLE}>
        <EmptyState
          icon={<ClipboardX />}
          title="يبدأ ولي الأمر التقييم الأولي"
          description="يُجرى التقييم الأولي من حساب ولي أمر الطفل."
          action={
            <Link to={profilePath} className={getButtonClassName()}>
              العودة إلى ملف الطفل
            </Link>
          }
        />
      </PlayerShell>
    );
  }

  return <ParentAssessment childId={childId} />;
}

const scopeKey = (scope: AssessmentScope) => (scope.kind === 'all' ? PLAY_ALL : scope.category.id);

const addAll = (set: ReadonlySet<string>, ids: readonly string[]) => new Set([...set, ...ids]);

/**
 * Client revision 2026-10: the assessment's real categories (`GET initial-assessment/categories`)
 * are shown first. The first pick starts ONE server assessment (`start`, whose response groups the
 * questions by category); each pick then plays only the still-open questions of that category, or
 * of every category ("العب الكل دفعة واحدة"). Answers are final on the server, so finished
 * questions are never replayed. Once every question was played, the assessment is completed.
 */
function ParentAssessment({ childId }: { childId: string }) {
  const { paths } = useRoleArea();
  const children = useChildrenForRole('Parent');
  const categories = useAssessmentCategories();
  const start = useStartAssessment();
  const complete = useCompleteAssessment();
  const [scope, setScope] = useState<AssessmentScope | null>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [run, setRun] = useState(0);
  const [processed, setProcessed] = useState<ReadonlySet<string>>(new Set());
  const [answered, setAnswered] = useState<ReadonlySet<string>>(new Set());
  const [notice, setNotice] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const profilePath = paths.childProfile(childId);
  const shell = { exitTo: profilePath, category: 'attention' as const, emoji: EMOJI };

  if (children.isPending) {
    return (
      <PlayerShell {...shell} title={TITLE}>
        <LoadingState />
      </PlayerShell>
    );
  }
  if (children.isError) {
    return (
      <PlayerShell {...shell} title={TITLE}>
        <ErrorState
          title="تعذّر تحميل بيانات الطفل"
          description={children.error.message}
          action={<Button onClick={() => void children.refetch()}>إعادة المحاولة</Button>}
        />
      </PlayerShell>
    );
  }

  const child = children.data.find((item) => item.id === childId);
  if (!child) {
    return (
      <PlayerShell exitTo={paths.children} title={TITLE} category="attention" emoji={EMOJI}>
        <EmptyState
          icon={<UserX />}
          title="لم يتم العثور على الطفل"
          description="قد يكون الرابط غير صحيح أو أن الملف غير متاح."
          action={
            <Link to={paths.children} className={getButtonClassName()}>
              العودة إلى قائمة الأطفال
            </Link>
          }
        />
      </PlayerShell>
    );
  }

  const title = `${TITLE} · ${child.fullName}`;
  const assessment = start.data;
  const allQuestions = assessment?.questions ?? [];
  const backToProfile = (
    <Link to={profilePath} className={getButtonClassName()}>
      العودة إلى ملف الطفل
    </Link>
  );

  const play = (next: AssessmentScope) => {
    setNotice(null);
    setRun((count) => count + 1);
    setScope(next);
  };

  const select = (next: AssessmentScope) => {
    if (assessment) {
      play(next);
      return;
    }
    setPendingKey(scopeKey(next));
    start.mutate(childId, {
      onSuccess: () => {
        play(next);
      },
      onSettled: () => {
        setPendingKey(null);
      },
    });
  };

  /** Back to the picker, or — once every question was played — completes the assessment. */
  const endRun = (progress: RunProgress, isRunComplete: boolean) => {
    const nextProcessed = addAll(processed, progress.processed);
    setProcessed(nextProcessed);
    setAnswered(addAll(answered, progress.answered));
    setScope(null);
    if (!assessment) return;
    if (allQuestions.every((question) => nextProcessed.has(question.id))) {
      setIsFinished(true);
      complete.mutate(assessment.assessmentId);
      return;
    }
    if (isRunComplete && scope?.kind === 'category') {
      setNotice(`أحسنت! أنهيت «${scope.category.name}». اختر تصنيفاً آخر.`);
    }
  };

  const renderCompletion = (assessmentId: string | undefined) => {
    if (complete.isSuccess) {
      return (
        <AssessmentResults
          childName={child.fullName}
          answered={answered.size}
          profilePath={profilePath}
        />
      );
    }
    if (complete.isError && assessmentId) {
      return (
        <div>
          <ApiErrorAlert error={complete.error} />
          <Button
            size="lg"
            iconStart={<RotateCcw aria-hidden="true" />}
            onClick={() => {
              complete.mutate(assessmentId);
            }}
          >
            إعادة محاولة إنهاء التقييم
          </Button>
        </div>
      );
    }
    return <LoadingState label="جارٍ إرسال التقييم…" />;
  };

  const renderBody = () => {
    if (isFinished) return renderCompletion(assessment?.assessmentId);
    if (assessment && allQuestions.length === 0) {
      return (
        <EmptyState
          icon={<ClipboardX />}
          title="لا تتوفر أسئلة التقييم من الخادم حالياً"
          description="لم يُرسل الخادم أي سؤال لهذا التقييم. حاول لاحقاً أو تواصل مع إدارة المنصة."
          action={backToProfile}
        />
      );
    }
    if (!assessment || scope === null) {
      return (
        <AssessmentCategoryPicker
          childName={child.fullName}
          cards={(categories.data ?? []).map((category) => ({
            category,
            progress: assessment ? categoryProgress(allQuestions, category, processed) : null,
          }))}
          isLoading={categories.isPending}
          loadError={categories.error}
          onRetry={() => void categories.refetch()}
          startError={start.error}
          pendingKey={pendingKey}
          notice={notice}
          exitAction={backToProfile}
          onSelect={select}
        />
      );
    }
    const questions = questionsInScope(allQuestions, scope, processed);
    if (questions.length === 0) {
      return (
        <EmptyState
          icon={<ClipboardX />}
          title="لا توجد أسئلة في هذا التصنيف حالياً"
          description="لم يُرسل الخادم أسئلة لهذا التصنيف. اختر تصنيفاً آخر."
          action={
            <Button
              onClick={() => {
                setScope(null);
              }}
            >
              العودة إلى التصنيفات
            </Button>
          }
        />
      );
    }
    const remainingAfter = allQuestions.filter(
      (question) => !processed.has(question.id) && !questions.includes(question),
    ).length;
    return (
      <AssessmentQuestionRunner
        key={run}
        assessmentId={assessment.assessmentId}
        questions={questions}
        finishLabel={remainingAfter === 0 ? 'إنهاء التقييم' : 'إنهاء التصنيف'}
        onFinished={(progress) => {
          endRun(progress, true);
        }}
        onExit={(progress) => {
          endRun(progress, false);
        }}
      />
    );
  };

  return (
    <PlayerShell {...shell} title={title} width={scope ? 'player' : 'wide'}>
      {renderBody()}
    </PlayerShell>
  );
}
