import { Eraser } from 'lucide-react';

import { nextChoiceSelection } from '@/components/players';
import { Button } from '@/components/ui/Button';

import { GameOptionCard } from '../shared/GameOptionCard';
import styles from '../shared/Game.module.css';
import type { ChallengeProps } from '../types';

/**
 * تحدي التركيز — one real MultiSelect question as a grid of cards the child can select and
 * unselect; «مسح الاختيار» clears it. The selected ids are sent as `selectedOptionIds`.
 */
export function FocusChallenge({
  question,
  selection,
  onSelectionChange,
  disabled,
}: ChallengeProps) {
  return (
    <div className={styles.focus}>
      <ul className={styles.focusGrid} aria-label="البطاقات">
        {question.options.map((option, index) => (
          <li key={option.id}>
            <GameOptionCard
              option={option}
              index={index}
              isSelected={selection.includes(option.id)}
              disabled={disabled}
              onPress={() => {
                onSelectionChange(nextChoiceSelection('MultiSelect', selection, option.id));
              }}
            />
          </li>
        ))}
      </ul>
      <div className={styles.controls}>
        <p className={styles.counter} role="status">
          {`اخترت ${selection.length.toString()} من ${question.options.length.toString()}`}
        </p>
        <Button
          variant="ghost"
          iconStart={<Eraser aria-hidden="true" />}
          disabled={disabled === true || selection.length === 0}
          onClick={() => {
            onSelectionChange([]);
          }}
        >
          مسح الاختيار
        </Button>
      </div>
    </div>
  );
}
