import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';

import { cx } from '@/utils/classNames';

import styles from './Tabs.module.css';

export interface TabItem<TValue extends string> {
  value: TValue;
  label: string;
  count?: number;
  icon?: ReactNode;
}

export interface TabsProps<TValue extends string> {
  label: string;
  items: readonly TabItem<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
  /** Content of the selected tab's panel. */
  children: ReactNode;
  className?: string;
}

/**
 * Accessible tab list (WAI-ARIA tabs pattern, automatic activation).
 * Arrow keys follow the visual order in RTL: ArrowLeft → next, ArrowRight → previous.
 * The selected tab's panel (`children`) is rendered below and linked via ARIA.
 */
export function Tabs<TValue extends string>({
  label,
  items,
  value,
  onChange,
  children,
  className,
}: TabsProps<TValue>) {
  const baseId = useId();
  const tabRefs = useRef(new Map<TValue, HTMLButtonElement>());

  const focusAt = (index: number) => {
    const count = items.length;
    const item = items[(index + count) % count];
    if (!item) return;
    onChange(item.value);
    tabRefs.current.get(item.value)?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const keyActions: Partial<Record<string, () => void>> = {
      ArrowLeft: () => {
        focusAt(index + 1);
      },
      ArrowRight: () => {
        focusAt(index - 1);
      },
      Home: () => {
        focusAt(0);
      },
      End: () => {
        focusAt(items.length - 1);
      },
    };
    const action = keyActions[event.key];
    if (action) {
      event.preventDefault();
      action();
    }
  };

  return (
    <div className={cx(styles.root, className)}>
      <div role="tablist" aria-label={label} className={styles.list}>
        {items.map((item, index) => {
          const isSelected = item.value === value;
          return (
            <button
              key={item.value}
              ref={(node) => {
                if (node) tabRefs.current.set(item.value, node);
                else tabRefs.current.delete(item.value);
              }}
              type="button"
              role="tab"
              id={tabId(baseId, item.value)}
              aria-selected={isSelected}
              aria-controls={isSelected ? panelId(baseId, item.value) : undefined}
              tabIndex={isSelected ? 0 : -1}
              className={styles.tab}
              onClick={() => {
                onChange(item.value);
              }}
              onKeyDown={(event) => {
                handleKeyDown(event, index);
              }}
            >
              {item.icon}
              {item.label}
              {item.count === undefined ? null : <span className={styles.count}>{item.count}</span>}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={panelId(baseId, value)}
        aria-labelledby={tabId(baseId, value)}
        tabIndex={0}
        className={styles.panel}
      >
        {children}
      </div>
    </div>
  );
}

function tabId(baseId: string, value: string) {
  return `${baseId}-tab-${value}`;
}

function panelId(baseId: string, value: string) {
  return `${baseId}-panel-${value}`;
}
