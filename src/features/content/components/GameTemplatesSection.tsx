import { Plus, Shapes } from 'lucide-react';

import { REAL_GAME_LIST } from '@/components/games';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Button } from '@/components/ui/Button';

import styles from './content.module.css';

/**
 * «قوالب الألعاب» (client revision 2026-11): the five real games, each with an explicit «إنشاء
 * لعبة». Nothing is created automatically: the button opens the normal form with the game chosen;
 * the Admin saves it to the backend and assigns it from the plan as before. Older templates stay
 * playable for existing activities but are no longer offered for new ones.
 */
export function GameTemplatesSection({ onCreate }: { onCreate: (template: string) => void }) {
  return (
    <section className={styles.page} aria-labelledby="game-templates">
      <SectionHeader id="game-templates" title="قوالب الألعاب" icon={Shapes} iconTone="violet" />
      <p className={styles.muted}>
        اختر لعبة لإنشائها. كل لعبة جاهزة بمحتوى ومستويات سهل / متوسط / صعب، ولا تحتاج إلى أسئلة.
      </p>
      <ul className={styles.templateGrid} aria-label="قوالب الألعاب">
        {REAL_GAME_LIST.map((game) => (
          <li key={game.slug} className={styles.templateCard}>
            <span className={styles.templateIcon} aria-hidden="true">
              <game.icon />
            </span>
            <div className={styles.rowMain}>
              <h2 className={styles.rowTitle}>{game.name}</h2>
              <p className={styles.muted}>{game.tagline}</p>
              <p className={styles.typeSkill}>{`المهارة: ${game.skill}`}</p>
            </div>
            <Button
              variant="soft"
              size="sm"
              iconStart={<Plus aria-hidden="true" />}
              aria-label={`إنشاء لعبة من قالب ${game.name}`}
              onClick={() => {
                onCreate(game.slug);
              }}
            >
              إنشاء لعبة
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
