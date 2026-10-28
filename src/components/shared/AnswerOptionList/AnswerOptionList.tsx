import { mediaKeys } from '@/services/media/localMedia';
import { ServerImage } from '@/components/shared/ServerImage';

import styles from './AnswerOptionList.module.css';

export interface AnswerOptionItem {
  id: string | null;
  text: string;
  /** Server path (`/uploads/...`), resolved against the API host by `ServerImage`. */
  imageUrl: string | null;
}

export interface AnswerOptionListProps {
  label: string;
  options: readonly AnswerOptionItem[];
  /** Sequence answers: numbered in the child's order. */
  isOrdered?: boolean;
}

/** Answer options from a result, with the server's picture when the option has one. */
export function AnswerOptionList({ label, options, isOrdered = false }: AnswerOptionListProps) {
  if (options.length === 0) {
    return <p className={styles.line}>{`${label}: —`}</p>;
  }
  const List = isOrdered ? 'ol' : 'ul';
  return (
    <div className={styles.line}>
      <span>{`${label}:`}</span>
      <List className={styles.options}>
        {options.map((option, index) => (
          <li key={option.id ?? index} className={styles.option}>
            {option.imageUrl || option.id ? (
              <ServerImage
                path={option.imageUrl}
                mediaKey={option.id ? mediaKeys.option(option.id) : undefined}
                alt={option.text ? '' : 'صورة الإجابة'}
                className={styles.image}
              />
            ) : null}
            {option.text ? <span>{option.text}</span> : null}
          </li>
        ))}
      </List>
    </div>
  );
}
