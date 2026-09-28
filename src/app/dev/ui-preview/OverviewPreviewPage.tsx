import { Baby, CircleCheck, FileText, TriangleAlert } from 'lucide-react';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { PageBanner } from '@/components/shared/PageBanner';
import { SearchField } from '@/components/shared/SearchField';
import { StatCard } from '@/components/shared/StatCard';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button, getButtonClassName } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

import styles from './preview.module.css';

const SAMPLE_CARDS = ['بطاقة مثال أ', 'بطاقة مثال ب', 'بطاقة مثال ج'] as const;

export function OverviewPreviewPage() {
  return (
    <div className={styles.page}>
      <PageBanner
        eyebrow="بيانات تجريبية للمعاينة فقط"
        title="مرحباً بك"
        subtitle="معاينة لتخطيط لوحة التحكم ومكوناتها الأساسية."
        actions={
          <>
            <Button variant="outline">إجراء أساسي</Button>
            <a href="#cards" className={getButtonClassName({ variant: 'soft' })}>
              إجراء ثانوي
            </a>
          </>
        }
      />

      <section className={styles.section} aria-labelledby="stats-title">
        <h2 id="stats-title" className={styles.sectionTitle}>
          بطاقات الإحصاء (قيم تجريبية)
        </h2>
        <div className={styles.statGrid}>
          <StatCard label="عنصر أ" value="—" icon={Baby} />
          <StatCard label="عنصر ب" value="—" icon={CircleCheck} tone="success" />
          <StatCard label="عنصر ج" value="—" icon={FileText} tone="warning" />
          <StatCard label="عنصر د" value="—" icon={TriangleAlert} tone="danger" />
        </div>
      </section>

      <section id="cards" className={styles.section} aria-labelledby="cards-title">
        <h2 id="cards-title" className={styles.sectionTitle}>
          شبكة البطاقات
        </h2>
        <SearchField label="بحث" placeholder="ابحث بالاسم…" />
        <ul className={styles.cardGrid} role="list">
          {SAMPLE_CARDS.map((title) => (
            <Card as="li" key={title} isInteractive className={styles.stack}>
              <div className={styles.row}>
                <Avatar name={title} size="lg" shape="circle" />
                <div>
                  <h3 className={styles.cardTitle}>{title}</h3>
                  <p className={styles.muted}>وصف مختصر للبطاقة.</p>
                </div>
              </div>
              <div className={styles.row}>
                <Badge tone="success" hasDot>
                  حالة
                </Badge>
                <Badge tone="primary">وسم</Badge>
              </div>
              <Button variant="soft" fullWidth>
                عرض التفاصيل
              </Button>
            </Card>
          ))}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="states-title">
        <h2 id="states-title" className={styles.sectionTitle}>
          حالات الصفحة
        </h2>
        <EmptyState title="لا توجد عناصر بعد" description="ستظهر العناصر هنا عند إضافتها." />
        <ErrorState title="تعذّر تحميل البيانات" description="يرجى المحاولة مرة أخرى." />
        <LoadingState />
      </section>
    </div>
  );
}
