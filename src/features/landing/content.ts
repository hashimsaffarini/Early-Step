import { Activity, Heart, Trophy, type LucideIcon } from 'lucide-react';

/**
 * Landing copy from the Replit prototype. Its fabricated or unverifiable claims
 * ("+85% تحسّن", "آمن 100%", "تقارير ذكاء اصطناعي", "تحليل ذكي ودقيق", a fixed age range) are
 * replaced by text that describes what the product actually does.
 */
export const LANDING_COPY = {
  nav: { login: 'تسجيل الدخول', start: 'ابدأ الآن' },
  hero: {
    titleLine1: 'اكتشف إمكانات',
    titleLine2Start: 'طفلك',
    titleConjunction: 'و',
    titleHighlight: 'طوّر قدراته',
    titleLine2End: 'بسهولة',
    description:
      'منصة تفاعلية ممتعة تساعد على اكتشاف صعوبات التعلم مبكراً من خلال ألعاب واختبارات، مع تقارير ومتابعة من الأخصائي للأهالي والمعلمين.',
    features: ['ألعاب واختبارات تفاعلية', 'تقييم مبدئي يراجعه أخصائي', 'توصيات ومتابعة مستمرة'],
    primaryCta: 'سجل مجاناً',
    secondaryCta: 'تسجيل الدخول',
    imageAlt: 'أمّ تبتسم بجانب طفلها وهو يلعب نشاطاً تعليمياً مصوّراً على الطاولة',
    scrollHint: 'اكتشف المزيد',
  },
  cta: {
    title: 'جاهز لاكتشاف موهبة طفلك؟',
    description: 'ابدأ رحلتك اليوم وأعطِ طفلك الفرصة ليتألق',
    button: 'سجل الآن مجاناً',
  },
  footer: {
    description: 'منصة لاكتشاف صعوبات التعلم مبكراً',
    rights: 'جميع الحقوق محفوظة.',
  },
} as const;

export interface HighlightCard {
  id: 'play' | 'follow-up' | 'children';
  title: string;
  subtitle: string;
  icon: LucideIcon;
  tone: 'accent' | 'primary' | 'success';
}

/** Floating cards around the hero illustration (Replit layout, honest content). */
export const HIGHLIGHT_CARDS: readonly HighlightCard[] = [
  {
    id: 'play',
    title: 'ألعاب واختبارات',
    subtitle: 'تجربة ممتعة للطفل',
    icon: Trophy,
    tone: 'accent',
  },
  {
    id: 'follow-up',
    title: 'متابعة مستمرة',
    subtitle: 'تقارير للأهالي والمختصين',
    icon: Activity,
    tone: 'primary',
  },
  {
    id: 'children',
    title: 'مصممة للأطفال',
    subtitle: 'أنشطة ممتعة بلغة بسيطة',
    icon: Heart,
    tone: 'success',
  },
];
