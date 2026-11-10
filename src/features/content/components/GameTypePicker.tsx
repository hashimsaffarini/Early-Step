import type { LucideIcon } from 'lucide-react';

import { cx } from '@/utils/classNames';

import styles from './content.module.css';

export interface GameTypeOption {
  slug: string;
  name: string;
  description: string;
  skill: string;
  icon: LucideIcon;
  /** An older template kept only for activities that already use it. */
  isLegacy?: boolean;
}

export interface GameTypePickerProps {
  options: readonly GameTypeOption[];
  value: string;
  onChange: (slug: string) => void;
}

/**
 * «نوع اللعبة» as visual cards (client revision 2026-11): icon, name, description and skill,
 * one native radio per card (arrow keys move between them; the selected card has a ✓ and text,
 * not colour alone).
 */
export function GameTypePicker({ options, value, onChange }: GameTypePickerProps) {
  return (
    <fieldset className={styles.typePicker}>
      <legend className={styles.typeLegend}>نوع اللعبة</legend>
      <div className={styles.typeGrid}>
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = option.slug === value;
          return (
            <label
              key={option.slug}
              className={cx(styles.typeCard, isSelected && styles.typeCardSelected)}
            >
              <input
                type="radio"
                name="game-type"
                value={option.slug}
                checked={isSelected}
                className={styles.typeRadio}
                onChange={() => {
                  onChange(option.slug);
                }}
              />
              <span className={styles.templateIcon} aria-hidden="true">
                <Icon />
              </span>
              <span className={styles.typeText}>
                <span className={styles.rowTitle}>{option.name}</span>
                <span className={styles.muted}>{option.description}</span>
                <span className={styles.typeSkill}>{`المهارة: ${option.skill}`}</span>
                {option.isLegacy ? (
                  <span className={styles.muted}>قالب سابق — متاح لهذا النشاط فقط</span>
                ) : null}
              </span>
              {isSelected ? <span className={styles.typeChosen}>✓ مختار</span> : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
