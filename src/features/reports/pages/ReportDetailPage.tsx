import {
  ArrowRight,
  CalendarDays,
  CircleCheck,
  Download,
  FileSearch,
  FileText,
  ListChecks,
  Sprout,
  Star,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { Link, useParams } from 'react-router';

import { ComingSoonButton } from '@/components/shared/ComingSoonButton';
import { EmptyState } from '@/components/shared/EmptyState';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { getButtonClassName } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useRoleArea } from '@/hooks/useRoleArea';
import { formatDisplayDate } from '@/utils/dateFormat';

import { REPORT_TYPE_LABELS } from '../constants';
import { findVisibleReport } from '../mock/reports.mock';
import type { ChildReport } from '../types';

import styles from './ReportDetailPage.module.css';

const BACK_LABEL = 'العودة إلى التقارير';

interface Fact {
  label: string;
  value: string;
  icon: LucideIcon;
}

function getFacts(report: ChildReport): Fact[] {
  return [
    { label: 'الطفل', value: report.childName, icon: UserRound },
    { label: 'نوع التقرير', value: REPORT_TYPE_LABELS[report.type], icon: FileText },
    { label: 'التاريخ', value: formatDisplayDate(report.date), icon: CalendarDays },
    { label: 'كتبه', value: report.authorName, icon: UserRound },
  ];
}

/**
 * Replit report detail — the risk hero card (percentage, stars, risk scale) is replaced by a
 * neutral summary; sections keep the coloured cards and numbered recommendations.
 */
export function ReportDetailPage() {
  const { reportId = '' } = useParams();
  const { role, paths } = useRoleArea();
  const report = findVisibleReport(role, reportId);

  const backLink = (
    <Link to={paths.reports} className={styles.backLink}>
      <ArrowRight aria-hidden="true" />
      {BACK_LABEL}
    </Link>
  );

  if (!report) {
    return (
      <div className={styles.page}>
        {backLink}
        <EmptyState
          icon={<FileSearch />}
          title="لم يتم العثور على التقرير"
          description="قد يكون الرابط غير صحيح أو أن التقرير غير متاح لك."
          action={
            <Link to={paths.reports} className={getButtonClassName()}>
              {BACK_LABEL}
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <article className={styles.page} aria-labelledby="report-title">
      {backLink}
      <header className={styles.header}>
        <div>
          <h1 id="report-title" className={styles.title}>
            {report.title}
          </h1>
          <p className={styles.subtitle}>
            {report.childName} · {formatDisplayDate(report.date)}
          </p>
        </div>
        <ComingSoonButton variant="outline" size="md" iconStart={<Download aria-hidden="true" />}>
          تحميل PDF
        </ComingSoonButton>
      </header>

      <Card as="section" className={styles.summary} aria-labelledby="report-summary">
        <SectionHeader id="report-summary" title="ملخص التقرير" icon={FileText} iconTone="violet" />
        <dl className={styles.facts}>
          {getFacts(report).map((fact) => (
            <div key={fact.label} className={styles.fact}>
              <span className={styles.factIcon} aria-hidden="true">
                <fact.icon />
              </span>
              <div>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            </div>
          ))}
        </dl>
        <p className={styles.summaryText}>{report.summary}</p>
      </Card>

      <Card as="section" className={styles.section} aria-labelledby="report-strengths">
        <SectionHeader id="report-strengths" title="نقاط القوة" icon={Star} iconTone="success" />
        <ul className={styles.bullets}>
          {report.strengths.map((item) => (
            <li key={item} className={styles.bullet}>
              <CircleCheck className={styles.successIcon} aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </Card>

      <Card as="section" className={styles.section} aria-labelledby="report-areas">
        <SectionHeader
          id="report-areas"
          title="جوانب تحتاج إلى دعم"
          icon={Sprout}
          iconTone="accent"
        />
        <ul className={styles.bullets}>
          {report.areasToSupport.map((item) => (
            <li key={item} className={styles.bullet}>
              <Sprout className={styles.warningIcon} aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </Card>

      <Card as="section" className={styles.section} aria-labelledby="report-recommendations">
        <SectionHeader
          id="report-recommendations"
          title="التوصيات"
          icon={ListChecks}
          iconTone="violet"
        />
        <ol className={styles.recommendations}>
          {report.recommendations.map((item) => (
            <li key={item} className={styles.recommendation}>
              {item}
            </li>
          ))}
        </ol>
      </Card>

      <div className={styles.footer}>
        <Link to={paths.reports} className={getButtonClassName()}>
          {BACK_LABEL}
        </Link>
      </div>
    </article>
  );
}
