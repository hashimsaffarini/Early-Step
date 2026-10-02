import { BrainCircuit } from 'lucide-react';

import { useRoleArea } from '@/hooks/useRoleArea';

import { ActivityCatalog } from '../components/ActivityCatalog';
import type { CatalogItem } from '../components/catalogTypes';
import { TESTS } from '../data/tests';

/** Interactive tests catalogue (Replit `/tests`). UI only — local demo content. */
export function TestsCatalogPage() {
  const { paths } = useRoleArea();
  const items: CatalogItem[] = TESTS.map((test) => ({
    id: test.id,
    title: test.title,
    description: test.description,
    category: test.category,
    emoji: test.emoji,
    difficulty: test.difficulty,
    meta: [`${test.questions.length.toString()} أسئلة`, `~${test.durationMinutes.toString()} د`],
    playTo: paths.testPlay(test.id),
  }));

  return (
    <ActivityCatalog
      kind="test"
      items={items}
      banner={{
        title: 'الاختبارات التفاعلية',
        subtitle: 'أسئلة قصيرة ومرحة تساعد على متابعة مهارات الطفل.',
        eyebrow: '🎯 اختبارات قصيرة',
        tone: 'teal',
      }}
      playLabel="ابدأ"
      emptyIcon={<BrainCircuit />}
      emptyTitle="لا توجد اختبارات في هذا التصنيف"
    />
  );
}
