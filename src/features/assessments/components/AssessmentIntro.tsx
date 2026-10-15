import { Play } from 'lucide-react';

import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { Button } from '@/components/ui/Button';
import type { AppError } from '@/services/http/apiError';

import styles from './AssessmentIntro.module.css';

export interface AssessmentIntroProps {
  childName: string;
  isStarting: boolean;
  error: AppError | null;
  onStart: () => void;
}

/** Greeting + start button. Starting creates the assessment on the server, so it waits for a tap. */
export function AssessmentIntro({ childName, isStarting, error, onStart }: AssessmentIntroProps) {
  return (
    <div className={styles.intro}>
      <div className={styles.greeting}>
        <span className={styles.greetingEmoji} aria-hidden="true">
          🎯
        </span>
        <h2 className={styles.greetingTitle}>{`مرحباً يا ${childName}!`}</h2>
        <p className={styles.greetingText}>
          سنعرض عليك أسئلة قصيرة واحداً تلو الآخر. اختر الإجابة ثم اضغط «التالي». لا يوجد وقت محدد،
          خذ وقتك.
        </p>
      </div>
      <ApiErrorAlert error={error} />
      <Button
        size="lg"
        fullWidth
        className={styles.playAll}
        iconStart={<Play aria-hidden="true" />}
        isLoading={isStarting}
        onClick={onStart}
      >
        ابدأ التقييم
      </Button>
    </div>
  );
}
