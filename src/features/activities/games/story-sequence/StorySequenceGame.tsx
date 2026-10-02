import { ArrowDown, ArrowUp, Check, Star } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { FeedbackMessage, QuestionProgress, StatPill } from '@/components/players';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import sharedStyles from '@/features/activities/games/shared/game.module.css';
import { firstOf } from '@/features/activities/games/shared/firstOf';
import { NextButton } from '@/features/activities/games/shared/NextButton';
import type { GameProps } from '@/features/activities/games/types';
import { cx } from '@/utils/classNames';

import { STORIES, type StoryEvent } from './content';
import { correctPositions, moveItem, shuffleStory } from './storyLogic';
import styles from './StorySequenceGame.module.css';

type Direction = 'up' | 'down';

const FIRST_STORY = firstOf(STORIES);

/**
 * Put the story events in order (Replit «تسلسل القصة»). Replit was drag-only and crashed on
 * finish; here each event has «move up / move down» buttons and the game always reports its result.
 */
export function StorySequenceGame({ onFinish, sound }: GameProps) {
  const [storyIndex, setStoryIndex] = useState(0);
  const story = STORIES[storyIndex] ?? FIRST_STORY;
  const [order, setOrder] = useState<StoryEvent[]>(() => shuffleStory(story.events));
  const [marks, setMarks] = useState<boolean[] | null>(null);
  const [hadMistake, setHadMistake] = useState(false);
  const [correctStories, setCorrectStories] = useState(0);
  const [pendingFocus, setPendingFocus] = useState<{ id: string; direction: Direction } | null>(
    null,
  );
  const listRef = useRef<HTMLOListElement>(null);

  const isSolved = marks?.every(Boolean) ?? false;
  const isLast = storyIndex === STORIES.length - 1;

  useEffect(() => {
    if (!pendingFocus || !listRef.current) return;
    const { id, direction } = pendingFocus;
    const preferred = listRef.current.querySelector<HTMLButtonElement>(
      `[data-move="${id}-${direction}"]:not(:disabled)`,
    );
    const fallback = listRef.current.querySelector<HTMLButtonElement>(
      `[data-move^="${id}-"]:not(:disabled)`,
    );
    (preferred ?? fallback)?.focus();
  }, [pendingFocus, order]);

  const move = (index: number, direction: Direction) => {
    const event = order[index];
    if (!event || isSolved) return;
    sound.play('tap');
    setOrder(moveItem(order, index, direction === 'up' ? -1 : 1));
    setMarks(null);
    setPendingFocus({ id: event.id, direction });
  };

  const check = () => {
    const nextMarks = correctPositions(order, story.events);
    setMarks(nextMarks);
    if (nextMarks.every(Boolean)) {
      sound.play('correct');
      if (!hadMistake) setCorrectStories((count) => count + 1);
    } else {
      sound.play('wrong');
      setHadMistake(true);
    }
  };

  const next = () => {
    if (isLast) {
      onFinish({ correct: correctStories, total: STORIES.length });
      return;
    }
    const nextStory = STORIES[storyIndex + 1];
    if (!nextStory) return;
    setStoryIndex(storyIndex + 1);
    setOrder(shuffleStory(nextStory.events));
    setMarks(null);
    setHadMistake(false);
    setPendingFocus(null);
  };

  let feedbackKind: 'correct' | 'wrong' | null = null;
  if (marks) feedbackKind = isSolved ? 'correct' : 'wrong';

  return (
    <div className={sharedStyles.game}>
      <QuestionProgress
        current={storyIndex + 1}
        total={STORIES.length}
        noun="القصة"
        extra={
          <StatPill icon={Star} tone="accent">
            {`صحيح: ${correctStories.toString()}`}
          </StatPill>
        }
      />
      <h3 className={styles.title}>{story.title}</h3>
      <p className={sharedStyles.hint}>رتّب الأحداث من البداية إلى النهاية بالأسهم</p>
      <ol className={styles.list} ref={listRef} aria-label="أحداث القصة">
        {order.map((event, index) => {
          const mark = marks?.[index];
          return (
            <li
              key={event.id}
              className={cx(
                styles.row,
                mark === true && styles.rowCorrect,
                mark === false && styles.rowWrong,
              )}
            >
              <span className={styles.position} aria-hidden="true">
                {index + 1}
              </span>
              <span className={styles.emoji} aria-hidden="true">
                {event.emoji}
              </span>
              <span className={styles.text}>{event.text}</span>
              {mark === undefined ? null : (
                <span className={cx(styles.mark, mark ? styles.markCorrect : styles.markWrong)}>
                  {mark ? '✓ في مكانه' : '✗ ليس هنا'}
                </span>
              )}
              <span className={styles.moves}>
                <IconButton
                  label={`حرّك «${event.text}» للأعلى`}
                  icon={ArrowUp}
                  variant="outline"
                  data-move={`${event.id}-up`}
                  disabled={index === 0 || isSolved}
                  onClick={() => {
                    move(index, 'up');
                  }}
                />
                <IconButton
                  label={`حرّك «${event.text}» للأسفل`}
                  icon={ArrowDown}
                  variant="outline"
                  data-move={`${event.id}-down`}
                  disabled={index === order.length - 1 || isSolved}
                  onClick={() => {
                    move(index, 'down');
                  }}
                />
              </span>
            </li>
          );
        })}
      </ol>
      <FeedbackMessage
        kind={feedbackKind}
        text={isSolved ? 'أحسنت! القصة مرتبة' : 'بعض الأحداث في غير مكانها، حرّكها وحاول مرة أخرى'}
      />
      <div className={sharedStyles.actions}>
        {isSolved ? (
          <NextButton
            isLast={isLast}
            onClick={next}
            label={isLast ? 'إنهاء اللعبة' : 'القصة التالية'}
          />
        ) : (
          <Button size="lg" iconStart={<Check aria-hidden="true" />} onClick={check}>
            تحقق
          </Button>
        )}
      </div>
    </div>
  );
}
