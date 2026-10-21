import { nextChoiceSelection } from '@/components/players';

import { GameOptionCard } from '../shared/GameOptionCard';
import styles from '../shared/Game.module.css';
import type { ChallengeProps } from '../types';

/**
 * طابق الرقم — one real SingleChoice question as large number cards. The numbers are the server's
 * options (nothing is counted or invented here); the choice is sent as `selectedOptionId`.
 */
export function NumberMatch({ question, selection, onSelectionChange, disabled }: ChallengeProps) {
  return (
    <ul className={styles.numberGrid} aria-label="بطاقات الأرقام">
      {question.options.map((option, index) => (
        <li key={option.id}>
          <GameOptionCard
            option={option}
            index={index}
            look="number"
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
