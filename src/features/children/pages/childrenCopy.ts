import type { AreaRole } from '@/constants/routes';

interface ChildrenListCopy {
  title: string;
  subtitle: string;
  emptyTitle: string;
  emptyText: string;
}

/** Page copy per role: the parent manages their own children; staff follow assigned children. */
export const CHILDREN_LIST_COPY: Record<AreaRole, ChildrenListCopy> = {
  Parent: {
    title: 'أطفالي',
    subtitle: 'إدارة الملفات الشخصية ومتابعة التطور',
    emptyTitle: 'لا يوجد أطفال هنا',
    emptyText: 'قم بإضافة ملف طفل للبدء بالتقييم',
  },
  Teacher: {
    title: 'الأطفال',
    subtitle: 'الأطفال الذين تتابعهم في الفصل',
    emptyTitle: 'لا يوجد أطفال هنا',
    emptyText: 'لا توجد ملفات أطفال مرتبطة بحسابك',
  },
  Specialist: {
    title: 'الأطفال',
    subtitle: 'الأطفال المسندون إليك للتقييم والمتابعة',
    emptyTitle: 'لا يوجد أطفال هنا',
    emptyText: 'لا توجد ملفات أطفال مرتبطة بحسابك',
  },
  Admin: {
    title: 'الأطفال',
    subtitle: 'ملفات الأطفال في المنصة',
    emptyTitle: 'لا يوجد أطفال هنا',
    emptyText: 'لا توجد ملفات أطفال بعد',
  },
};

/** Back-link label from a profile to the list. */
export const BACK_TO_CHILDREN: Record<AreaRole, string> = {
  Parent: 'العودة إلى أطفالي',
  Teacher: 'العودة إلى الأطفال',
  Specialist: 'العودة إلى الأطفال',
  Admin: 'العودة إلى الأطفال',
};
