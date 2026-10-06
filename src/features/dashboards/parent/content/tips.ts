import { HeartHandshake, Repeat, Timer } from 'lucide-react';

import type { ParentTip } from '../types';

/** Static, general (non-medical) guidance — product copy, not server data. */
export const PARENT_TIPS: readonly ParentTip[] = [
  {
    id: 'tip-follow-up',
    title: 'المتابعة المنتظمة',
    text: 'المتابعة المنتظمة تساعدك على فهم تطور طفلك بشكل أفضل.',
    icon: Repeat,
    tone: 'primary',
  },
  {
    id: 'tip-short-sessions',
    title: 'جلسات قصيرة وممتعة',
    text: 'الأنشطة القصيرة المتكررة أسهل على الطفل من الجلسات الطويلة.',
    icon: Timer,
    tone: 'success',
  },
  {
    id: 'tip-team',
    title: 'تواصل مع الفريق',
    text: 'شارك ملاحظاتك مع الأخصائي والمعلم عند الحاجة.',
    icon: HeartHandshake,
    tone: 'violet',
  },
];
