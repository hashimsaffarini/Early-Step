import { FilePlus2, FileText, SearchX } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { PageBanner } from '@/components/shared/PageBanner';
import { SearchField } from '@/components/shared/SearchField';
import { Button, getButtonClassName } from '@/components/ui/Button';
import { FormField, Select } from '@/components/ui/Field';
import { canCreateReports } from '@/constants/routes';
import { useRoleArea } from '@/hooks/useRoleArea';

import { useRoleReports, type ReportView } from '../api/reportsQueries';
import { ReportCard } from '../components/ReportCard';
import { ReportsBlocked } from '../components/ReportsBlocked';

import styles from './ReportsListPage.module.css';

const ALL_CHILDREN = '';

const SUBTITLE: Record<'Parent' | 'Staff', string> = {
  Parent: 'تقارير الأخصائي عن أطفالك وتوصياته للمتابعة.',
  Staff: 'تقارير الأطفال الذين تتابعهم: ملاحظات وتوصيات.',
};

function matchesSearch(report: ReportView, query: string): boolean {
  if (!query) return true;
  return report.childName.includes(query) || report.title.includes(query);
}

/** Reports list (real API). Child filter + search; no report types (the API has none). */
export function ReportsListPage() {
  const { role, paths } = useRoleArea();
  const [query, setQuery] = useState('');
  const [childFilter, setChildFilter] = useState(ALL_CHILDREN);
  const { isSupported, reports, isPending, error, refetch } = useRoleReports(role);

  const createLink = canCreateReports(role) ? (
    <Link to={paths.reportCreate} className={getButtonClassName({ variant: 'soft' })}>
      <FilePlus2 aria-hidden="true" />
      تقرير جديد
    </Link>
  ) : null;

  const childOptions = [
    ...new Map(
      reports
        .filter((report) => report.childId)
        .map((report) => [report.childId, report.childName]),
    ),
  ];
  const trimmedQuery = query.trim();
  const visible = reports
    .filter((report) => matchesSearch(report, trimmedQuery))
    .filter((report) => !childFilter || report.childId === childFilter);

  let content;
  if (!isSupported) {
    content = <ReportsBlocked />;
  } else if (isPending) {
    content = <LoadingState label="جارٍ تحميل التقارير…" />;
  } else if (error) {
    content = (
      <ErrorState
        title="تعذّر تحميل التقارير"
        description={error.message}
        action={
          <Button variant="outline" onClick={refetch}>
            إعادة المحاولة
          </Button>
        }
      />
    );
  } else if (reports.length === 0) {
    content = (
      <EmptyState
        icon={<FileText />}
        title="لا توجد تقارير بعد"
        description="ستظهر هنا التقارير التي يضيفها الأخصائي."
      />
    );
  } else {
    content = (
      <>
        <div className={styles.toolbar}>
          <SearchField
            label="البحث في التقارير"
            placeholder="ابحث باسم الطفل أو عنوان التقرير…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
            }}
          />
          {childOptions.length > 1 ? (
            <FormField label="الطفل">
              {(field) => (
                <Select
                  {...field}
                  value={childFilter}
                  onChange={(event) => {
                    setChildFilter(event.target.value);
                  }}
                >
                  <option value={ALL_CHILDREN}>كل الأطفال</option>
                  {childOptions.map(([id, name]) => (
                    <option key={id} value={id ?? ''}>
                      {name}
                    </option>
                  ))}
                </Select>
              )}
            </FormField>
          ) : null}
        </div>

        {visible.length === 0 ? (
          <EmptyState
            icon={<SearchX />}
            title="لا توجد نتائج"
            description="جرّب كلمة بحث أخرى أو طفلاً آخر."
          />
        ) : (
          <ul className={styles.grid} aria-label="قائمة التقارير">
            {visible.map((report) => (
              <li key={report.id}>
                <ReportCard report={report} detailPath={paths.reportDetail(report.id)} />
              </li>
            ))}
          </ul>
        )}
      </>
    );
  }

  return (
    <div className={styles.page}>
      <PageBanner
        tone="violet"
        title="التقارير"
        subtitle={SUBTITLE[role === 'Parent' ? 'Parent' : 'Staff']}
        actions={createLink}
        aside={
          <span className={styles.bannerIcon} aria-hidden="true">
            <FileText />
          </span>
        }
      />
      {content}
    </div>
  );
}
