import { Gamepad2 } from 'lucide-react';

import { useRoleArea } from '@/hooks/useRoleArea';

import { ActivityCatalog } from '../components/ActivityCatalog';
import type { CatalogItem } from '../components/catalogTypes';
import { GAMES } from '../data/games';

/** Educational games catalogue (Replit `/games`). UI only — local demo content. */
export function GamesCatalogPage() {
  const { paths } = useRoleArea();
  const items: CatalogItem[] = GAMES.map((game) => ({
    id: game.id,
    title: game.title,
    description: game.description,
    category: game.category,
    emoji: game.emoji,
    difficulty: game.difficulty,
    meta: [],
    playTo: paths.gamePlay(game.id),
  }));

  return (
    <ActivityCatalog
      kind="game"
      items={items}
      banner={{
        title: 'الألعاب التعليمية',
        subtitle: 'تعلّم والعب في بيئة ممتعة ومفيدة.',
        eyebrow: '🎮 منطقة الألعاب',
        tone: 'sunset',
      }}
      playLabel="العب"
      emptyIcon={<Gamepad2 />}
      emptyTitle="لا توجد ألعاب في هذا التصنيف"
    />
  );
}
