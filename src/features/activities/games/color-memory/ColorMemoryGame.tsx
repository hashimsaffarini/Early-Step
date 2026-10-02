import { Eye, Layers } from 'lucide-react';
import { useEffect, useState } from 'react';

import { FeedbackMessage, QuestionProgress, StatPill } from '@/components/players';
import { Button } from '@/components/ui/Button';
import sharedStyles from '@/features/activities/games/shared/game.module.css';
import { NextButton } from '@/features/activities/games/shared/NextButton';
import type { GameProps } from '@/features/activities/games/types';
import { cx } from '@/utils/classNames';

import { checkInput, extendSequence } from './colorLogic';
import styles from './ColorMemoryGame.module.css';
import { COLOR_MEMORY_LEVELS, COLOR_PADS, type ColorPadId } from './content';

const STEP_MS = 850;
const LIT_MS = 550;

type Phase = 'ready' | 'showing' | 'input' | 'passed' | 'mistake';

const FEEDBACK_BY_PHASE: Record<Phase, 'correct' | 'wrong' | null> = {
  ready: null,
  showing: null,
  input: null,
  passed: 'correct',
  mistake: 'wrong',
};

/**
 * Watch the pads light up, then repeat the order (Replit «صواني الألوان»). Each pad has a name and
 * a symbol so colour is never the only cue; the order can be replayed at any time without penalty.
 */
export function ColorMemoryGame({ onFinish, sound }: GameProps) {
  const [sequence, setSequence] = useState<ColorPadId[]>(() => extendSequence([]));
  const [input, setInput] = useState<ColorPadId[]>([]);
  const [phase, setPhase] = useState<Phase>('ready');
  const [litPad, setLitPad] = useState<ColorPadId | null>(null);
  const [firstTryLevels, setFirstTryLevels] = useState(0);
  const [hadMistake, setHadMistake] = useState(false);

  const level = sequence.length;
  const isLastLevel = level === COLOR_MEMORY_LEVELS;

  useEffect(() => {
    if (phase !== 'showing') return;
    const timers = sequence.flatMap((pad, index) => [
      window.setTimeout(() => {
        setLitPad(pad);
      }, index * STEP_MS),
      window.setTimeout(
        () => {
          setLitPad(null);
        },
        index * STEP_MS + LIT_MS,
      ),
    ]);
    timers.push(
      window.setTimeout(() => {
        setPhase('input');
      }, sequence.length * STEP_MS),
    );
    return () => {
      timers.forEach((timer) => {
        window.clearTimeout(timer);
      });
    };
  }, [phase, sequence]);

  const watch = () => {
    setInput([]);
    setPhase('showing');
  };

  const press = (pad: ColorPadId) => {
    if (phase !== 'input') return;
    const nextInput = [...input, pad];
    const check = checkInput(sequence, nextInput);
    setInput(nextInput);
    if (check === 'mistake') {
      sound.play('wrong');
      setHadMistake(true);
      setPhase('mistake');
    } else if (check === 'complete') {
      sound.play('correct');
      if (!hadMistake) setFirstTryLevels((count) => count + 1);
      setPhase('passed');
    } else {
      sound.play('tap');
    }
  };

  const nextLevel = () => {
    if (isLastLevel) {
      const firstTry = firstTryLevels;
      onFinish({
        correct: firstTry,
        total: COLOR_MEMORY_LEVELS,
        summary: `أكملت ${COLOR_MEMORY_LEVELS.toString()} مستويات، ${firstTry.toString()} منها من أول محاولة`,
      });
      return;
    }
    setSequence(extendSequence(sequence));
    setHadMistake(false);
    setInput([]);
    setPhase('ready');
  };

  const statusText: Record<Phase, string> = {
    ready: 'اضغط «شاهد الترتيب» وانتبه للصواني.',
    showing: 'انتبه… الصواني تضيء الآن.',
    input: `دورك! اضغط الصواني بالترتيب (${input.length.toString()} من ${level.toString()}).`,
    passed: '',
    mistake: '',
  };

  return (
    <div className={sharedStyles.game}>
      <QuestionProgress
        current={level}
        total={COLOR_MEMORY_LEVELS}
        noun="المستوى"
        extra={<StatPill icon={Layers}>{`الألوان: ${level.toString()}`}</StatPill>}
      />
      {statusText[phase] ? (
        <p className={styles.status} aria-live="polite">
          {statusText[phase]}
        </p>
      ) : null}
      <div className={styles.pads} role="group" aria-label="صواني الألوان">
        {COLOR_PADS.map((pad) => {
          const isLit = litPad === pad.id;
          return (
            <button
              key={pad.id}
              type="button"
              className={cx(styles.pad, styles[pad.id], isLit && styles.lit)}
              disabled={phase !== 'input'}
              aria-label={isLit ? `${pad.name} (يضيء)` : pad.name}
              onClick={() => {
                press(pad.id);
              }}
            >
              <span className={styles.symbol} aria-hidden="true">
                {pad.symbol}
              </span>
              <span className={styles.name} aria-hidden="true">
                {pad.name}
                {isLit ? <span className={styles.sparkle}> ✨</span> : null}
              </span>
            </button>
          );
        })}
      </div>
      <FeedbackMessage
        kind={FEEDBACK_BY_PHASE[phase]}
        text={phase === 'mistake' ? 'لا بأس! شاهد الترتيب مرة أخرى وحاول' : undefined}
      />
      <div className={sharedStyles.actions}>
        {phase === 'ready' || phase === 'mistake' ? (
          <Button size="lg" iconStart={<Eye aria-hidden="true" />} onClick={watch}>
            {phase === 'ready' ? 'شاهد الترتيب' : 'شاهد مرة أخرى'}
          </Button>
        ) : null}
        {phase === 'input' ? (
          <Button variant="ghost" size="sm" iconStart={<Eye aria-hidden="true" />} onClick={watch}>
            أعد العرض
          </Button>
        ) : null}
        {phase === 'passed' ? (
          <NextButton
            isLast={isLastLevel}
            onClick={nextLevel}
            label={isLastLevel ? 'إنهاء اللعبة' : 'المستوى التالي'}
          />
        ) : null}
      </div>
    </div>
  );
}
