import { ArrowLeft, Sparkles } from 'lucide-react';
import { Link } from 'react-router';

import { getButtonClassName } from '@/components/ui/Button';
import { ROUTE_PATHS } from '@/constants/routes';

import { LANDING_COPY } from '../content';

import styles from './CallToActionSection.module.css';

const { cta } = LANDING_COPY;

export interface CallToActionSectionProps {
  id: string;
}

export function CallToActionSection({ id }: CallToActionSectionProps) {
  return (
    <section id={id} className={styles.section} aria-labelledby={`${id}-title`}>
      <div className={styles.panel}>
        <Sparkles className={styles.icon} aria-hidden="true" />
        <h2 id={`${id}-title`} className={styles.title}>
          {cta.title}
        </h2>
        <p className={styles.description}>{cta.description}</p>
        <Link
          to={ROUTE_PATHS.register}
          className={getButtonClassName({ variant: 'accent', size: 'lg' })}
        >
          <Sparkles aria-hidden="true" />
          {cta.button}
          <ArrowLeft aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
