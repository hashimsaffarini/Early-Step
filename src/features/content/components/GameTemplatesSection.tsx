import { Plus, Shapes } from 'lucide-react';

import { GAME_TEMPLATE_LIST, type GameSlug } from '@/components/games';
import { CHOICE_TYPE_LABELS } from '@/components/players';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Button } from '@/components/ui/Button';

import styles from './content.module.css';

/**
 * «قوالب الألعاب» (client revision 2026-10): the four game templates with an explicit «إنشاء لعبة»
 * per template. Nothing is created automatically: the button opens the normal form with the
 * template chosen; the Admin enters the content and saves it to the backend.
 */
export function GameTemplatesSection({ onCreate }: { onCreate: (template: GameSlug) => void }) {
  return (
    <section className={styles.page} aria-labelledby="game-templates">
      <SectionHeader id="game-templates" title="قوالب الألعاب" icon={Shapes} iconTone="violet" />
      <p className={styles.muted}>
        اختر قالباً لإنشاء لعبة حقيقية، ثم أضف أسئلتها من صفحة اللعبة. يرى الطفل الأسئلة بواجهة
        القالب.
      </p>
      <ul className={styles.templateGrid} aria-label="قوالب الألعاب">
        {GAME_TEMPLATE_LIST.map((template) => (
          <li key={template.slug} className={styles.templateCard}>
            <span className={styles.templateIcon} aria-hidden="true">
              <template.icon />
            </span>
            <div className={styles.rowMain}>
              <h2 className={styles.rowTitle}>{template.name}</h2>
              <p className={styles.muted}>{template.purpose}</p>
              <p className={styles.muted}>
                {`الأسئلة: ${template.questionTypes.map((type) => CHOICE_TYPE_LABELS[type]).join('، ')}`}
              </p>
            </div>
            <Button
              variant="soft"
              size="sm"
              iconStart={<Plus aria-hidden="true" />}
              aria-label={`إنشاء لعبة من قالب ${template.name}`}
              onClick={() => {
                onCreate(template.slug);
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
