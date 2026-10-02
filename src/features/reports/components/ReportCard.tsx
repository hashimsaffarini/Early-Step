import { ArrowLeft, CalendarDays, FileText, Sprout, Star, UserRound } from 'lucide-react';
import { Link } from 'react-router';

import { Badge } from '@/components/ui/Badge';
import { getButtonClassName } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cx } from '@/utils/classNames';
import { formatDisplayDate } from '@/utils/dateFormat';

import { REPORT_TYPE_LABELS } from '../constants';
import type { ChildReport } from '../types';

import styles from './ReportCard.module.css';

/** How many observations each excerpt panel shows on the card. */
const EXCERPT_ITEMS = 2;

export interface ReportCardProps {
  report: ChildReport;
  detailPath: string;
}

/** Replit report list card — with the child's name (missing in Replit) and no risk data. */
export function ReportCard({ report, detailPath }: ReportCardProps) {
  const headingId = `report-card-${report.id}`;
  return (
    <Card
      as="article"
      aria-labelledby={headingId}
      className={cx(styles.card, report.type === 'initial-assessment' && styles.initialAssessment)}
    >
      <div className={styles.header}>
        <span className={styles.iconTile} aria-hidden="true">
          <FileText />
        </span>
        <div className={styles.heading}>
          <h2 id={headingId} className={styles.title}>
            {report.title}
          </h2>
          <p className={styles.child}>{report.childName}</p>
        </div>
        <Badge tone={report.type === 'follow-up' ? 'primary' : 'neutral'}>
          {REPORT_TYPE_LABELS[report.type]}
        </Badge>
      </div>

      <ul className={styles.meta}>
        <li>
          <CalendarDays aria-hidden="true" />
          {formatDisplayDate(report.date)}
        </li>
        <li>
          <UserRound aria-hidden="true" />
          {report.authorName}
        </li>
      </ul>

      <div className={styles.panels}>
        <div className={cx(styles.panel, styles.strengths)}>
          <h3 className={styles.panelTitle}>
            <Star aria-hidden="true" />
            نقاط القوة
          </h3>
          <ul className={styles.panelList}>
            {report.strengths.slice(0, EXCERPT_ITEMS).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className={cx(styles.panel, styles.areas)}>
          <h3 className={styles.panelTitle}>
            <Sprout aria-hidden="true" />
            جوانب تحتاج إلى دعم
          </h3>
          <ul className={styles.panelList}>
            {report.areasToSupport.slice(0, EXCERPT_ITEMS).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.footer}>
        <Link
          to={detailPath}
          className={getButtonClassName({ variant: 'soft', fullWidth: true })}
          aria-label={`عرض التقرير الكامل: ${report.title} — ${report.childName}`}
        >
          عرض التقرير الكامل
          <ArrowLeft aria-hidden="true" />
        </Link>
      </div>
    </Card>
  );
}
