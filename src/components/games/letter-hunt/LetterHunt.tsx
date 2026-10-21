import { nextChoiceSelection } from '@/components/players';

import { GameOptionCard } from '../shared/GameOptionCard';
import styles from '../shared/Game.module.css';
import type { ChallengeProps } from '../types';

/**
 * صيد الحروف — one real SingleChoice question as big letter cards. Tapping a card selects it
 * (replacing the previous choice); the runner sends it as `selectedOptionId`.
 */
export function LetterHunt({ question, selection, onSelectionChange, disabled }: ChallengeProps) {
  return (
    <ul className={styles.optionGrid} aria-label="البطاقات">
      {question.options.map((option, index) => (
        <li key={option.id}>
          <GameOptionCard
            option={option}
            index={index}
            look="letter"
            isSelected={selection.includes(option.id)}
            disabled={disabled}
            onPress={() => {
              onSelectionChange(nextChoiceSelection('SingleChoice', selection, option.id));
            }}
          />
        </li>
      ))}
    </ul>
  );
}
