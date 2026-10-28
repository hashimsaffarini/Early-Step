import { mediaKeys } from '@/services/media/localMedia';
import { ScanSearch, Eraser } from 'lucide-react';
import { nextChoiceSelection } from '@/components/players';
import { ServerImage } from '@/components/shared/ServerImage';
import { Button } from '@/components/ui/Button';
import { cx } from '@/utils/classNames';
import type { ChallengeProps } from '../types';
import { optionName } from '../shared/optionName';
import styles from './SpotIt.module.css';

/** A visual search board. Every tile is one real option; selection never reveals correctness. */
export function SpotIt({ question, selection, onSelectionChange, disabled }: ChallengeProps) {
  return (
    <div className={styles.game}>
      <div className={styles.mission}>
        <ScanSearch aria-hidden="true" />
        <strong>ابحث في اللوحة</strong>
        <span role="status">{`اخترت ${selection.length.toString()} من ${question.options.length.toString()}`}</span>
      </div>
      <ul className={styles.board} aria-label="لوحة البحث">
        {question.options.map((option, index) => {
          const selected = selection.includes(option.id);
          return (
            <li key={option.id}>
              <button
                type="button"
                className={cx(styles.tile, selected && styles.selected)}
                aria-label={`${optionName(option, index)}${selected ? ' — مختارة' : ''}`}
                aria-pressed={selected}
                disabled={disabled}
                onClick={() => {
                  onSelectionChange(nextChoiceSelection(question.type, selection, option.id));
                }}
              >
                <ServerImage
                  path={option.imageUrl}
                  mediaKey={mediaKeys.option(option.id)}
                  alt=""
                  className={styles.image}
                  fallback={
                    <span className={styles.symbol} aria-hidden="true">
                      {option.text || (index + 1).toString()}
                    </span>
                  }
                />
                {option.imageUrl && option.text ? (
                  <span className={styles.label}>{option.text}</span>
                ) : null}
                {selected ? (
                  <span className={styles.mark} aria-hidden="true">
                    ✓
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
      <Button
        size="sm"
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
  );
}
