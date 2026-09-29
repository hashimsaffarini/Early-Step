import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Avatar } from '@/components/ui/Avatar';
import { cx } from '@/utils/classNames';

import styles from './ChildCard.module.css';

export type ChildCardTone = 'primary' | 'violet' | 'warning' | 'success';

export interface ChildCardDetail {
  icon: LucideIcon;
  label: string;
}

export interface ChildCardProps {
  name: string;
  subtitle?: string;
  /** Status element (usually a `Badge`) shown at the inline-end of the header. */
  status?: ReactNode;
  details?: readonly ChildCardDetail[];
  /** Extra content under the details (e.g. a progress bar). */
  children?: ReactNode;
  /** Action area at the bottom of the card. */
  footer?: ReactNode;
  tone?: ChildCardTone;
  headingLevel?: 2 | 3;
}

/** Child summary card (Replit child-card pattern). Purely presentational. */
export function ChildCard({
  name,
  subtitle,
  status,
  details = [],
  children,
  footer,
  tone = 'primary',
  headingLevel = 3,
}: ChildCardProps) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';

  return (
    <article className={styles.card}>
      <div className={styles.top}>
        <Avatar name={name} size="lg" className={cx(styles.avatar, styles[tone])} />
        {status}
      </div>
      <div>
        <Heading className={styles.name}>{name}</Heading>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </div>
      {details.length > 0 ? (
        <ul className={styles.details}>
          {details.map((detail) => (
            <li key={detail.label} className={styles.detail}>
              <detail.icon aria-hidden="true" />
              {detail.label}
            </li>
          ))}
        </ul>
      ) : null}
      {children}
      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </article>
  );
}
