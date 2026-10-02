import { FilePlus2, FileText, SearchX } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';

import { EmptyState } from '@/components/shared/EmptyState';
import { PageBanner } from '@/components/shared/PageBanner';
import { SearchField } from '@/components/shared/SearchField';
import { getButtonClassName } from '@/components/ui/Button';
import { canCreateReports } from '@/constants/routes';
import { useRoleArea } from '@/hooks/useRoleArea';

import { FilterChips, type FilterChipOption } from '../components/FilterChips';
import { ReportCard } from '../components/ReportCard';
import { REPORT_TYPE_FILTER_LABELS, REPORT_TYPES } from '../constants';
import { getVisibleReports } from '../mock/reports.mock';
import type { ChildReport, ReportType } from '../types';

import styles from './ReportsListPage.module.css';

type TypeFilter = 'all' | ReportType;

const SUBTITLE: Record<'Parent' | 'Staff', string> = {
  Parent: 'تقارير الأخصائي عن أطفالك وتوصياته للمتابعة.',
  Staff: 'تقارير الأطفال الذين تتابعهم: ملاحظات وتوصيات.',
};

function matchesSearch(report: ChildReport, query: string): boolean {
  if (!query) return true;
  return report.childName.includes(query) || report.title.includes(query);
}

/** Replit reports list — neutral type filter instead of risk levels, child name on each card. */
export function ReportsListPage() {
  const { role, paths } = useRoleArea();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  const reports = getVisibleReports(role);
  const trimmedQuery = query.trim();
  const searched = reports.filter((report) => matchesSearch(report, trimmedQuery));
  const visible =
    typeFilter === 'all' ? searched : searched.filter((report) => report.type === typeFilter);

  const filterOptions: FilterChipOption<TypeFilter>[] = [
    { value: 'all', label: 'الكل', count: searched.length },
    ...REPORT_TYPES.map((type) => ({
      value: type,
      label: REPORT_TYPE_FILTER_LABELS[type],
      count: searched.filter((report) => report.type === type).length,
    })),
  ];

  const createLink = canCreateReports(role) ? (
    <Link to={paths.reportCreate} className={getButtonClassName({ variant: 'soft' })}>
      <FilePlus2 aria-hidden="true" />
      تقرير جديد
    </Link>
  ) : null;

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

      {reports.length === 0 ? (
        <EmptyState
          icon={<FileText />}
          title="لا توجد تقارير بعد"
          description="ستظهر هنا التقارير التي يضيفها الأخصائي."
        />
      ) : (
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
            <FilterChips
              label="تصفية حسب نوع التقرير"
              options={filterOptions}
              value={typeFilter}
              onChange={setTypeFilter}
            />
          </div>

          {visible.length === 0 ? (
            <EmptyState
              icon={<SearchX />}
              title="لا توجد نتائج"
              description="جرّب كلمة بحث أخرى أو نوعاً آخر من التقارير."
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
      )}
    </div>
  );
}
