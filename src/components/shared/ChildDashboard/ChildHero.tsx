import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Avatar } from '@/components/ui/Avatar';
import { ProgressBar } from '@/components/ui/Feedback';

import styles from './ChildHero.module.css';

export interface ChildHeroFact {
  icon: LucideIcon;
  label: string;
}

/** Completion of the child's training plan, derived from the real plan rows. */
export interface ChildHeroProgress {
  /** 0–100. */
  percent: number;
  completed: number;
  total: number;
}

export interface ChildHeroProps {
  name: string;
  /** Short context line above the name (e.g. "ملف الطفل"). */
  eyebrow?: string;
  /** Real child facts only (age, gender, parent, …) — missing ones are simply left out. */
  facts: readonly ChildHeroFact[];
  /** Null / absent → no progress block (never a fake 0 %). */
  progress?: ChildHeroProgress | null | undefined;
  actions?: ReactNode;
}

/**
 * Dashboard-style child header (client revision 2026-10, shared by the Parent, Teacher and
 * Specialist child pages): brand cover band, avatar, name, fact chips, actions and — when the plan
 * has activities — its completion with the shared progress bar.
 */
export function ChildHero({ name, eyebrow, facts, progress, actions }: ChildHeroProps) {
  return (
    <header className={styles.hero}>
      <div className={styles.cover} aria-hidden="true" />
      <div className={styles.body}>
        <Avatar name={name} size="xl" shape="circle" className={styles.avatar} />
        <div className={styles.identity}>
          {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
          <h1 className={styles.name}>{name}</h1>
          {facts.length > 0 ? (
            <ul className={styles.facts} aria-label="بيانات الطفل">
              {facts.map((fact) => (
                <li key={fact.label} className={styles.fact}>
                  <fact.icon aria-hidden="true" />
                  {fact.label}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>
      {progress ? (
        <section className={styles.progress} aria-labelledby="child-hero-progress">
          <div className={styles.progressHead}>
            <h2 id="child-hero-progress" className={styles.progressTitle}>
              نسبة إنجاز الخطة التدريبية
            </h2>
            <span className={styles.percent} aria-hidden="true">
              <bdi>{`${progress.percent.toString()}%`}</bdi>
            </span>
          </div>
          <ProgressBar
            label="نسبة إنجاز الخطة التدريبية"
            value={progress.percent}
            max={100}
            tone="success"
            valueText={`${progress.completed.toString()} من ${progress.total.toString()} أنشطة منجزة`}
          />
          <p className={styles.progressText}>
            {`${progress.completed.toString()} من ${progress.total.toString()} أنشطة منجزة`}
          </p>
        </section>
      ) : null}
    </header>
  );
}
