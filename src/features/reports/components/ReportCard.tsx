import { ArrowLeft, CalendarDays, FileText, ListChecks, Sprout, UserRound } from 'lucide-react';
import { Link } from 'react-router';

import { getButtonClassName } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cx } from '@/utils/classNames';
import { formatDisplayDate } from '@/utils/dateFormat';

import type { ReportView } from '../api/reportsQueries';
import { toLines } from '../lines';

import styles from './ReportCard.module.css';

/** How many lines each excerpt panel shows on the card. */
const EXCERPT_ITEMS = 2;

export interface ReportCardProps {
  report: ReportView;
  detailPath: string;
}

/**
 * Replit report list card with only the API's real fields: title, child, date and author when
 * present, "جوانب تحتاج إلى دعم" (`weaknesses`) and "التوصيات" (`recommendations`).
 */
export function ReportCard({ report, detailPath }: ReportCardProps) {
  const headingId = `report-card-${report.id}`;
  const weaknesses = toLines(report.weaknesses).slice(0, EXCERPT_ITEMS);
  const recommendations = toLines(report.recommendations).slice(0, EXCERPT_ITEMS);
  const title = report.title || 'تقرير';

  return (
    <Card as="article" aria-labelledby={headingId} className={styles.card}>
      <div className={styles.header}>
        <span className={styles.iconTile} aria-hidden="true">
          <FileText />
        </span>
        <div className={styles.heading}>
          <h2 id={headingId} className={styles.title}>
            {title}
          </h2>
          {report.childName ? <p className={styles.child}>{report.childName}</p> : null}
        </div>
      </div>

      {report.createdAt || report.authorName ? (
        <ul className={styles.meta}>
          {report.createdAt ? (
            <li>
              <CalendarDays aria-hidden="true" />
              {formatDisplayDate(report.createdAt)}
            </li>
          ) : null}
          {report.authorName ? (
            <li>
              <UserRound aria-hidden="true" />
              {report.authorName}
            </li>
          ) : null}
        </ul>
      ) : null}

      <div className={styles.panels}>
        {weaknesses.length > 0 ? (
          <div className={cx(styles.panel, styles.areas)}>
            <h3 className={styles.panelTitle}>
              <Sprout aria-hidden="true" />
              جوانب تحتاج إلى دعم
            </h3>
            <ul className={styles.panelList}>
              {weaknesses.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {recommendations.length > 0 ? (
          <div className={cx(styles.panel, styles.recommendations)}>
            <h3 className={styles.panelTitle}>
              <ListChecks aria-hidden="true" />
              التوصيات
            </h3>
            <ul className={styles.panelList}>
              {recommendations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <div className={styles.footer}>
        <Link
          to={detailPath}
          className={getButtonClassName({ variant: 'soft', fullWidth: true })}
          aria-label={`عرض التقرير الكامل: ${title}${report.childName ? ` — ${report.childName}` : ''}`}
        >
          عرض التقرير الكامل
          <ArrowLeft aria-hidden="true" />
        </Link>
      </div>
    </Card>
  );
}
