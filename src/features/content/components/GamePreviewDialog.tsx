import { useState } from 'react';
import {
  GameChallenge,
  GameStage,
  GAME_TEMPLATES,
  resolveGameTemplate,
  type GameQuestion,
} from '@/components/games';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Alert } from '@/components/ui/Feedback';
import type { ActivityDetail } from '../types';

/** Preview of real saved game content, with no submissions or locally invented scores. */
export function GamePreviewDialog({
  activity,
  onClose,
}: {
  activity: ActivityDetail;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [selection, setSelection] = useState<string[]>([]);
  const template = resolveGameTemplate(activity.slug) ?? GAME_TEMPLATES['spot-it'];
  const questions: GameQuestion[] = activity.questions.flatMap((question) =>
    question.type !== null && question.options.length > 0
      ? [{ ...question, type: question.type }]
      : [],
  );
  const question = questions[index];
  return (
    <Modal isOpen size="lg" title="معاينة اللعبة" onClose={onClose}>
      <p>هذه معاينة للمحتوى المحفوظ. لا تُسجَّل إجابات أو نتائج للأطفال أثناء المعاينة.</p>
      {questions.length !== activity.questions.length ? (
        <Alert tone="warning">بعض المستويات تحتاج إلى خيارات أو نوع سؤال مدعوم قبل تشغيلها.</Alert>
      ) : null}
      {question ? (
        <GameStage
          template={template}
          question={question}
          index={index}
          total={questions.length}
          footer={
            <Button
              onClick={() => {
                if (index === questions.length - 1) onClose();
                else {
                  setIndex(index + 1);
                  setSelection([]);
                }
              }}
            >
              {index === questions.length - 1 ? 'إغلاق المعاينة' : 'المستوى التالي'}
            </Button>
          }
        >
          <GameChallenge
            template={template}
            question={question}
            selection={selection}
            onSelectionChange={setSelection}
          />
        </GameStage>
      ) : (
        <p>أضف مستوى بخياراته أولاً لعرض اللعبة.</p>
      )}
    </Modal>
  );
}
