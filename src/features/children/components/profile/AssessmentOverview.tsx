import { ClipboardCheck, Eye } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';

import { DashboardPanel } from '@/components/shared/ChildDashboard';
import { AssessmentStatusCard } from '@/components/shared/ChildDashboard';
import { Button, getButtonClassName } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { AssessmentStatus } from '@/hooks/api/assessmentStatus';

import { AssessmentResultView } from './AssessmentResultView';
import styles from './AssessmentOverview.module.css';

/** The API groups the initial result by category, not by activity; dates are not supplied. */
export function AssessmentOverview({
  status,
  detailsTo,
}: {
  status: AssessmentStatus;
  detailsTo: string;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  if (status.state !== 'complete') return <AssessmentStatusCard status={status} to={detailsTo} />;
  const result = status.result;
  const category = result.categories.find((item) => item.name === expanded);
  return (
    <DashboardPanel
      id="initial-assessment-overview"
      title="التقييم المبدئي"
      icon={ClipboardCheck}
      action={
        <Link to={detailsTo} className={getButtonClassName({ variant: 'soft', size: 'sm' })}>
          عرض التقييم كاملاً
        </Link>
      }
    >
      <p className={styles.subtitle}>
        نتيجة التقييم المبدئي حسب التصنيفات، وإجابات الطفل المحفوظة.
      </p>
      <div className={styles.scroll} role="region" aria-label="نتائج التقييم المبدئي" tabIndex={0}>
        <table className={styles.table}>
          <caption>{`النتيجة العامة: ${Math.round(result.overallScore).toString()}%`}</caption>
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">التصنيف</th>
              <th scope="col">النتيجة</th>
              <th scope="col">الحالة</th>
              <th scope="col">الإجابات الصحيحة</th>
              <th scope="col">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {result.categories.map((item, index) => (
              <tr key={item.name}>
                <td>{(index + 1).toString()}</td>
                <th scope="row">{item.name}</th>
                <td>
                  <bdi>{`${Math.round(item.percentage).toString()}%`}</bdi>
                </td>
                <td>
                  <Badge tone="success">مكتمل</Badge>
                </td>
                <td>
                  {item.correctAnswers !== null && item.totalQuestions !== null
                    ? `${item.correctAnswers.toString()} من ${item.totalQuestions.toString()}`
                    : '—'}
                </td>
                <td>
                  <Button
                    variant="soft"
                    size="sm"
                    iconStart={<Eye aria-hidden="true" />}
                    aria-expanded={expanded === item.name}
                    onClick={() => {
                      setExpanded(expanded === item.name ? null : item.name);
                    }}
                  >
                    عرض التفاصيل
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {category ? (
        <AssessmentResultView result={{ ...result, categories: [category] }} isExpanded />
      ) : null}
    </DashboardPanel>
  );
}
