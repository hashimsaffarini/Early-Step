import { Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { PageBanner } from '@/components/shared/PageBanner';
import { PageHeader } from '@/components/shared/PageHeader';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { BUTTON_VARIANTS, Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Alert, ProgressBar, Spinner } from '@/components/ui/Feedback';
import { IconButton } from '@/components/ui/IconButton';
import { ConfirmDialog, Modal } from '@/components/ui/Modal';
import { Tabs } from '@/components/ui/Tabs';

import styles from './preview.module.css';

const TAB_ITEMS = [
  { value: 'one', label: 'التبويب الأول' },
  { value: 'two', label: 'التبويب الثاني', count: 7 },
  { value: 'three', label: 'التبويب الثالث' },
] as const;

type TabValue = (typeof TAB_ITEMS)[number]['value'];

const SAMPLE_PROGRESS = 60;

export function ComponentsPreviewPage() {
  const [tab, setTab] = useState<TabValue>('one');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  return (
    <div className={styles.page}>
      <PageHeader
        title="المكونات الأساسية"
        subtitle="الأزرار والشارات والتبويبات والنوافذ."
        actions={<Button iconStart={<Plus aria-hidden="true" />}>إضافة</Button>}
      />

      <Card className={styles.section}>
        <h2 className={styles.sectionTitle}>الأزرار</h2>
        <div className={styles.row}>
          {BUTTON_VARIANTS.map((variant) => (
            <Button key={variant} variant={variant}>
              زر {variant}
            </Button>
          ))}
        </div>
        <div className={styles.row}>
          <Button size="sm">صغير</Button>
          <Button>متوسط</Button>
          <Button size="lg">كبير</Button>
          <Button isLoading>جارٍ الحفظ</Button>
          <Button disabled>معطّل</Button>
        </div>
        <div className={styles.row}>
          <IconButton label="تعديل" icon={Pencil} variant="muted" />
          <IconButton label="حذف" icon={Trash2} variant="danger" />
          <IconButton label="مفضّل" icon={Star} variant="outline" />
          <IconButton label="إضافة" icon={Plus} variant="primary" />
        </div>
      </Card>

      <Card className={styles.section}>
        <h2 className={styles.sectionTitle}>الشارات والصور الرمزية</h2>
        <div className={styles.row}>
          <Badge>محايد</Badge>
          <Badge tone="primary">أساسي</Badge>
          <Badge tone="success" hasDot>
            منخفض
          </Badge>
          <Badge tone="warning" hasDot>
            متوسط
          </Badge>
          <Badge tone="danger" hasDot>
            مرتفع
          </Badge>
          <Badge tone="accent">مميّز</Badge>
        </div>
        <div className={styles.row}>
          <Avatar name="سارة" size="sm" />
          <Avatar name="خالد" />
          <Avatar name="ليلى" size="lg" shape="circle" />
          <Avatar name="نور" size="xl" shape="circle" />
        </div>
      </Card>

      <Card className={styles.section}>
        <h2 className={styles.sectionTitle}>التبويبات</h2>
        <Tabs label="أقسام المثال" items={TAB_ITEMS} value={tab} onChange={setTab}>
          <p className={styles.muted}>
            محتوى التبويب المحدد: {TAB_ITEMS.find((item) => item.value === tab)?.label}
          </p>
        </Tabs>
      </Card>

      <Card className={styles.section}>
        <h2 className={styles.sectionTitle}>التقدّم والتنبيهات</h2>
        <ProgressBar label="نسبة الإنجاز" value={SAMPLE_PROGRESS} showLabel />
        <ProgressBar label="تقدّم ناجح" value={SAMPLE_PROGRESS} tone="success" />
        <div className={styles.row}>
          <Spinner size="sm" label="تحميل" />
          <Spinner label="تحميل" />
          <Spinner size="lg" label="تحميل" />
        </div>
        <Alert tone="info">رسالة معلومات.</Alert>
        <Alert tone="success">تم الحفظ بنجاح.</Alert>
        <Alert tone="warning">يرجى مراجعة البيانات.</Alert>
        <Alert tone="danger">حدث خطأ أثناء الحفظ.</Alert>
      </Card>

      <Card className={styles.section}>
        <h2 className={styles.sectionTitle}>النوافذ</h2>
        <div className={styles.row}>
          <Button
            variant="outline"
            onClick={() => {
              setIsModalOpen(true);
            }}
          >
            فتح نافذة
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setIsConfirmOpen(true);
            }}
          >
            تأكيد الحذف
          </Button>
        </div>
      </Card>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>الترويسات المتدرجة</h2>
        <PageBanner
          headingLevel={2}
          tone="violet"
          title="ترويسة بنفسجية"
          subtitle="للأخصائي والخطط."
        />
        <PageBanner
          headingLevel={2}
          tone="teal"
          title="ترويسة فيروزية"
          subtitle="للتقارير والأنشطة."
        />
        <PageBanner headingLevel={2} tone="sunset" title="ترويسة دافئة" subtitle="للألعاب." />
      </section>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        title="نافذة مثال"
        description="نص وصفي قصير للنافذة."
        footer={
          <Button
            onClick={() => {
              setIsModalOpen(false);
            }}
          >
            حسناً
          </Button>
        }
      >
        <p>محتوى النافذة.</p>
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="حذف العنصر"
        description="لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="حذف"
        onConfirm={() => {
          setIsConfirmOpen(false);
        }}
        onCancel={() => {
          setIsConfirmOpen(false);
        }}
      />
    </div>
  );
}
