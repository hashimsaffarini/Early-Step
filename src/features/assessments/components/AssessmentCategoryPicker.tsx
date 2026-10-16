import { CircleCheck, Puzzle, Shapes, Sparkles, Star, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { getCategoryGradientClass } from '@/components/shared/CategoryTile';
import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { ServerImage } from '@/components/shared/ServerImage';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Feedback';
import type { ActivityCategory } from '@/constants/activityCategories';
import type { AppError } from '@/services/http/apiError';
import { cx } from '@/utils/classNames';

import type { AssessmentScope, CategoryProgress } from '../state/assessmentRun';
import type { AssessmentCategory } from '../types';

import styles from './AssessmentCategoryPicker.module.css';

/** Decorative colour + icon per card position (never tied to a category name). */
const CARD_TONES: readonly ActivityCategory[] = ['reading', 'math', 'memory', 'writing', 'logic'];
const CARD_ICONS: readonly LucideIcon[] = [Puzzle, Shapes, Star, Sparkles];

/** Key of a pending start: a category id, or `PLAY_ALL`. */
export const PLAY_ALL = 'all';

export interface CategoryCardModel {
  category: AssessmentCategory;
  /** Null until the assessment is started (the categories read has no question counts). */
  progress: CategoryProgress | null;
}

export interface AssessmentCategoryPickerProps {
  childName: string;
  cards: readonly CategoryCardModel[];
  isLoading: boolean;
  loadError: AppError | null;
  onRetry: () => void;
  /** `start` failure (e.g. the server has no assessment for this child). */
  startError: AppError | null;
  /** The card (category id) or `PLAY_ALL` whose start is in flight. */
  pendingKey: string | null;
  /** Shown after a category was finished. */
  notice: string | null;
  /** Shown in the empty state (back to the child profile). */
  exitAction: ReactNode;
  onSelect: (scope: AssessmentScope) => void;
}

interface CardState {
  status: string | null;
  action: string;
  isDone: boolean;
  isDisabled: boolean;
}

function cardState(progress: CategoryProgress | null): CardState {
  if (progress === null) return { status: null, action: 'العب', isDone: false, isDisabled: false };
  const { total, done } = progress;
  if (total === 0) {
    return { status: 'لا توجد أسئلة حالياً', action: 'العب', isDone: false, isDisabled: true };
  }
  if (done >= total) return { status: 'مكتمل', action: 'تم', isDone: true, isDisabled: true };
  if (done > 0) {
    return {
      status: `أُنجز ${done.toString()} من ${total.toString()}`,
      action: 'أكمل',
      isDone: false,
      isDisabled: false,
    };
  }
  return {
    status: `عدد الأسئلة: ${total.toString()}`,
    action: 'العب',
    isDone: false,
    isDisabled: false,
  };
}

/**
 * Initial-assessment start screen (client revision 2026-10, Replit "مرحباً يا …" picker): the
 * assessment's real categories as large cards, each playable on its own, plus "play all".
 */
export function AssessmentCategoryPicker({
  childName,
  cards,
  isLoading,
  loadError,
  onRetry,
  startError,
  pendingKey,
  notice,
  exitAction,
  onSelect,
}: AssessmentCategoryPickerProps) {
  let body: ReactNode;
  if (isLoading) {
    body = <LoadingState label="جارٍ تحميل التصنيفات…" />;
  } else if (loadError) {
    body = (
      <ErrorState
        title="تعذّر تحميل تصنيفات التقييم"
        description={loadError.message}
        action={<Button onClick={onRetry}>إعادة المحاولة</Button>}
      />
    );
  } else if (cards.length === 0) {
    body = (
      <EmptyState
        icon={<Shapes />}
        title="لا توجد تصنيفات في التقييم الأولي حالياً"
        description="ستظهر هنا التصنيفات عندما تضيفها إدارة المنصة إلى التقييم الأولي."
        action={exitAction}
      />
    );
  } else {
    body = (
      <>
        <ul className={styles.grid} aria-labelledby="assessment-pick-title">
          {cards.map(({ category, progress }, index) => {
            const state = cardState(progress);
            const Icon = CARD_ICONS[index % CARD_ICONS.length] ?? Puzzle;
            const tone = CARD_TONES[index % CARD_TONES.length] ?? 'neutral';
            const describedBy = `cat-${category.id}-desc`;
            return (
              <li key={category.id}>
                <button
                  type="button"
                  className={cx(styles.card, state.isDone && styles.cardDone)}
                  aria-label={`${state.action} «${category.name}»`}
                  aria-describedby={describedBy}
                  aria-busy={pendingKey === category.id}
                  disabled={state.isDisabled || pendingKey !== null}
                  onClick={() => {
                    onSelect({ kind: 'category', category });
                  }}
                >
                  <span
                    className={cx(styles.icon, getCategoryGradientClass(tone))}
                    aria-hidden="true"
                  >
                    <ServerImage
                      path={category.iconUrl}
                      alt=""
                      className={styles.iconImage}
                      fallback={<Icon />}
                    />
                  </span>
                  <span className={styles.cardTitle}>{category.name}</span>
                  <span id={describedBy} className={styles.cardText}>
                    {category.description ? <span>{category.description}</span> : null}
                    {state.status ? (
                      <span className={styles.status}>
                        {state.isDone ? <CircleCheck aria-hidden="true" /> : null}
                        {state.status}
                      </span>
                    ) : null}
                  </span>
                  <span className={styles.play} aria-hidden="true">
                    {pendingKey === category.id ? 'جارٍ البدء…' : state.action}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <Button
          variant="accent"
          size="lg"
          fullWidth
          className={styles.playAll}
          iconStart={<Sparkles aria-hidden="true" />}
          isLoading={pendingKey === PLAY_ALL}
          disabled={pendingKey !== null && pendingKey !== PLAY_ALL}
          onClick={() => {
            onSelect({ kind: 'all' });
          }}
        >
          العب الكل دفعة واحدة
        </Button>
      </>
    );
  }

  return (
    <div className={styles.intro}>
      <div className={styles.greeting}>
        <span className={styles.greetingEmoji} aria-hidden="true">
          🎯
        </span>
        <h2 className={styles.greetingTitle}>{`مرحباً يا ${childName}!`}</h2>
        <p id="assessment-pick-title" className={styles.pickTitle}>
          اختر لعبة أو تصنيفاً:
        </p>
        <p className={styles.greetingText}>
          العب كل تصنيف وحده، أو العبها كلها دفعة واحدة. لا يوجد وقت محدد، خذ وقتك.
        </p>
      </div>
      {notice ? <Alert tone="success">{notice}</Alert> : null}
      <ApiErrorAlert error={startError} />
      {body}
    </div>
  );
}
