import {
  BookOpen,
  Brain,
  Ear,
  Eye,
  Hash,
  LayoutGrid,
  Lightbulb,
  PenLine,
  type LucideIcon,
} from 'lucide-react';

/**
 * Skill categories used by the tests/games catalogues, the players and the initial assessment
 * (Replit `skillType`). Keys are display keys for the UI prototype — the backend's category
 * model (admin-managed categories with ids) replaces them when the API is integrated.
 */
export const ACTIVITY_CATEGORIES = [
  'memory',
  'reading',
  'math',
  'writing',
  'logic',
  'listening',
  'attention',
] as const;

export type ActivityCategory = (typeof ACTIVITY_CATEGORIES)[number];

export interface ActivityCategoryDisplay {
  label: string;
  icon: LucideIcon;
  emoji: string;
}

export const ACTIVITY_CATEGORY_DISPLAY: Record<ActivityCategory, ActivityCategoryDisplay> = {
  memory: { label: 'الذاكرة', icon: Brain, emoji: '🧠' },
  reading: { label: 'القراءة', icon: BookOpen, emoji: '📖' },
  math: { label: 'الرياضيات', icon: Hash, emoji: '🔢' },
  writing: { label: 'الكتابة', icon: PenLine, emoji: '✏️' },
  logic: { label: 'المنطق', icon: Lightbulb, emoji: '💡' },
  listening: { label: 'الاستماع', icon: Ear, emoji: '🎧' },
  attention: { label: 'الانتباه', icon: Eye, emoji: '👁️' },
};

/** "All" filter chip for catalogues. */
export const ALL_CATEGORIES_DISPLAY = { label: 'الكل', icon: LayoutGrid } as const;

export const ACTIVITY_DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export type ActivityDifficulty = (typeof ACTIVITY_DIFFICULTIES)[number];

export const ACTIVITY_DIFFICULTY_DISPLAY: Record<
  ActivityDifficulty,
  { label: string; tone: 'success' | 'warning' | 'danger' }
> = {
  easy: { label: 'سهل', tone: 'success' },
  medium: { label: 'متوسط', tone: 'warning' },
  hard: { label: 'صعب', tone: 'danger' },
};
